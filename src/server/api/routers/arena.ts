import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const arenaRouter = createTRPCRouter({
    createRoom: protectedProcedure
        .input(z.object({
            maxParticipants: z.number().min(2).max(10).default(2),
            problemIds: z.array(z.string()).min(1),
            isQuickMatch: z.boolean().default(false),
            matchType: z.enum(["global", "quick", "custom"]).default("custom"),
            timeLimit: z.number().optional(),
            difficulty: z.string().optional(),
            penaltyType: z.string().default("none"),
            hideTestCases: z.boolean().default(false),
            blindMode: z.boolean().default(false),
            bonusMarks: z.number().default(5),
            maxWarnings: z.number().default(2),
        }))
        .mutation(async ({ ctx, input }) => {
            // Get actual DB user ID
            const user = await ctx.db.user.findUnique({ where: { clerkId: ctx.userId } });
            if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not synced." });

            // Generate a random short code for the room
            const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
            
            const room = await ctx.db.arenaRoom.create({
                data: {
                    roomId,
                    adminId: user.id,
                    maxParticipants: input.maxParticipants,
                    isQuickMatch: input.isQuickMatch,
                    matchType: input.matchType,
                    timeLimit: input.timeLimit,
                    difficulty: input.difficulty,
                    penaltyType: input.penaltyType,
                    hideTestCases: input.hideTestCases,
                    blindMode: input.blindMode,
                    bonusMarks: input.bonusMarks,
                    maxWarnings: input.maxWarnings,
                    problemIds: input.problemIds,
                    status: "waiting",
                    participants: {
                        create: {
                            userId: user.id,
                            status: "joined",
                        }
                    }
                }
            });

            return room;
        }),

    joinRoom: protectedProcedure
        .input(z.object({ roomId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const room = await ctx.db.arenaRoom.findUnique({
                where: { roomId: input.roomId },
                include: { participants: true }
            });

            if (!room) throw new TRPCError({ code: "NOT_FOUND", message: "Room not found" });
            if (room.status !== "waiting") throw new TRPCError({ code: "BAD_REQUEST", message: "Room is not in waiting state" });
            if (room.participants.length >= room.maxParticipants) throw new TRPCError({ code: "BAD_REQUEST", message: "Room is full" });
            
            // Get actual DB user ID
            const user = await ctx.db.user.findUnique({ where: { clerkId: ctx.userId } });
            if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not synced." });

            // Check if already in room
            const existingParticipant = room.participants.find(p => p.userId === user.id);
            if (existingParticipant) return { message: "Already joined", room };

            await ctx.db.arenaRoom.update({
                where: { id: room.id },
                data: {
                    participants: {
                        create: {
                            userId: user.id,
                            status: "joined"
                        }
                    }
                }
            });
            
            return { message: "Joined successfully", room };
        }),

    getRoom: protectedProcedure
        .input(z.object({ roomId: z.string() }))
        .query(async ({ ctx, input }) => {
            return ctx.db.arenaRoom.findUnique({
                where: { roomId: input.roomId },
                include: {
                    participants: {
                        include: { user: true }
                    },
                    problems: true,
                }
            });
        }),

    recordMatchResult: protectedProcedure
        .input(z.object({
            roomId: z.string(),
            isWinner: z.boolean(),
        }))
        .mutation(async ({ ctx, input }) => {
            const user = await ctx.db.user.findUnique({ where: { clerkId: ctx.userId } });
            if (!user) throw new TRPCError({ code: "NOT_FOUND" });

            const room = await ctx.db.arenaRoom.findUnique({
                where: { roomId: input.roomId },
                include: { participants: true }
            });
            if (!room || room.participants.length < 2) return { success: false };

            const opponent = room.participants.find(p => p.userId !== user.id);
            if (!opponent) return { success: false };

            // Create the match record to persist the win/loss history
            await ctx.db.arenaMatch.create({
                data: {
                    player1Id: user.id,
                    player2Id: opponent.userId,
                    problemId: room.problemIds[0],
                    winnerId: input.isWinner ? user.id : opponent.userId
                }
            });

            if (input.isWinner) {
                await ctx.db.user.update({
                    where: { id: user.id },
                    data: { arenaWinsCount: { increment: 1 } }
                });
            }

            return { success: true };
        }),
});
