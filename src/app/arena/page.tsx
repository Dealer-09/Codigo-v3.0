"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { Navbar } from "~/_components/layout/Navbar";
import { Sword, Users, Zap } from "lucide-react";

export default function ArenaLobbyPage() {
    const router = useRouter();
    const [joinRoomId, setJoinRoomId] = useState("");
    const [isJoining, setIsJoining] = useState(false);

    // ponytail: Just fetch one problem to use for creating quick matches for now.
    // In a full app, we'd let admin select the problem.
    const { data: problemsData } = api.problem.getAll.useQuery({ limit: 1 });

    const createRoom = api.arena.createRoom.useMutation({
        onSuccess: (room) => {
            router.push(`/arena/${room.roomId}`);
        }
    });

    const joinRoom = api.arena.joinRoom.useMutation({
        onSuccess: (data) => {
            router.push(`/arena/${data.room.roomId}`);
        },
        onError: (err) => {
            alert(`Failed to join: ${err.message}`);
            setIsJoining(false);
        }
    });

    const handleCreateMatch = () => {
        if (!problemsData?.problems[0]) {
            alert("No problems available in DB. Add one in Admin panel first.");
            return;
        }
        createRoom.mutate({
            maxParticipants: 2,
            problemIds: [problemsData.problems[0].id],
            isQuickMatch: true
        });
    };

    const handleJoinMatch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!joinRoomId) return;
        setIsJoining(true);
        joinRoom.mutate({ roomId: joinRoomId });
    };

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white selection:bg-purple-500/30">
            <Navbar />
            
            <div className="pt-32 px-6 max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[80vh]">
                <div className="text-center mb-16 relative">
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
                        Battle <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Arena</span>
                    </h1>
                    <p className="text-gray-400 text-xl max-w-2xl mx-auto">
                        Challenge developers worldwide in real-time coding duels. Prove your skills, climb the ranks.
                    </p>
                    
                    {/* Background Glow */}
                    <div className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600/20 blur-[120px]" />
                </div>

                <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
                    {/* Create Match */}
                    <div className="bg-[#0e121b] border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center hover:border-red-500/30 transition-colors group">
                        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-6 group-hover:scale-110 transition-transform">
                            <Zap className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">OG Quick Match</h2>
                        <p className="text-gray-400 mb-8 text-sm">Create a fast 1v1 battle room and invite a friend using the room code.</p>
                        
                        <button 
                            onClick={handleCreateMatch}
                            disabled={createRoom.isPending}
                            className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:opacity-90 rounded-xl font-bold text-lg shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 transition"
                        >
                            <Sword className="w-5 h-5" /> 
                            {createRoom.isPending ? "Generating Room..." : "Create 1v1 Match"}
                        </button>
                    </div>

                    {/* Join Match */}
                    <div className="bg-[#0e121b] border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center hover:border-blue-500/30 transition-colors group">
                        <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform">
                            <Users className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Join a Room</h2>
                        <p className="text-gray-400 mb-8 text-sm">Have a room code? Enter it below to join an existing coding battle.</p>
                        
                        <form onSubmit={handleJoinMatch} className="w-full flex gap-3">
                            <input 
                                type="text"
                                placeholder="e.g. A3X9KL"
                                value={joinRoomId}
                                onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                                className="flex-1 bg-[#161b22] border border-white/10 rounded-xl px-4 text-center font-mono text-lg font-bold outline-none focus:border-blue-500 transition-colors"
                                maxLength={6}
                            />
                            <button 
                                type="submit"
                                disabled={isJoining || !joinRoomId}
                                className="px-6 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition"
                            >
                                {isJoining ? "..." : "Join"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
}
