import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const arenaRouter = createTRPCRouter({
    createRoom: protectedProcedure
        .input(z.object({
            maxParticipants: z.number().min(2).max(10).default(2),
            problemIds: z.array(z.string()).min(1),
            isQuickMatch: z.boolean().default(false),
        }))
        .mutation(async ({ ctx, input }) => {
            // Generate a random short code for the room
            const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
            
            const room = await ctx.db.arenaRoom.create({
                data: {
                    roomId,
                    adminId: ctx.userId,
                    maxParticipants: input.maxParticipants,
                    isQuickMatch: input.isQuickMatch,
                    problemIds: input.problemIds,
                    status: "waiting",
                    participants: {
                        create: {
                            userId: ctx.userId,
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
            
            // Check if already in room
            const existingParticipant = room.participants.find(p => p.userId === ctx.userId);
            if (existingParticipant) return { message: "Already joined", room };

            await ctx.db.roomParticipant.create({
                data: {
                    roomId: room.id,
                    userId: ctx.userId,
                    status: "joined",
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
});
