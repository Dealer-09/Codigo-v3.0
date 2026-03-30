import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const problemRouter = createTRPCRouter({
    getAll: publicProcedure
        .input(
            z.object({
                difficulty: z.enum(["easy", "medium", "hard", "real-world"]).optional(),
                category: z.string().optional(),
                tags: z.array(z.string()).optional(),
                limit: z.number().min(1).max(50).default(20),
                cursor: z.string().optional(), // For infinite scrolling
            })
        )
        .query(async ({ ctx, input }) => {
            const where: any = {};
            if (input.difficulty) where.difficulty = input.difficulty;
            if (input.category) where.category = input.category;

            // Basic tag filtering (partial match) - rigorous filtering requires specific schema design
            if (input.tags && input.tags.length > 0 && input.tags[0]) {
                where.tags = { contains: input.tags[0] };
            }

            const problems = await ctx.db.problem.findMany({
                where,
                take: input.limit + 1,
                cursor: input.cursor ? { id: input.cursor } : undefined,
                orderBy: { solvedCount: "desc" },
                select: {
                    id: true,
                    title: true,
                    difficulty: true,
                    category: true,
                    tags: true,
                    solvedCount: true,
                    attemptCount: true,
                },
            });

            let nextCursor: typeof input.cursor | undefined = undefined;
            if (problems.length > input.limit) {
                const nextItem = problems.pop();
                nextCursor = nextItem!.id;
            }

            return {
                problems,
                nextCursor,
            };
        }),

    getById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const problem = await ctx.db.problem.findUnique({
                where: { id: input.id },
                include: {
                    testCases: {
                        where: { isHidden: false },
                        select: { input: true, expectedOutput: true, id: true },
                    },
                },
            });

            if (!problem) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Problem not found" });
            }

            // Check if user solved it
            const userSolved = await ctx.db.userProblemSolved.findUnique({
                where: {
                    userId_problemId: {
                        userId: ctx.userId,
                        problemId: input.id,
                    },
                },
            });

            return {
                ...problem,
                isSolved: !!userSolved,
                // Parse JSON fields if they are strings
                examples: safeJsonParse(problem.examples),
                hints: safeJsonParse(problem.hints),
            };
        }),

    // Submit implementation to be added
});

function safeJsonParse(str: string) {
    try {
        return JSON.parse(str);
    } catch (e) {
        return []; // fallback
    }
}
