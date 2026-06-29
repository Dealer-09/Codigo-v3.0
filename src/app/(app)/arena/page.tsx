"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { useUser } from "@clerk/nextjs";
import { Sword, Users, Zap, Globe, Loader2, Settings } from "lucide-react";

import { useEffect } from "react";

export default function ArenaLobbyPage() {
    const router = useRouter();
    const [joinRoomId, setJoinRoomId] = useState("");
    const [isJoining, setIsJoining] = useState(false);

    const { user } = useUser();
    const [matchMode, setMatchMode] = useState<number>(5);
    const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);
    const [socket, setSocket] = useState<WebSocket | null>(null);

    // Custom Room State
    const [showCustomModal, setShowCustomModal] = useState(false);
    const [customMaxParticipants, setCustomMaxParticipants] = useState(10);
    const [customEasyCount, setCustomEasyCount] = useState(1);
    const [customMediumCount, setCustomMediumCount] = useState(1);
    const [customHardCount, setCustomHardCount] = useState(1);
    const [useCustomGlobalTimer, setUseCustomGlobalTimer] = useState(false);
    const [customGlobalTimerMins, setCustomGlobalTimerMins] = useState(60);
    const [globalDifficulty, setGlobalDifficulty] = useState("easy");
    const [penaltyType, setPenaltyType] = useState("none");
    const [hideTestCases, setHideTestCases] = useState(false);
    const [blindMode, setBlindMode] = useState(false);
    const [bonusMarks, setBonusMarks] = useState(5);
    const [maxWarnings, setMaxWarnings] = useState(2);

    useEffect(() => {
        const newSocket = new WebSocket("ws://localhost:3001");
        setSocket(newSocket);

        newSocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            const payload = data.payload;
            
            if (data.type === "arena:match-found") {
                console.log("Global match found!", payload);
                setIsSearchingGlobal(false);
                router.push(`/arena/${payload.roomId}`);
            } else if (data.type === "arena:queue-error") {
                alert("Matchmaking Error: " + payload.message);
                setIsSearchingGlobal(false);
            }
        };

        return () => {
            newSocket.close();
        };
    }, [router]);

    const handleGlobalSearch = () => {
        if (!socket || !user) return;
        setIsSearchingGlobal(true);
        socket.send(JSON.stringify({ type: "arena:join-queue", payload: {
            userId: user.id,
            username: user.username || user.firstName || "Player",
            difficulty: globalDifficulty
        }}));
    };

    // Fetch up to 50 problems so we can slice based on selected game mode
    const { data: problemsData } = api.problem.getAll.useQuery({ limit: 50 });

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
            problemIds: problemsData.problems.slice(0, matchMode).map(p => p.id),
            isQuickMatch: true,
            matchType: "quick"
        });
    };

    const handleCreateCustomRoom = (e: React.FormEvent) => {
        e.preventDefault();
        if (!problemsData?.problems) {
            alert("Problems still loading or not available in DB.");
            return;
        }

        const easyProbs = problemsData.problems.filter(p => p.difficulty.toLowerCase() === "easy").slice(0, customEasyCount);
        const medProbs = problemsData.problems.filter(p => p.difficulty.toLowerCase() === "medium").slice(0, customMediumCount);
        const hardProbs = problemsData.problems.filter(p => p.difficulty.toLowerCase() === "hard").slice(0, customHardCount);

        const selectedProblems = [...easyProbs, ...medProbs, ...hardProbs];

        if (selectedProblems.length === 0) {
            alert("You must select at least 1 problem for the match.");
            return;
        }

        if (
            easyProbs.length < customEasyCount ||
            medProbs.length < customMediumCount ||
            hardProbs.length < customHardCount
        ) {
            alert(`Not enough problems in DB. Found: Easy(${easyProbs.length}), Medium(${medProbs.length}), Hard(${hardProbs.length})`);
            return;
        }

        createRoom.mutate({
            maxParticipants: customMaxParticipants,
            problemIds: selectedProblems.map(p => p.id),
            isQuickMatch: false,
            matchType: "custom",
            timeLimit: useCustomGlobalTimer ? customGlobalTimerMins : undefined,
            difficulty: undefined,
            penaltyType,
            hideTestCases,
            blindMode,
            bonusMarks,
            maxWarnings
        });
    };

    const handleJoinMatch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!joinRoomId) return;
        setIsJoining(true);
        joinRoom.mutate({ roomId: joinRoomId });
    };

    return (
        <div className="pt-10 px-6 max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[80vh]">
                <div className="text-center mb-16 relative">
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-[var(--color-clay-text)]">
                        Battle <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Arena</span>
                    </h1>
                    <p className="text-[var(--color-clay-text-muted)] font-medium text-xl max-w-2xl mx-auto">
                        Challenge developers worldwide in real-time coding duels. Prove your skills, climb the ranks.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 w-full max-w-6xl">
                    {/* Global Matchmaking */}
                    <div className="clay-card p-10 flex flex-col items-center text-center group border-2 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                        <div className="w-16 h-16 rounded-full clay-pill flex items-center justify-center text-emerald-500 mb-6 group-hover:scale-110 transition-transform">
                            <Globe className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-extrabold mb-2 text-[var(--color-clay-text)]">Global Ranked</h2>
                        <p className="text-[var(--color-clay-text-muted)] font-medium mb-6 text-sm">Enter the global queue to be matched with an opponent of similar skill.</p>
                        
                        <div className="w-full flex flex-col gap-2 mb-8 mt-auto">
                            <label className="text-sm font-bold text-[var(--color-clay-text-muted)] text-left">Select Difficulty:</label>
                            <select 
                                value={globalDifficulty} 
                                onChange={(e) => setGlobalDifficulty(e.target.value)}
                                className="w-full clay-panel px-4 py-3 font-bold text-[var(--color-clay-text)] outline-none cursor-pointer"
                            >
                                <option value="easy">Easy Queue (10 mins)</option>
                                <option value="medium">Medium Queue (15 mins)</option>
                                <option value="hard">Hard Queue (20 mins)</option>
                            </select>
                        </div>
                        
                        <button 
                            onClick={handleGlobalSearch}
                            disabled={isSearchingGlobal || !user}
                            className="clay-btn w-full py-4 text-emerald-600 dark:text-emerald-400 font-extrabold text-lg flex items-center justify-center gap-2"
                        >
                            {isSearchingGlobal ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sword className="w-5 h-5" />} 
                            {isSearchingGlobal ? "Searching..." : "Find Match"}
                        </button>
                    </div>

                    {/* Create Match */}
                    <div className="clay-card p-10 flex flex-col items-center text-center group">
                        <div className="w-16 h-16 rounded-full clay-pill flex items-center justify-center text-red-500 mb-6 group-hover:scale-110 transition-transform">
                            <Zap className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-extrabold mb-2 text-[var(--color-clay-text)]">OG Quick Match</h2>
                        <p className="text-[var(--color-clay-text-muted)] font-medium mb-6 text-sm">Create a fast 1v1 battle room and invite a friend using the room code.</p>
                        
                        <div className="w-full flex flex-col gap-2 mb-8 mt-auto">
                            <label className="text-sm font-bold text-[var(--color-clay-text-muted)] text-left">Select Game Mode:</label>
                            <select 
                                value={matchMode} 
                                onChange={(e) => setMatchMode(Number(e.target.value))}
                                className="w-full clay-panel px-4 py-3 font-bold text-[var(--color-clay-text)] outline-none cursor-pointer"
                            >
                                <option value={1}>Sudden Death (1 Problem)</option>
                                <option value={3}>Sprint Mode (3 Problems)</option>
                                <option value={5}>Classic Arena (5 Problems)</option>
                                <option value={10}>Endurance (10 Problems)</option>
                            </select>
                        </div>
                        
                        <button 
                            onClick={handleCreateMatch}
                            disabled={createRoom.isPending}
                            className="clay-btn w-full py-4 text-red-600 dark:text-red-400 font-extrabold text-lg flex items-center justify-center gap-2"
                        >
                            <Sword className="w-5 h-5" /> 
                            {createRoom.isPending ? "Generating Room..." : "Create 1v1 Match"}
                        </button>
                    </div>

                    {/* Join Match */}
                    <div className="clay-card p-10 flex flex-col items-center text-center group">
                        <div className="w-16 h-16 rounded-full clay-pill flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform">
                            <Users className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-extrabold mb-2 text-[var(--color-clay-text)]">Join a Room</h2>
                        <p className="text-[var(--color-clay-text-muted)] font-medium mb-10 text-sm">Have a room code? Enter it below to join an existing coding battle.</p>
                        
                        <form onSubmit={handleJoinMatch} className="w-full flex flex-col sm:flex-row gap-4 mt-auto">
                            <input 
                                type="text"
                                placeholder="e.g. A3X9KL"
                                value={joinRoomId}
                                onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                                className="flex-1 w-full clay-panel px-4 py-4 text-center font-mono text-lg font-extrabold text-[var(--color-clay-text)] placeholder-[var(--color-clay-text-muted)] outline-none"
                                maxLength={6}
                            />
                            <button 
                                type="submit"
                                disabled={isJoining || !joinRoomId}
                                className="clay-btn w-full sm:w-auto px-8 py-4 text-blue-600 dark:text-blue-400 font-extrabold disabled:opacity-50 flex items-center justify-center shrink-0"
                            >
                                {isJoining ? "..." : "Join"}
                            </button>
                        </form>
                        
                        <div className="w-full mt-6 pt-6 border-t border-white/5">
                            <button
                                onClick={() => setShowCustomModal(true)}
                                className="w-full py-3 text-slate-400 hover:text-white font-semibold flex items-center justify-center gap-2 transition"
                            >
                                <Settings className="w-4 h-4" /> Create Custom Room
                            </button>
                        </div>
                    </div>
                </div>

                {/* Custom Room Modal */}
                {showCustomModal && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
                        <div className="bg-[var(--color-clay-bg)] border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-black text-[var(--color-clay-text)] flex items-center gap-2">
                                    <Settings className="w-6 h-6 text-purple-500" /> Custom Room
                                </h2>
                                <button onClick={() => setShowCustomModal(false)} className="text-slate-500 hover:text-white">✕</button>
                            </div>

                            <form onSubmit={handleCreateCustomRoom} className="space-y-6">
                                <div>
                                    <label className="text-sm font-bold text-slate-400 block mb-2">Max Participants ({customMaxParticipants})</label>
                                    <input 
                                        type="range" 
                                        min="2" max="10" 
                                        value={customMaxParticipants}
                                        onChange={(e) => setCustomMaxParticipants(Number(e.target.value))}
                                        className="w-full accent-purple-500"
                                    />
                                </div>
                                
                                <div>
                                    <label className="text-sm font-bold text-slate-400 block mb-2">Question Configuration</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div>
                                            <span className="text-xs text-emerald-400 font-bold block mb-1">Easy (10m)</span>
                                            <select value={customEasyCount} onChange={e => setCustomEasyCount(Number(e.target.value))} className="w-full clay-panel px-2 py-2 text-sm font-bold text-[var(--color-clay-text)] outline-none">
                                                {[0,1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <span className="text-xs text-amber-400 font-bold block mb-1">Med (15m)</span>
                                            <select value={customMediumCount} onChange={e => setCustomMediumCount(Number(e.target.value))} className="w-full clay-panel px-2 py-2 text-sm font-bold text-[var(--color-clay-text)] outline-none">
                                                {[0,1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <span className="text-xs text-red-400 font-bold block mb-1">Hard (20m)</span>
                                            <select value={customHardCount} onChange={e => setCustomHardCount(Number(e.target.value))} className="w-full clay-panel px-2 py-2 text-sm font-bold text-[var(--color-clay-text)] outline-none">
                                                {[0,1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    {!useCustomGlobalTimer && (
                                        <p className="text-xs text-slate-500 mt-2">
                                            Auto Timer: {(customEasyCount * 10) + (customMediumCount * 15) + (customHardCount * 20)} mins total (Per-question mode)
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-400 mb-2 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={useCustomGlobalTimer} 
                                            onChange={e => setUseCustomGlobalTimer(e.target.checked)}
                                            className="accent-purple-500 w-4 h-4"
                                        />
                                        Override with Global Match Timer
                                    </label>
                                    {useCustomGlobalTimer && (
                                        <select 
                                            value={customGlobalTimerMins} 
                                            onChange={(e) => setCustomGlobalTimerMins(Number(e.target.value))}
                                            className="w-full clay-panel px-4 py-3 font-bold text-[var(--color-clay-text)] outline-none"
                                        >
                                            <option value={15}>15 Minutes</option>
                                            <option value={30}>30 Minutes</option>
                                            <option value={60}>1 Hour</option>
                                            <option value={120}>2 Hours</option>
                                        </select>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-white/10">
                                    <h3 className="text-sm font-black text-purple-400 mb-4">Hardcore Rules (Optional)</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-400 block mb-1">Wrong Answer Penalty</label>
                                            <select value={penaltyType} onChange={e => setPenaltyType(e.target.value)} className="w-full clay-panel px-3 py-2 text-sm font-bold text-[var(--color-clay-text)] outline-none">
                                                <option value="none">None (Standard Scoring)</option>
                                                <option value="marks">-5 Points per Failed Submission</option>
                                                <option value="time">+5 Minutes Penalty (Tie-breaker)</option>
                                            </select>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <label className="flex items-center gap-2 text-xs font-bold text-slate-400 cursor-pointer">
                                                <input type="checkbox" checked={hideTestCases} onChange={e => setHideTestCases(e.target.checked)} className="accent-purple-500 w-4 h-4" />
                                                Hide Edge Cases
                                            </label>
                                            <label className="flex items-center gap-2 text-xs font-bold text-slate-400 cursor-pointer">
                                                <input type="checkbox" checked={blindMode} onChange={e => setBlindMode(e.target.checked)} className="accent-purple-500 w-4 h-4" />
                                                Blind Coding (No Run)
                                            </label>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-bold text-slate-400 block mb-1">Early Finish Bonus</label>
                                                <input type="number" min="0" max="50" value={bonusMarks} onChange={e => setBonusMarks(Number(e.target.value))} className="w-full clay-panel px-3 py-2 text-sm font-bold text-[var(--color-clay-text)] outline-none" />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-400 block mb-1">Max Warnings (Cheat)</label>
                                                <input type="number" min="0" max="10" value={maxWarnings} onChange={e => setMaxWarnings(Number(e.target.value))} className="w-full clay-panel px-3 py-2 text-sm font-bold text-[var(--color-clay-text)] outline-none" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    type="submit"
                                    disabled={createRoom.isPending}
                                    className="clay-btn w-full py-4 mt-4 text-purple-400 font-extrabold text-lg flex items-center justify-center gap-2"
                                >
                                    {createRoom.isPending ? "Generating..." : "Create Room"}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
        </div>
    );
}
