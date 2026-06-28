import { api } from "~/trpc/server";
import { ArenaWorkspace } from "~/_components/arena/ArenaWorkspace";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";

export default async function PracticeSolvePage({
    params
}: {
    params: Promise<{ problemId: string }>
}) {
    const { problemId } = await params;
    
    // Auth Check
    const user = await currentUser();
    if (!user) {
        redirect("/sign-in");
    }

    // Fetch problem details
    let problem;
    try {
        problem = await api.problem.getById({ id: problemId });
    } catch (error) {
        console.error("Error fetching problem:", error);
        notFound();
    }
    
    if (!problem) {
        notFound();
    }

    return (
        <main className="h-screen bg-[#06080d] text-slate-100 flex flex-col overflow-hidden">
            {/* Minimalist Topbar for Practice */}
            <header className="h-14 border-b border-white/10 bg-[#0a0d12] flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-4">
                    <Link href={`/practice/${problem.difficulty === 'easy' ? 'beginner' : problem.difficulty === 'medium' ? 'intermediate' : 'advanced'}`} className="text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <span className="font-bold text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                        SOLO PRACTICE
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-semibold text-slate-300 border border-white/10">
                        Practice Mode
                    </span>
                </div>
            </header>

            {/* Workspace Area */}
            <ArenaWorkspace 
                problem={{
                    id: problem.id,
                    title: problem.title,
                    description: problem.description,
                    difficulty: problem.difficulty,
                    examples: JSON.stringify(problem.examples),
                    constraints: problem.constraints
                }} 
            />
        </main>
    );
}
