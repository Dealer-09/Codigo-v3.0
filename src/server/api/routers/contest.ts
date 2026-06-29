import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const contestRouter = createTRPCRouter({
    create: protectedProcedure
        .input(z.object({
            title: z.string(),
            description: z.string().optional(),
            startTime: z.string(),
            endTime: z.string(),
            isPrivate: z.boolean(),
            joinPassword: z.string().optional(),
            hasCoHosts: z.boolean(),
            coHostPassword: z.string().optional(),
            penaltyType: z.string(),
            hideTestCases: z.boolean(),
            blindMode: z.boolean(),
            bonusMarks: z.number(),
            maxWarnings: z.number(),
            dbEasyCount: z.number(),
            dbMediumCount: z.number(),
            dbHardCount: z.number(),
            customProblems: z.array(z.object({
                title: z.string(),
                difficulty: z.string(),
                description: z.string(),
                testCases: z.array(z.object({
                    input: z.string(),
                    output: z.string(),
                    isHidden: z.boolean()
                }))
            }))
        }))
        .mutation(async ({ ctx, input }) => {
            const { db } = ctx;
            
            // First create the custom problems in the Problem table
            const customProblemIds = await Promise.all(input.customProblems.map(async (cp) => {
                const problem = await db.problem.create({
                    data: {
                        title: cp.title,
                        description: cp.description,
                        difficulty: cp.difficulty,
                        category: "Custom",
                        constraints: "N/A",
                        examples: "[]",
                        hints: "[]",
                        tags: ["Contest"],
                        testCases: {
                            create: cp.testCases.map(tc => ({
                                input: tc.input,
                                expectedOutput: tc.output,
                                isHidden: tc.isHidden
                            }))
                        }
                    }
                });
                return problem.id;
            }));

            // Fetch random DB problems
            let dbProblemIds: string[] = [];
            
            if (input.dbEasyCount > 0) {
                const easyProbs = await db.problem.findMany({ where: { difficulty: "easy" }, take: input.dbEasyCount });
                dbProblemIds.push(...easyProbs.map(p => p.id));
            }
            if (input.dbMediumCount > 0) {
                const medProbs = await db.problem.findMany({ where: { difficulty: "medium" }, take: input.dbMediumCount });
                dbProblemIds.push(...medProbs.map(p => p.id));
            }
            if (input.dbHardCount > 0) {
                const hardProbs = await db.problem.findMany({ where: { difficulty: "hard" }, take: input.dbHardCount });
                dbProblemIds.push(...hardProbs.map(p => p.id));
            }

            const allProblemIds = [...customProblemIds, ...dbProblemIds];

            const dbUser = await db.user.findUnique({ where: { clerkId: ctx.userId } });
            if (!dbUser) throw new TRPCError({ code: "UNAUTHORIZED", message: "User not found in database" });

            // Create Contest
            const contest = await db.contest.create({
                data: {
                    title: input.title,
                    description: input.description,
                    startTime: new Date(input.startTime),
                    endTime: new Date(input.endTime),
                    hostId: dbUser.id,
                    isPrivate: input.isPrivate,
                    joinPassword: input.joinPassword,
                    hasCoHosts: input.hasCoHosts,
                    coHostPassword: input.coHostPassword,
                    penaltyType: input.penaltyType,
                    hideTestCases: input.hideTestCases,
                    blindMode: input.blindMode,
                    bonusMarks: input.bonusMarks,
                    maxWarnings: input.maxWarnings,
                    problems: {
                        create: allProblemIds.map(pid => ({
                            problemId: pid,
                            points: 100 // default points
                        }))
                    }
                }
            });

            return contest;
        }),

    getAll: publicProcedure.query(async ({ ctx }) => {
        return await ctx.db.contest.findMany({
            orderBy: { startTime: "asc" },
            include: { host: true }
        });
    }),

    getById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const dbUser = await ctx.db.user.findUnique({ where: { clerkId: ctx.userId } });
            const userId = dbUser ? dbUser.id : "";

            const contest = await ctx.db.contest.findUnique({
                where: { id: input.id },
                include: { 
                    problems: {
                        include: { problem: true }
                    },
                    host: true,
                    participants: {
                        where: { userId: userId }
                    }
                }
            });

            if (!contest) throw new TRPCError({ code: "NOT_FOUND", message: "Contest not found" });
            
            return {
                ...contest,
                hasJoined: contest.participants.length > 0
            };
        }),
        
    join: protectedProcedure
        .input(z.object({
            contestId: z.string(),
            password: z.string().optional()
        }))
        .mutation(async ({ ctx, input }) => {
            const contest = await ctx.db.contest.findUnique({ where: { id: input.contestId } });
            if (!contest) throw new TRPCError({ code: "NOT_FOUND" });
            
            if (contest.isPrivate) {
                if (contest.joinPassword !== input.password) {
                    throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid password" });
                }
            }

            const dbUser = await ctx.db.user.findUnique({ where: { clerkId: ctx.userId } });
            if (!dbUser) throw new TRPCError({ code: "UNAUTHORIZED" });

            // check if already joined
            const existing = await ctx.db.contestParticipant.findUnique({
                where: {
                    contestId_userId: {
                        contestId: input.contestId,
                        userId: dbUser.id
                    }
                }
            });

            if (existing) return existing;

            return await ctx.db.contestParticipant.create({
                data: {
                    contestId: input.contestId,
                    userId: dbUser.id
                }
            });
        }),
        
    getHostedContests: protectedProcedure.query(async ({ ctx }) => {
        const dbUser = await ctx.db.user.findUnique({ where: { clerkId: ctx.userId } });
        if (!dbUser) return [];

        return await ctx.db.contest.findMany({
            where: { hostId: dbUser.id },
            orderBy: { createdAt: "desc" }
        });
    }),
});
