// @ts-nocheck
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const port = 3001;

// Basic Matchmaking & Room State Management
const waitingPlayers: any[] = [];
const roomFinishedPlayers: Map<string, string[]> = new Map(); // roomId -> array of userIds who finished
const roomCheatWarnings: Map<string, Record<string, number>> = new Map(); // roomId -> { socketId: warningCount }

Bun.serve<{ socketId: string, rooms: Set<string> }>({
  port,
  fetch(req, server) {
    if (server.upgrade(req, { data: { socketId: crypto.randomUUID(), rooms: new Set() } })) {
      return;
    }
    return new Response("Arena WebSocket Server Running", { status: 200 });
  },
  websocket: {
    open(ws) {
      console.log(`[Arena WebSockets] User connected: ${ws.data.socketId}`);
    },
    async message(ws, message) {
      try {
        const { type, payload } = JSON.parse(message as string);

        const emit = (event: string, data: any) => {
            ws.send(JSON.stringify({ type: event, payload: data }));
        };

        const broadcast = (roomId: string, event: string, data: any) => {
            ws.publish(roomId, JSON.stringify({ type: event, payload: data }));
        };

        const joinRoom = (roomId: string) => {
            ws.subscribe(roomId);
            ws.data.rooms.add(roomId);
        };

        if (type === "arena:join-queue") {
            const { userId, username, difficulty } = payload;
            ws.subscribe(userId); // Subscribe to own userId channel
            console.log(`[Arena] Player ${username} joined global queue for ${difficulty}`);
            
            const opponentIndex = waitingPlayers.findIndex(p => p.difficulty === difficulty || !p.difficulty);
            
            if (opponentIndex !== -1) {
              const opponent = waitingPlayers.splice(opponentIndex, 1)[0];
              
              try {
                  const problems = await prisma.problem.findMany({
                      where: difficulty ? { difficulty } : undefined,
                      take: 5
                  });
                  
                  if (problems.length === 0) {
                      emit("arena:queue-error", { message: "No problems found in DB." });
                      return;
                  }
        
                  const [dbPlayer1, dbPlayer2] = await Promise.all([
                      prisma.user.findUnique({ where: { clerkId: opponent.userId } }),
                      prisma.user.findUnique({ where: { clerkId: userId } })
                  ]);
        
                  if (!dbPlayer1 || !dbPlayer2) {
                      emit("arena:queue-error", { message: "Failed to resolve users in DB." });
                      return;
                  }
        
                  const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
                  
                  await prisma.arenaRoom.create({
                      data: {
                          roomId,
                          adminId: dbPlayer1.id,
                          maxParticipants: 2,
                          isQuickMatch: true,
                          matchType: "global",
                          problemIds: problems.map(p => p.id),
                          startedAt: new Date(),
                          status: "in-progress",
                          participants: {
                              create: [
                                  { userId: dbPlayer1.id, status: "joined" },
                                  { userId: dbPlayer2.id, status: "joined" }
                              ]
                          }
                      }
                  });
        
                  const match = { roomId, status: "in-progress" };
                  
                  joinRoom(roomId);
                  // Notify both players
                  const matchFoundPayload = { roomId, status: "in-progress", startedAt: new Date() };
                  
                  // Notify player 2 (current websocket)
                  emit("arena:match-found", matchFoundPayload);
                  
                  // Notify player 1 (waiting opponent) via their personal channel
                  broadcast(opponent.userId, "arena:match-found", matchFoundPayload);
                  
                  console.log(`[Arena] Global Match started: ${roomId}`);
              } catch (error) {
                  console.error("Match creation error:", error);
              }
            } else {
              waitingPlayers.push({ socketId: ws.data.socketId, userId, username, difficulty });
              emit("arena:queue-joined", { position: waitingPlayers.length });
            }
        }

        if (type === "arena:join-room") {
            const { roomId, userId, username } = payload;
            joinRoom(roomId);
            
            const room = await prisma.arenaRoom.findUnique({
                where: { roomId },
                include: { participants: true }
            });
      
            if (!room) {
                emit("arena:queue-error", { message: "Room not found." });
                return;
            }
      
            if (room.status === "waiting" && room.participants.length >= room.maxParticipants) {
                await prisma.arenaRoom.update({
                    where: { roomId },
                    data: {
                        status: "in-progress",
                        startedAt: new Date()
                    }
                });
                
                const matchFoundPayload = { 
                    roomId, 
                    status: "in-progress", 
                    startedAt: new Date(),
                    penaltyType: room.penaltyType,
                    hideTestCases: room.hideTestCases,
                    blindMode: room.blindMode,
                    bonusMarks: room.bonusMarks,
                    maxWarnings: room.maxWarnings
                };
                broadcast(roomId, "arena:match-found", matchFoundPayload);
                emit("arena:match-found", matchFoundPayload);
                
                console.log(`[Arena] Custom Match started: ${roomId}`);
            } else if (room.status === "in-progress") {
                emit("arena:match-found", { roomId, status: "in-progress", startedAt: room.startedAt });
            } else {
                emit("arena:room-waiting", { participants: room.participants.length, max: room.maxParticipants });
            }
        }

        if (type === "arena:code-update") {
            const { roomId, code } = payload;
            broadcast(roomId, "arena:opponent-code-update", { code });
        }

        if (type === "arena:match-finished") {
            const { roomId, userId } = payload;
            if (!roomFinishedPlayers.has(roomId)) {
                roomFinishedPlayers.set(roomId, []);
            }
            const finished = roomFinishedPlayers.get(roomId)!;
            if (!finished.includes(userId)) {
                finished.push(userId);
            }
            
            const rank = finished.length;
            broadcast(roomId, "arena:opponent-finished", { userId, rank });
      
            try {
                const room = await prisma.arenaRoom.findUnique({ where: { roomId } });
                if (room) {
                    if (finished.length >= room.maxParticipants) {
                        broadcast(roomId, "arena:match-terminated", { reason: "Match has concluded!" });
                        
                        // Cleanup memory leaks
                        roomFinishedPlayers.delete(roomId);
                        roomCheatWarnings.delete(roomId);
                    }
                }
            } catch (err) {
                console.error("Error fetching room for match-finished:", err);
            }
        }

        if (type === "arena:cheat-warning") {
            const { roomId, reason } = payload;
            console.log(`[Arena Anti-Cheat] Cheat event (${reason}) logged for user ${ws.data.socketId} in room ${roomId}`);
            
            if (!roomCheatWarnings.has(roomId)) {
                roomCheatWarnings.set(roomId, {});
            }
            const warnings = roomCheatWarnings.get(roomId)!;
            warnings[ws.data.socketId] = (warnings[ws.data.socketId] || 0) + 1;
      
            broadcast(roomId, "arena:opponent-cheated", { reason });
      
            try {
                const room = await prisma.arenaRoom.findUnique({ where: { roomId } });
                const limit = room ? room.maxWarnings : 2;
                
                if (warnings[ws.data.socketId] > limit) {
                    console.log(`[Arena Anti-Cheat] User ${ws.data.socketId} disqualified in room ${roomId}.`);
                    emit("arena:disqualified", { reason: "Exceeded maximum anti-cheat warnings." });
                    broadcast(roomId, "arena:opponent-disconnected", { socketId: ws.data.socketId });
                    
                    if (room && room.maxParticipants === 2) {
                        broadcast(roomId, "arena:match-terminated", { reason: "Opponent was disqualified for cheating." });
                    }
                }
            } catch (err) {
                console.error("Error checking room for cheat warnings:", err);
            }
        }
      } catch (e) {
          console.error("WebSocket message error:", e);
      }
    },
    close(ws) {
      console.log(`[Arena WebSockets] User disconnected: ${ws.data.socketId}`);
      for (const roomId of ws.data.rooms) {
          ws.publish(roomId, JSON.stringify({ type: "arena:opponent-disconnected", payload: { socketId: ws.data.socketId } }));
          
          // Cleanup room states if empty (rough approximation)
          // In real production, we'd decrement participant count and clean up when 0
      }
      const index = waitingPlayers.findIndex(p => p.socketId === ws.data.socketId);
      if (index !== -1) waitingPlayers.splice(index, 1);
    }
  }
});

console.log(`> Standalone Bun WebSocket server running on ws://localhost:${port}`);
