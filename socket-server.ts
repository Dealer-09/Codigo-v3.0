import { Server } from "socket.io";
import { createServer } from "http";

const port = 3001;
const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: "*", // allow Next.js on port 3000 to connect
    methods: ["GET", "POST"]
  }
});

// Basic Matchmaking & Room State
const waitingPlayers: any[] = [];
const activeMatches = new Map<string, any>();

io.on("connection", (socket) => {
  console.log(`[Arena WebSockets] User connected: ${socket.id}`);

  // Quick Match Join
  socket.on("arena:join-queue", (data) => {
    const { userId, username, difficulty } = data;
    console.log(`[Arena] Player ${username} joined queue`);
    
    if (waitingPlayers.length > 0) {
      // Match found!
      const opponent = waitingPlayers.shift();
      const matchId = `match_${Date.now()}`;
      
      const match = {
        id: matchId,
        players: [opponent, { socketId: socket.id, userId, username }],
        difficulty,
        status: "in-progress"
      };
      
      activeMatches.set(matchId, match);
      
      // Notify both players
      socket.join(matchId);
      io.sockets.sockets.get(opponent.socketId)?.join(matchId);
      
      io.to(matchId).emit("arena:match-found", match);
      console.log(`[Arena] Match started: ${matchId}`);
    } else {
      waitingPlayers.push({ socketId: socket.id, userId, username, difficulty });
      socket.emit("arena:queue-joined", { position: waitingPlayers.length });
    }
  });

  // Code Sync for realtime typing
  socket.on("arena:code-update", (data) => {
      const { roomId, code } = data;
      // Broadcast to opponent in the room
      socket.to(roomId).emit("arena:opponent-code-update", { code });
  });

  // Opponent Finished Notification
  socket.on("arena:match-finished", (data) => {
      const { roomId, userId } = data;
      socket.to(roomId).emit("arena:opponent-finished", { userId });
  });

  socket.on("disconnect", () => {
    console.log(`[Arena WebSockets] User disconnected: ${socket.id}`);
    const index = waitingPlayers.findIndex(p => p.socketId === socket.id);
    if (index !== -1) waitingPlayers.splice(index, 1);
  });
});

httpServer.listen(port, () => {
  console.log(`> Standalone Socket.IO server running on http://localhost:${port}`);
});
