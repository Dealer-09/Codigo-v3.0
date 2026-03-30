import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
    // Get current user's full stats
    getStats: protectedProcedure.query(async ({ ctx }) => {
        return ctx.db.user.findUnique({
            where: { clerkId: ctx.userId },
        });
    }),

    // Get public profile of any user
    getProfile: publicProcedure
        .input(z.object({ userId: z.string() }))
        .query(async ({ ctx, input }) => {
            return ctx.db.user.findUnique({
                where: { id: input.userId },
                select: {
                    id: true,
                    name: true,
                    image: true,
                    rank: true,
                    problemsSolved: true,
                    easyCount: true,
                    mediumCount: true,
                    hardCount: true,
                    contestsCount: true,
                    streakCount: true,
                    createdAt: true,
                },
            });
        }),

    // Get leaderboard sorted by problems solved or rank
    getLeaderboard: publicProcedure
        .input(
            z.object({
                limit: z.number().min(1).max(100).default(50),
                sortBy: z.enum(["rank", "problemsSolved"]).default("problemsSolved"),
            })
        )
        .query(async ({ ctx, input }) => {
            return ctx.db.user.findMany({
                orderBy: {
                    [input.sortBy]: "desc",
                },
                take: input.limit,
                select: {
                    id: true,
                    name: true,
                    image: true,
                    rank: true,
                    problemsSolved: true,
                    streakCount: true,
                },
            });
        }),
});
