import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import { parse } from "url";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Basic Matchmaking State
  const waitingPlayers: any[] = [];
  const activeMatches = new Map<string, any>();

  io.on("connection", (socket) => {
    console.log("[Arena] User connected:", socket.id);

    socket.on("arena:join-queue", (data) => {
      console.log("[Arena] Join queue request:", data);
      
      const { userId, username, difficulty } = data;
      
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
        io.to(opponent.socketId).emit("arena:match-found", match);
        socket.emit("arena:match-found", match);
        
        console.log(`[Arena] Match created: ${matchId}`);
      } else {
        // Add to queue
        waitingPlayers.push({ socketId: socket.id, userId, username, difficulty });
        socket.emit("arena:queue-joined", { position: waitingPlayers.length });
        console.log(`[Arena] Player added to queue. Waiting...`);
      }
    });

    socket.on("arena:leave-queue", () => {
        const index = waitingPlayers.findIndex(p => p.socketId === socket.id);
        if (index !== -1) waitingPlayers.splice(index, 1);
        console.log("[Arena] Player left queue");
    });

    socket.on("disconnect", () => {
      console.log("[Arena] User disconnected:", socket.id);
      const index = waitingPlayers.findIndex(p => p.socketId === socket.id);
      if (index !== -1) waitingPlayers.splice(index, 1);
    });
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port} (Next.js + Socket.IO)`);
  });
});
