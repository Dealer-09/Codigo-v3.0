import { api } from "~/trpc/server";
import { Navbar } from "~/_components/layout/Navbar";
import Image from "next/image";

export default async function LeaderboardPage() {
    // ponytail: Fetch server-side, no client-side state needed for a simple list.
    const users = await api.user.getLeaderboard({ limit: 50, sortBy: "problemsSolved" });

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white selection:bg-purple-500/30 pb-20">
            <Navbar />
            
            <div className="pt-32 px-6 max-w-5xl mx-auto">
                <div className="mb-12 text-center relative">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
                        Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Leaderboard</span>
                    </h1>
                    <p className="text-gray-400 text-lg">Top developers ranked by problems solved.</p>
                    
                    {/* Background Glow */}
                    <div className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-600/20 blur-[100px]" />
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#0e121b] overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-[#161b22]">
                                    <th className="py-4 px-6 font-semibold text-gray-300 w-24 text-center">Rank</th>
                                    <th className="py-4 px-6 font-semibold text-gray-300">Developer</th>
                                    <th className="py-4 px-6 font-semibold text-gray-300 text-center">Solved</th>
                                    <th className="py-4 px-6 font-semibold text-gray-300 text-center hidden sm:table-cell">Streak</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-gray-500">
                                            No ranked users yet.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user, index) => (
                                        <tr 
                                            key={user.id} 
                                            className="border-b border-white/5 hover:bg-white/5 transition-colors"
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
                                                    <span className="font-medium text-gray-100">{user.name || "Anonymous Coder"}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <span className="font-semibold text-emerald-400">{user.problemsSolved}</span>
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
                </div>
            </div>
        </main>
    );
}
