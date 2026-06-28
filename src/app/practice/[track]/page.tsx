import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Play, Users, Tag } from "lucide-react";
import { api } from "~/trpc/server";

const tracks = {
  beginner: {
    title: "Beginner Track",
    description: "Foundation-focused problems to get you started.",
    difficulty: "easy",
  },
  intermediate: {
    title: "Intermediate Track",
    description: "Data structures and medium-level challenge sets.",
    difficulty: "medium",
  },
  advanced: {
    title: "Advanced Track",
    description: "Complex algorithm and optimization packs.",
    difficulty: "hard",
  },
  "real-world": {
    title: "Real-world Projects",
    description: "Applied project simulations and portfolio tasks.",
    difficulty: "real-world",
  },
} as const;

type TrackKey = keyof typeof tracks;

export default async function PracticeTrackPage({
  params,
}: {
  params: Promise<{ track: string }>;
}) {
  const { track } = await params;
  if (!(track in tracks)) notFound();

  const info = tracks[track as TrackKey];

  // Fetch problems by difficulty
  const data = await api.problem.getAll({ difficulty: info.difficulty as "easy" | "medium" | "hard" | "real-world", limit: 50 });
  const problems = data.problems;

  return (
    <main className="min-h-screen bg-[#06080d] px-4 py-10 text-slate-100 md:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-10 rounded-3xl border border-white/10 bg-[#0d1320] p-8 text-center shadow-lg">
          <h1 className="text-3xl font-bold text-white">{info.title}</h1>
          <p className="mt-3 text-slate-300">{info.description}</p>
          
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/practice"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Back To Tracks
            </Link>
          </div>
        </div>

        {/* Problem List */}
        <div className="space-y-4">
          <h2 className="mb-4 text-xl font-bold text-white">Available Problems ({problems.length})</h2>
          
          {problems.length === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-[#0a0d12] p-10 text-center">
              <p className="text-slate-400">No problems available in this track yet.</p>
            </div>
          ) : (
            problems.map((prob) => (
              <div 
                key={prob.id}
                className="group flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-[#0d1320] p-5 transition-all hover:border-violet-500/30 hover:bg-[#111826] sm:flex-row sm:items-center"
              >
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-violet-300">
                    {prob.title}
                  </h3>
                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {prob.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {prob.solvedCount} Solves
                    </span>
                  </div>
                </div>
                
                <Link
                  href={`/practice/solve/${prob.id}`}
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-600"
                >
                  <Play className="h-4 w-4" />
                  Solve
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}