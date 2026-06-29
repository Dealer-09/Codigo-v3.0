import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
    // Get current user's full stats
    getStats: protectedProcedure.query(async ({ ctx }) => {
        const user = await ctx.db.user.findUnique({
            where: { clerkId: ctx.userId },
            include: {
                solvedProblems: {
                    select: {
                        firstSolvedAt: true
                    }
                }
            }
        });

        if (!user) return null;

        // Calculate Accuracy
        const totalSubmissions = await ctx.db.submission.count({ where: { userId: user.id } });
        const acceptedSubmissions = await ctx.db.submission.count({ where: { userId: user.id, status: 'accepted' } });
        const accuracy = totalSubmissions > 0 ? Math.round((acceptedSubmissions / totalSubmissions) * 100) : 0;

        // Calculate Percentile
        const totalUsers = await ctx.db.user.count();
        const rankPosition = await ctx.db.user.count({
            where: { problemsSolved: { gt: user.problemsSolved } }
        });
        
        let percentile = 100;
        if (totalUsers > 1) {
            percentile = Math.max(1, Math.round(((rankPosition) / totalUsers) * 100));
        } else if (totalUsers === 1) {
            percentile = 1; // Top 1% if you're the only user
        }

        return {
            ...user,
            accuracy,
            percentile
        };
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
                sortBy: z.enum(["rank", "problemsSolved", "arenaWinsCount"]).default("problemsSolved"),
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
                    arenaWinsCount: true,
                },
            });
        }),
        
    syncProfile: protectedProcedure
        .input(z.object({
            name: z.string().optional(),
            image: z.string().optional()
        }))
        .mutation(async ({ ctx, input }) => {
            const data: any = {};
            if (input.name) data.name = input.name;
            if (input.image) data.image = input.image;
            
            return ctx.db.user.upsert({
                where: { clerkId: ctx.userId },
                update: data,
                create: { clerkId: ctx.userId, email: `${ctx.userId}@placeholder.com`, ...data }
            });
        }),
});
