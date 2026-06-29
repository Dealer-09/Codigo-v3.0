"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import Image from "next/image";
import { Trophy, Swords, Loader2 } from "lucide-react";

export default function LeaderboardPage() {
    const [activeTab, setActiveTab] = useState<"global" | "arena">("global");
    
    // Fetch data based on active tab
    const { data: users, isLoading } = api.user.getLeaderboard.useQuery({ 
        limit: 50, 
        sortBy: activeTab === "global" ? "problemsSolved" : "arenaWinsCount" 
    });

    return (
        <div className="pt-10 px-6 max-w-5xl mx-auto pb-20">
            <div className="mb-12 text-center relative">
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 text-[var(--color-clay-text)]">
                    {activeTab === "global" ? "Global" : "Arena"} <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Leaderboard</span>
                </h1>
                <p className="text-[var(--color-clay-text-muted)] font-medium text-lg">
                    {activeTab === "global" 
                        ? "Top developers ranked by problems solved." 
                        : "Fiercest combatants ranked by arena victories."}
                </p>
            </div>

            {/* Tabs */}
            <div className="flex justify-center mb-8">
                <div className="clay-panel p-1 rounded-2xl flex gap-1">
                    <button 
                        onClick={() => setActiveTab("global")}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${
                            activeTab === "global" 
                                ? "bg-amber-500/20 text-amber-400 shadow-sm" 
                                : "text-slate-400 hover:text-white hover:bg-white/5"
                        }`}
                    >
                        <Trophy className="w-4 h-4" /> Global Ranking
                    </button>
                    <button 
                        onClick={() => setActiveTab("arena")}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${
                            activeTab === "arena" 
                                ? "bg-rose-500/20 text-rose-400 shadow-sm" 
                                : "text-slate-400 hover:text-white hover:bg-white/5"
                        }`}
                    >
                        <Swords className="w-4 h-4" /> Arena Ranking
                    </button>
                </div>
            </div>
                
            <div className="clay-panel overflow-hidden mt-2 relative min-h-[400px]">
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-[var(--color-clay-text-muted)]/20 bg-black/5 dark:bg-white/5">
                                    <th className="py-4 px-6 font-bold text-[var(--color-clay-text)] w-24 text-center">Rank</th>
                                    <th className="py-4 px-6 font-bold text-[var(--color-clay-text)]">Developer</th>
                                    <th className="py-4 px-6 font-bold text-[var(--color-clay-text)] text-center">
                                        {activeTab === "global" ? "Solved" : "Wins"}
                                    </th>
                                    <th className="py-4 px-6 font-bold text-[var(--color-clay-text)] text-center hidden sm:table-cell">Streak</th>
                                </tr>
                            </thead>
                            <tbody>
                                {!users || users.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-12 text-center text-gray-500 font-bold">
                                            No ranked users yet.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user, index) => (
                                        <tr 
                                            key={user.id} 
                                            className="border-b border-[var(--color-clay-text-muted)]/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                        >
                                            <td className="py-4 px-6 text-center">
                                                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                                                    index === 0 ? 'bg-amber-500/20 text-amber-400' :
                                                    index === 1 ? 'bg-slate-300/20 text-slate-300' :
                                                    index === 2 ? 'bg-orange-700/20 text-orange-400' :
                                                    'text-gray-500'
                                                }`}>
                                                    #{index + 1}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    {user.image ? (
                                                        <Image 
                                                            src={user.image} 
                                                            alt={user.name || "User"} 
                                                            width={40} 
                                                            height={40} 
                                                            className="rounded-full border border-white/10"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-inner">
                                                            {(user.name?.[0] || "U").toUpperCase()}
                                                        </div>
                                                    )}
                                                    <span className="font-bold text-[var(--color-clay-text)]">{user.name || "Anonymous Coder"}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <span className={`font-semibold ${activeTab === "global" ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                    {activeTab === "global" ? user.problemsSolved : user.arenaWinsCount}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-center hidden sm:table-cell">
                                                <span className="text-orange-400 font-medium">{user.streakCount} 🔥</span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
