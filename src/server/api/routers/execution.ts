import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import os from "os";

const execAsync = promisify(exec);
const JUDGE0_URL = "http://localhost:2358";
const LANGUAGE_IDS: Record<string, number> = { "javascript": 63, "python": 71, "c++": 54 };

// Development-only local execution (since Judge0's 'isolate' sandbox fails on Windows WSL2 Docker due to cgroup v2 conflicts)
async function executeLocally(code: string, language: string, stdin: string): Promise<{ success: boolean; output: string; error: string }> {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "codigo-"));
    let success = false;
    let output = "";
    let errorStr = "";

    try {
        const inputPath = path.join(tmpDir, "input.txt");
        await fs.writeFile(inputPath, stdin);

        if (language === "javascript") {
            const filePath = path.join(tmpDir, "solution.js");
            await fs.writeFile(filePath, code);
            const { stdout, stderr } = await execAsync(`node ${filePath} < ${inputPath}`, { timeout: 5000 });
            output = stdout;
            errorStr = stderr;
            success = !stderr;
        } 
        else if (language === "python") {
            const filePath = path.join(tmpDir, "solution.py");
            await fs.writeFile(filePath, code);
            const { stdout, stderr } = await execAsync(`python ${filePath} < ${inputPath}`, { timeout: 5000 });
            output = stdout;
            errorStr = stderr;
            success = !stderr;
        }
        else if (language === "c++") {
            const sourcePath = path.join(tmpDir, "solution.cpp");
            const outPath = path.join(tmpDir, "solution.exe");
            await fs.writeFile(sourcePath, code);
            await execAsync(`g++ ${sourcePath} -o ${outPath}`);
            const { stdout, stderr } = await execAsync(`${outPath} < ${inputPath}`, { timeout: 5000 });
            output = stdout;
            errorStr = stderr;
            success = true;
        }
        else {
            throw new Error(`Unsupported language: ${language}`);
        }
    } catch (err: any) {
        success = false;
        errorStr = err.stderr || err.message;
        output = err.stdout || "";
    } finally {
        await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
    }

    return { success, output, error: errorStr };
}

// Production execution using Judge0
async function executeInJudge0(code: string, language: string, stdin: string): Promise<{ success: boolean; output: string; error: string }> {
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

async function executeCode(code: string, language: string, stdin: string) {
    if (process.env.NODE_ENV === "production") {
        return executeInJudge0(code, language, stdin);
    } else {
        return executeLocally(code, language, stdin);
    }
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

            const user = await ctx.db.user.upsert({
                where: { clerkId: ctx.userId },
                update: {},
                create: { clerkId: ctx.userId }
            });

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

                    // Record the solve
                    await ctx.db.userProblemSolved.create({
                        data: {
                            userId: user.id,
                            problemId: input.problemId,
                            difficulty: problem.difficulty,
                            category: problem.category,
                            bestSubmissionId: submission.id
                        }
                    });

                    // Update User Stats
                    await ctx.db.user.update({
                        where: { id: user.id },
                        data: {
                            rank: { increment: earnedPoints },
                            problemsSolved: { increment: 1 },
                            easyCount: problem.difficulty === "easy" ? { increment: 1 } : undefined,
                            mediumCount: problem.difficulty === "medium" ? { increment: 1 } : undefined,
                            hardCount: problem.difficulty === "hard" ? { increment: 1 } : undefined,
                            lastSolvedDate: new Date()
                        }
                    });
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
