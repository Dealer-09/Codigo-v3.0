import { api } from "~/trpc/server";
import { Navbar } from "~/_components/layout/Navbar";
import Link from "next/link";
import { BookOpen } from "lucide-react";

export default async function ProblemsPage() {
    // Fetch problems server-side
    const { problems } = await api.problem.getAll({ limit: 50 });

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white selection:bg-purple-500/30 pb-20">
            <Navbar />
            
            <div className="pt-32 px-6 max-w-5xl mx-auto">
                <div className="mb-12 text-center relative">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 flex items-center justify-center gap-4">
                        <BookOpen className="w-12 h-12 text-emerald-500" />
                        Problem <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Sets</span>
                    </h1>
                    <p className="text-gray-400 text-lg">Practice solo before jumping into the Arena.</p>
                    
                    {/* Background Glow */}
                    <div className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-600/10 blur-[100px]" />
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#0e121b] overflow-hidden shadow-2xl">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 bg-[#161b22]">
                                <th className="py-4 px-6 font-semibold text-gray-300">Title</th>
                                <th className="py-4 px-6 font-semibold text-gray-300 text-center">Difficulty</th>
                                <th className="py-4 px-6 font-semibold text-gray-300 text-center hidden md:table-cell">Category</th>
                                <th className="py-4 px-6 font-semibold text-gray-300 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {problems.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-8 text-center text-gray-500">
                                        No problems available yet.
                                    </td>
                                </tr>
                            ) : (
                                problems.map((problem) => (
                                    <tr 
                                        key={problem.id} 
                                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                    >
                                        <td className="py-4 px-6 font-medium text-slate-200">
                                            {problem.title}
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                problem.difficulty === 'easy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                problem.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                                problem.difficulty === 'hard' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                            }`}>
                                                {problem.difficulty.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-center text-sm text-slate-400 hidden md:table-cell">
                                            {problem.category}
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <Link 
                                                href={`/practice/${problem.id}`}
                                                className="inline-flex px-4 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded text-sm font-medium transition"
                                            >
                                                Solve
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}
