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
  "backend": {
    title: "Applied Backend Tasks",
    description: "Practical, portfolio-grade real-world API building.",
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
    <main className="min-h-screen px-4 py-10 md:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="clay-card mb-10 rounded-3xl p-8 text-center shadow-[var(--shadow-clay-card)]">
          <h1 className="text-3xl font-bold text-[var(--color-clay-text)]">{info.title}</h1>
          <p className="mt-3 text-[var(--color-clay-text-muted)]">{info.description}</p>
          
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/practice"
              className="clay-btn inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-[var(--color-clay-text)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back To Tracks
            </Link>
          </div>
        </div>

        {/* Problem List */}
        <div className="space-y-4">
          <h2 className="mb-4 text-xl font-bold text-[var(--color-clay-text)]">Available Problems ({problems.length})</h2>
          
          {problems.length === 0 ? (
            <div className="clay-card rounded-2xl p-10 text-center">
              <p className="text-[var(--color-clay-text-muted)]">No problems available in this track yet.</p>
            </div>
          ) : (
            problems.map((prob) => (
              <div 
                key={prob.id}
                className="clay-card group flex flex-col justify-between gap-4 rounded-2xl p-5 transition-all hover:scale-[1.01] sm:flex-row sm:items-center"
              >
                <div>
                  <h3 className="text-lg font-bold text-[var(--color-clay-text)] group-hover:text-violet-500">
                    {prob.title}
                  </h3>
                  <div className="mt-2 flex items-center gap-3 text-xs text-[var(--color-clay-text-muted)]">
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
                  className="clay-btn inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-[var(--color-clay-text)] hover:text-violet-600"
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