import Link from "next/link";
import { ArrowLeft, ArrowRight, Bot, BriefcaseBusiness, Code2, Cpu, Sparkles } from "lucide-react";

type PracticeHubProps = {
  displayName: string;
};

const tracks = [
  {
    title: "Beginner Level",
    subtitle: "Perfect for programmers building strong foundations.",
    points: ["Basic syntax and concepts", "Simple algorithms", "Fundamental problem-solving"],
    cta: "Start Learning Now",
    href: "/practice/beginner",
    icon: Code2,
    accent: "from-emerald-500/30 to-emerald-600/10",
    bullet: "bg-emerald-400",
    border: "border-emerald-400/20",
  },
  {
    title: "Intermediate Level",
    subtitle: "For programmers ready to sharpen technical depth.",
    points: ["Data structures", "Object-oriented programming", "Medium complexity algorithms"],
    cta: "Level Up Now",
    href: "/practice/intermediate",
    icon: Cpu,
    accent: "from-sky-500/30 to-sky-600/10",
    bullet: "bg-sky-400",
    border: "border-sky-400/20",
  },
  {
    title: "Advanced Level",
    subtitle: "Hard challenges for interview and contest confidence.",
    points: ["Complex algorithms", "System design", "Optimization techniques"],
    cta: "Challenge Yourself",
    href: "/practice/advanced",
    icon: Bot,
    accent: "from-violet-500/30 to-fuchsia-600/10",
    bullet: "bg-violet-400",
    border: "border-violet-400/20",
  },
  {
    title: "Real-world Projects",
    subtitle: "Apply skills to practical, portfolio-grade builds.",
    points: ["Full-stack application tasks", "Open-source style workflows", "Portfolio-ready project scenarios"],
    cta: "Build Projects Now",
    href: "/practice/real-world",
    icon: BriefcaseBusiness,
    accent: "from-amber-500/30 to-orange-600/10",
    bullet: "bg-amber-400",
    border: "border-amber-400/20",
  },
] as const;

export function PracticeHub({ displayName }: PracticeHubProps) {
  return (
    <main className="min-h-screen bg-[#06080d] px-4 pb-12 pt-10 text-slate-100 md:px-8">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(37,99,235,0.18),transparent_42%),radial-gradient(circle_at_86%_80%,rgba(139,92,246,0.14),transparent_44%)]" />

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back To Dashboard
          </Link>

          <p className="text-right text-sm text-slate-400">
            Welcome, <span className="font-semibold text-slate-100">{displayName}</span>
          </p>
        </div>

        <section className="mb-8 text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
            <Sparkles className="h-3.5 w-3.5" /> Practice Mode
          </p>
          <h1 className="mt-5 text-balance text-3xl font-bold tracking-tight text-white md:text-5xl">
            Practice A Lot Of Code In C, C++, Java, And Python
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-sm text-slate-400 md:text-base">
            Choose a track based on your level and move ahead with clear milestones, themed challenges, and progress that syncs with your dashboard.
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {tracks.map((track) => {
            const Icon = track.icon;

            return (
              <article
                key={track.title}
                className={`group rounded-3xl border bg-linear-to-b ${track.accent} ${track.border} p-6 shadow-[0_20px_60px_-45px_rgba(0,0,0,0.85)] transition hover:-translate-y-1 hover:border-white/20`}
              >
                <div className="mb-4 inline-flex rounded-xl border border-white/15 bg-white/5 p-2.5 text-slate-100">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-bold leading-tight text-white">{track.title}</h2>
                <p className="mt-3 text-sm text-slate-300">{track.subtitle}</p>

                <ul className="mt-5 space-y-2.5 text-sm text-slate-200">
                  {track.points.map((point) => (
                    <li key={point} className="flex items-start gap-2.5">
                      <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${track.bullet}`} />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={track.href}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
                >
                  {track.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}