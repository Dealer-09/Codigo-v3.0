import Link from "next/link";
import { ArrowLeft, ArrowRight, Bot, Server, Code2, Cpu, Sparkles } from "lucide-react";

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
    iconColor: "text-emerald-600 dark:text-emerald-400",
    bullet: "bg-emerald-500",
  },
  {
    title: "Intermediate Level",
    subtitle: "For programmers ready to sharpen technical depth.",
    points: ["Data structures", "Object-oriented programming", "Medium complexity algorithms"],
    cta: "Level Up Now",
    href: "/practice/intermediate",
    icon: Cpu,
    iconColor: "text-sky-600 dark:text-sky-400",
    bullet: "bg-sky-500",
  },
  {
    title: "Advanced Level",
    subtitle: "Hard challenges for interview and contest confidence.",
    points: ["Complex algorithms", "System design", "Optimization techniques"],
    cta: "Challenge Yourself",
    href: "/practice/advanced",
    icon: Bot,
    iconColor: "text-violet-600 dark:text-violet-400",
    bullet: "bg-violet-500",
  },
  {
    title: "Applied Backend Tasks",
    subtitle: "Write actual backend logic, API handlers, and system components.",
    points: ["API endpoint logic", "Data manipulation & validation", "Core backend workflows"],
    cta: "Practice Backend Now",
    href: "/practice/backend",
    icon: Server,
    iconColor: "text-amber-600 dark:text-amber-400",
    bullet: "bg-amber-500",
  },
] as const;

export function PracticeHub({ displayName }: PracticeHubProps) {
  return (
    <main className="min-h-screen font-sans px-4 pb-12 pt-10 md:px-8">
      <div className="relative mx-auto max-w-6xl">
        <section className="mb-12 text-center">
          <p className="inline-flex items-center gap-2 clay-pill px-5 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
            <Sparkles className="h-4 w-4" /> Practice Mode
          </p>
          <h1 className="mt-6 text-balance text-4xl font-extrabold tracking-tight text-[var(--color-clay-text)] md:text-5xl">
            Practice A Lot Of Code In C, C++, Java, And Python
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-sm font-medium text-[var(--color-clay-text-muted)] md:text-base leading-relaxed">
            Choose a track based on your level and move ahead with clear milestones, themed challenges, and progress that syncs with your dashboard.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {tracks.map((track) => {
            const Icon = track.icon;

            return (
              <article
                key={track.title}
                className="clay-card p-8 flex flex-col"
              >
                <div className={`mb-6 inline-flex clay-pill p-4 ${track.iconColor}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-extrabold leading-tight text-[var(--color-clay-text)]">{track.title}</h2>
                <p className="mt-3 text-sm font-medium leading-relaxed text-[var(--color-clay-text-muted)]">{track.subtitle}</p>

                <ul className="mt-6 space-y-3 text-sm font-bold text-[var(--color-clay-text-muted)] flex-1">
                  {track.points.map((point) => (
                    <li key={point} className="flex items-start gap-3">
                      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${track.bullet}`} />
                      <span className="leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={track.href}
                  className="mt-8 clay-btn inline-flex w-full items-center justify-center gap-2 px-5 py-3.5 text-sm font-extrabold text-[var(--color-clay-text)]"
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