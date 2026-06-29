import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

const JUDGE0_URL = "http://127.0.0.1:2358";
const LANGUAGE_IDS: Record<string, number> = { "c": 50, "c++": 54, "java": 62, "javascript": 63, "python": 71 };


// Production execution using Judge0
async function executeCode(code: string, language: string, stdin: string): Promise<{ success: boolean; output: string; error: string }> {
    const languageId = LANGUAGE_IDS[language];
    if (!languageId) throw new Error(`Unsupported language: ${language}`);
    
    const runReq = await fetch(`${JUDGE0_URL}/submissions/?base64_encoded=false&wait=true`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ source_code: code, language_id: languageId, stdin: stdin })
    });

    if (!runReq.ok) throw new Error(`Judge0 API error: ${await runReq.text()}`);
    const runOut = await runReq.json();
    
    const success = runOut.status.id === 3;
    const errorStr = runOut.compile_output || runOut.stderr || (success ? "" : runOut.status.description);
    
    return { success, output: runOut.stdout || "", error: errorStr };
}

export const executionRouter = createTRPCRouter({
    run: protectedProcedure
        .input(z.object({
            code: z.string(),
            language: z.string().default("javascript"),
            version: z.string().optional(),
            stdin: z.string().optional()
        }))
        .mutation(async ({ input }) => {
            try {
                const res = await executeCode(input.code, input.language, input.stdin || "");
                return { success: res.success, output: res.output, error: res.error, executionTime: 0 };
            } catch (error) {
                console.error("Execution error:", error);
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error instanceof Error ? error.message : "Code execution failed." });
            }
        }),

    submit: protectedProcedure
        .input(z.object({
            problemId: z.string(),
            code: z.string(),
            language: z.string().default("javascript"),
            version: z.string().optional()
        }))
        .mutation(async ({ ctx, input }) => {
            const problem = await ctx.db.problem.findUnique({
                where: { id: input.problemId },
                include: { testCases: true }
            });

            if (!problem) throw new TRPCError({ code: "NOT_FOUND", message: "Problem not found" });
            if (problem.testCases.length === 0) throw new TRPCError({ code: "BAD_REQUEST", message: "No test cases configured." });

            let passed = 0;
            let total = problem.testCases.length;
            let firstFailedCase = null;

            for (const tc of problem.testCases) {
                const res = await executeCode(input.code, input.language, tc.input);
                const actualOutput = res.output ? res.output.trim() : "";
                const expectedOutput = tc.expectedOutput ? tc.expectedOutput.trim() : "";
                const hasError = !res.success || !!res.error;

                if (!hasError && actualOutput === expectedOutput) {
                    passed++;
                } else {
                    if (!firstFailedCase) {
                        firstFailedCase = { input: tc.input, expected: tc.expectedOutput, actual: actualOutput, error: res.error };
                    }
                    break;
                }
            }

            const user = await ctx.db.user.findUnique({ where: { clerkId: ctx.userId } });
            if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not synced." });

            const success = passed === total;
            const submission = await ctx.db.submission.create({
                data: {
                    userId: user.id,
                    problemId: input.problemId,
                    code: input.code,
                    language: input.language,
                    status: success ? 'accepted' : 'wrong_answer',
                    testCasesPassed: passed,
                    totalTestCases: total,
                }
            });

            let isFirstSolve = false;
            let earnedPoints = 0;

            if (success) {
                // Check if already solved
                const existingSolve = await ctx.db.userProblemSolved.findFirst({
                    where: { userId: user.id, problemId: input.problemId }
                });

                if (!existingSolve) {
                    isFirstSolve = true;
                    // Calculate points based on difficulty
                    if (problem.difficulty === "easy") earnedPoints = 5;
                    else if (problem.difficulty === "medium") earnedPoints = 10;
                    else if (problem.difficulty === "hard") earnedPoints = 20;
                    else if (problem.difficulty === "real-world") earnedPoints = 50;

                    try {
                        // Record the solve first - this will throw if double-submitted due to @@unique constraint
                        await ctx.db.userProblemSolved.create({
                            data: {
                                userId: user.id,
                                problemId: input.problemId,
                                difficulty: problem.difficulty,
                                category: problem.category,
                                bestSubmissionId: submission.id
                            }
                        });

                    // Calculate streak
                    const today = new Date();
                    const todayStr = today.toISOString().split('T')[0];
                    let newStreak = user.streakCount || 0;
                    
                    if (!user.lastSolvedDate) {
                        newStreak = Math.max(newStreak, 1);
                    } else {
                        const lastDateStr = user.lastSolvedDate.toISOString().split('T')[0];
                        if (lastDateStr !== todayStr) {
                            const yesterday = new Date(today);
                            yesterday.setDate(yesterday.getDate() - 1);
                            const yesterdayStr = yesterday.toISOString().split('T')[0];
                            
                            if (lastDateStr === yesterdayStr) {
                                newStreak += 1;
                            } else {
                                newStreak = 1;
                            }
                        } else {
                            // If they already solved something today but streak is 0 (due to bug), fix it
                            if (newStreak === 0) newStreak = 1;
                        }
                    }

                    // Update User Stats
                    await ctx.db.user.update({
                        where: { id: user.id },
                        data: {
                            rank: { increment: earnedPoints },
                            problemsSolved: { increment: 1 },
                            easyCount: problem.difficulty === "easy" ? { increment: 1 } : undefined,
                            mediumCount: problem.difficulty === "medium" ? { increment: 1 } : undefined,
                            hardCount: problem.difficulty === "hard" ? { increment: 1 } : undefined,
                            realWorldCount: problem.difficulty === "real-world" ? { increment: 1 } : undefined,
                            lastSolvedDate: new Date(),
                            streakCount: newStreak
                        }
                    });
                    } catch (e: any) {
                        // If it's a unique constraint violation, it means another request just created it.
                        // We safely ignore it.
                        isFirstSolve = false;
                        earnedPoints = 0;
                    }
                }
            }

            return { 
                success, 
                passed, 
                total, 
                failedCase: firstFailedCase,
                isFirstSolve,
                earnedPoints
            };
        })
});
