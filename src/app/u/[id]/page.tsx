import { api } from "~/trpc/server";
import { Navbar } from "~/_components/layout/Navbar";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Medal, Flame, Target, Trophy } from "lucide-react";

export default async function UserProfilePage(
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;

    try {
        const user = await api.user.getProfile({ userId: params.id });
        if (!user) return notFound();

        return (
            <main className="min-h-screen bg-[#0a0a0a] text-white selection:bg-purple-500/30 pb-20">
                <Navbar />
                
                <div className="pt-32 px-6 max-w-4xl mx-auto">
                    {/* Header Card */}
                    <div className="bg-[#0e121b] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                        <div className="pointer-events-none absolute top-0 right-0 w-64 h-64 bg-purple-600/10 blur-[80px]" />
                        
                        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
                            {user.image ? (
                                <Image 
                                    src={user.image} 
                                    alt={user.name || "User"} 
                                    width={120} 
                                    height={120} 
                                    className="rounded-full border-4 border-[#161b22] shadow-xl"
                                />
                            ) : (
                                <div className="w-[120px] h-[120px] rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-5xl font-bold text-white shadow-xl">
                                    {(user.name?.[0] || "U").toUpperCase()}
                                </div>
                            )}

                            <div className="text-center md:text-left flex-1">
                                <h1 className="text-3xl font-bold text-white mb-2">{user.name || "Anonymous Coder"}</h1>
                                <p className="text-slate-400 mb-6">Joined {user.createdAt.toLocaleDateString()}</p>
                                
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div className="bg-[#161b22] border border-white/5 rounded-xl p-4 text-center">
                                        <Trophy className="w-5 h-5 mx-auto text-amber-400 mb-2" />
                                        <div className="text-xl font-bold text-white">{user.rank}</div>
                                        <div className="text-xs text-slate-500 uppercase tracking-wider">Rank</div>
                                    </div>
                                    <div className="bg-[#161b22] border border-white/5 rounded-xl p-4 text-center">
                                        <Target className="w-5 h-5 mx-auto text-emerald-400 mb-2" />
                                        <div className="text-xl font-bold text-white">{user.problemsSolved}</div>
                                        <div className="text-xs text-slate-500 uppercase tracking-wider">Solved</div>
                                    </div>
                                    <div className="bg-[#161b22] border border-white/5 rounded-xl p-4 text-center">
                                        <Flame className="w-5 h-5 mx-auto text-orange-400 mb-2" />
                                        <div className="text-xl font-bold text-white">{user.streakCount}</div>
                                        <div className="text-xs text-slate-500 uppercase tracking-wider">Streak</div>
                                    </div>
                                    <div className="bg-[#161b22] border border-white/5 rounded-xl p-4 text-center">
                                        <Medal className="w-5 h-5 mx-auto text-blue-400 mb-2" />
                                        <div className="text-xl font-bold text-white">{user.contestsCount}</div>
                                        <div className="text-xs text-slate-500 uppercase tracking-wider">Contests</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Breakdown */}
                    <div className="mt-8 bg-[#0e121b] border border-white/10 rounded-2xl p-8 shadow-xl">
                        <h2 className="text-xl font-bold mb-6">Difficulty Breakdown</h2>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-emerald-400 font-medium">Easy</span>
                                    <span className="text-slate-400">{user.easyCount} solved</span>
                                </div>
                                <div className="h-2 bg-[#161b22] rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500" style={{ width: `${Math.min((user.easyCount / Math.max(1, user.problemsSolved)) * 100, 100)}%` }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-amber-400 font-medium">Medium</span>
                                    <span className="text-slate-400">{user.mediumCount} solved</span>
                                </div>
                                <div className="h-2 bg-[#161b22] rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-500" style={{ width: `${Math.min((user.mediumCount / Math.max(1, user.problemsSolved)) * 100, 100)}%` }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-red-400 font-medium">Hard</span>
                                    <span className="text-slate-400">{user.hardCount} solved</span>
                                </div>
                                <div className="h-2 bg-[#161b22] rounded-full overflow-hidden">
                                    <div className="h-full bg-red-500" style={{ width: `${Math.min((user.hardCount / Math.max(1, user.problemsSolved)) * 100, 100)}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        );
    } catch (e) {
        return notFound();
    }
}
