"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Bell,
  BookOpen,
  CircleDot,
  Clock3,
  Crosshair,
  Gauge,
  Medal,
  Settings,
  Sword,
  PanelLeftClose,
  PanelLeftOpen,
  Trophy,
  UserCircle2,
} from "lucide-react";

type DashboardViewProps = {
  displayName: string;
  avatarUrl?: string;
  streakDays: number;
};

type AchievementItem = {
  title: string;
  detail: string;
  progressLabel: string;
  progressPercent: number;
  actionLabel?: string;
};

const primaryCards = [
  {
    title: "Practice",
    subtitle: "Solve problems sorted by difficulty.",
    cta: "Start Coding",
    icon: BookOpen,
    iconClass: "bg-emerald-500/20 text-emerald-400",
    href: "/practice",
  },
  {
    title: "Arena Duel",
    subtitle: "1v1 battles against other devs.",
    cta: "Find Match",
    icon: Sword,
    iconClass: "bg-red-500/20 text-red-400",
    href: "/arena",
  },
  {
    title: "Contest",
    subtitle: "Weekly contests to boost rating.",
    cta: "Register",
    icon: Clock3,
    iconClass: "bg-sky-500/20 text-sky-400",
    href: "/contest",
  },
  {
    title: "Leaderboard",
    subtitle: "View global rankings.",
    cta: "View Top",
    icon: Trophy,
    iconClass: "bg-amber-500/20 text-amber-400",
    href: "/leaderboard",
  },
] as const;

const achievementProgress: AchievementItem[] = [
  {
    title: "Language Ninja",
    detail: "Solve in 4 different languages",
    progressLabel: "4 / 4",
    progressPercent: 100,
    actionLabel: "Claim Badge",
  },
  {
    title: "Century Club",
    detail: "Solve 100 problems",
    progressLabel: "82 / 100",
    progressPercent: 82,
  },
  {
    title: "Titan Slayer",
    detail: "Solve 20 Hard problems",
    progressLabel: "10 / 20",
    progressPercent: 50,
  },
] as const;

const recentActivity = [
  {
    title: "Binary Tree Maximum Path Sum",
    level: "Hard",
    status: "Failed",
    statusClass: "bg-red-500/15 text-red-400",
    timeAgo: "1h ago",
  },
  {
    title: "Letter Combinations",
    level: "Medium",
    status: "Completed",
    statusClass: "bg-emerald-500/15 text-emerald-400",
    timeAgo: "2h ago",
  },
  {
    title: "Palindrome Number",
    level: "Easy",
    status: "Completed",
    statusClass: "bg-emerald-500/15 text-emerald-400",
    timeAgo: "1d ago",
  },
] as const;

const sidebarNavItems = [
  { title: "Dashboard", href: "/dashboard", icon: Gauge, active: true },
  { title: "Practice", href: "/practice", icon: BookOpen, active: false },
  { title: "Arena Duel", href: "/arena", icon: Sword, active: false },
  { title: "Contest", href: "/contest", icon: Clock3, active: false },
  { title: "Leaderboard", href: "/leaderboard", icon: Trophy, active: false },
] as const;

const heatmapRows = [
  [1, 0, 2, 3, 0, 1, 4, 0, 2, 3, 0, 1, 0, 2, 4, 3],
  [0, 2, 0, 1, 3, 4, 0, 1, 2, 0, 4, 1, 0, 2, 1, 0],
  [3, 4, 0, 1, 2, 0, 2, 3, 0, 1, 2, 0, 3, 4, 0, 1],
  [0, 2, 1, 0, 4, 2, 0, 3, 4, 0, 1, 2, 3, 0, 4, 1],
  [1, 0, 3, 4, 1, 0, 2, 0, 3, 4, 0, 2, 1, 0, 3, 4],
] as const;

const heatColorByValue = (value: number) => {
  if (value === 0) return "bg-[#171923]";
  if (value === 1) return "bg-violet-900/80";
  if (value === 2) return "bg-violet-700/80";
  if (value === 3) return "bg-violet-500/90";
  return "bg-violet-300";
};

export function DashboardView({ displayName, avatarUrl, streakDays }: DashboardViewProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  return (
    <main className="min-h-screen bg-[#06080d] text-slate-100">
      <div className="mx-auto flex max-w-370">
        <aside
          className={`sticky top-0 hidden h-screen shrink-0 border-r border-white/10 bg-[#0a0d12] transition-[width] duration-300 xl:block ${isSidebarCollapsed ? "w-20" : "w-64"}`}
        >
          <div className="flex h-full flex-col">
            <div className={`border-b border-white/10 py-5 ${isSidebarCollapsed ? "px-4" : "px-6"}`}>
              <Link href="/dashboard" className={`flex items-center ${isSidebarCollapsed ? "justify-center" : "gap-3"}`}>
                <span className="relative h-9 w-9 overflow-hidden rounded-lg border border-white/20 bg-white/5">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={`${displayName} profile picture`}
                      fill
                      sizes="36px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-white">
                      {displayName.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                </span>
                {!isSidebarCollapsed ? (
                  <span className="max-w-42 truncate text-lg font-semibold tracking-tight text-white">{displayName}</span>
                ) : null}
              </Link>
            </div>

            <nav className={`flex-1 py-5 ${isSidebarCollapsed ? "px-2" : "px-4"}`}>
              <ul className="space-y-2">
                {sidebarNavItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <li key={item.title}>
                      <Link
                        href={item.href}
                        title={item.title}
                        className={`flex rounded-lg px-3 py-2 text-sm transition ${isSidebarCollapsed ? "justify-center" : "items-center gap-3"} ${item.active ? "bg-violet-600/25 font-medium text-violet-300" : "text-slate-300 hover:bg-white/5"}`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {!isSidebarCollapsed ? <span>{item.title}</span> : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className={`border-t border-white/10 py-4 ${isSidebarCollapsed ? "px-2" : "px-4"}`}>
              <button
                type="button"
                title="Settings"
                className={`flex w-full rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5 ${isSidebarCollapsed ? "justify-center" : "items-center gap-3"}`}
              >
                <Settings className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed ? <span>Settings</span> : null}
              </button>
              <button
                type="button"
                title="Logout"
                className={`mt-2 flex w-full rounded-lg px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10 ${isSidebarCollapsed ? "justify-center" : "items-center gap-3"}`}
              >
                <CircleDot className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed ? <span>Logout</span> : null}
              </button>
            </div>
          </div>
        </aside>

        <section className="flex-1 border-l border-white/5 xl:border-l-0">
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/10 bg-[#070a11]/95 px-4 backdrop-blur md:px-8">
            <button
              type="button"
              onClick={toggleSidebar}
              className="hidden rounded-xl border border-violet-500/30 bg-violet-500/15 p-2 text-violet-300 transition hover:bg-violet-500/25 xl:inline-flex"
              aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isSidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>

            <div className="xl:hidden" />

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="rounded-xl border border-violet-500/30 bg-violet-600/20 p-2 text-violet-200"
                aria-label="Profile"
              >
                <UserCircle2 className="h-4 w-4" />
              </button>
            </div>
          </header>

          <div className="space-y-5 px-4 py-6 md:px-8 md:py-8">
            <section>
              <h1 className="text-3xl font-bold tracking-tight text-white">Welcome back, {displayName}!</h1>
              <p className="mt-1 text-sm text-slate-400">
                You&apos;re on a <span className="font-semibold text-emerald-400">{streakDays} day streak.</span> Keep it up!
              </p>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
              {primaryCards.map((card) => {
                const Icon = card.icon;

                return (
                  <article
                    key={card.title}
                    className="rounded-2xl border border-white/10 bg-linear-to-b from-[#0f151f] to-[#0b1018] p-5 shadow-[0_18px_50px_-35px_rgba(0,0,0,0.8)]"
                  >
                    <div className={`mb-4 inline-flex rounded-lg p-2 ${card.iconClass}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <h2 className="text-lg font-semibold text-white">{card.title}</h2>
                    <p className="mt-1 text-xs text-slate-400">{card.subtitle}</p>
                    <Link
                      href={card.href}
                      className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-slate-100 transition hover:text-violet-300"
                    >
                      {card.cta} <span aria-hidden>›</span>
                    </Link>
                  </article>
                );
              })}
            </section>

            <section className="grid gap-4 xl:grid-cols-[1fr,1.9fr]">
              <article className="rounded-2xl border border-white/10 bg-[#0e121b] p-5">
                <h3 className="text-base font-semibold text-white">Problems Solved</h3>
                <div className="mt-5 flex justify-center">
                  <div className="relative h-40 w-40 rounded-full bg-[conic-gradient(#22c55e_0_46%,#f59e0b_46%_79%,#ef4444_79%_100%)]">
                    <div className="absolute inset-4.5 flex items-center justify-center rounded-full bg-[#0e121b]">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-white">56</p>
                        <p className="text-xs text-slate-400">Solved</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-lg border border-white/10 bg-[#111826] px-2 py-2">
                    <p className="text-[10px] uppercase tracking-wide text-slate-500">Easy</p>
                    <p className="mt-1 text-lg font-semibold text-emerald-400">26</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-[#111826] px-2 py-2">
                    <p className="text-[10px] uppercase tracking-wide text-slate-500">Medium</p>
                    <p className="mt-1 text-lg font-semibold text-amber-400">22</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-[#111826] px-2 py-2">
                    <p className="text-[10px] uppercase tracking-wide text-slate-500">Hard</p>
                    <p className="mt-1 text-lg font-semibold text-rose-400">8</p>
                  </div>
                </div>
              </article>

              <article className="rounded-2xl border border-white/10 bg-[#0e121b] p-5">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <h3 className="text-base font-semibold text-white">Problems Solved History</h3>
                  <button
                    type="button"
                    className="rounded-md border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
                  >
                    View Weekly Chart
                  </button>
                </div>

                <div className="rounded-xl border border-white/10 bg-[#0c1019] px-3 py-3">
                  <div className="grid grid-cols-16 gap-1.5">
                    {heatmapRows.flatMap((row, rowIndex) =>
                      row.map((value, colIndex) => (
                        <span
                          key={`${rowIndex}-${colIndex}`}
                          className={`h-3 w-3 rounded-sm ${heatColorByValue(value)}`}
                          aria-hidden
                        />
                      )),
                    )}
                  </div>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                  <StatPill title="Current Streak" value="12 Days" />
                  <StatPill title="Accuracy" value="92%" />
                  <StatPill title="Top Percentile" value="Top 10%" />
                  <StatPill title="Global Ranking" value="#6 / 74" />
                </div>
              </article>
            </section>

            <section className="grid gap-4 xl:grid-cols-2">
              <article className="rounded-2xl border border-white/10 bg-[#0e121b] p-5">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <h3 className="text-base font-semibold text-white">Achievement Progress</h3>
                  <button
                    type="button"
                    className="rounded-md border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
                  >
                    View Achievement List
                  </button>
                </div>

                <div className="space-y-3">
                  {achievementProgress.map((item) => (
                    <div key={item.title} className="rounded-xl border border-white/10 bg-[#101624] p-3">
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2">
                          <span className="mt-0.5 rounded-full bg-violet-600/20 p-1 text-violet-300">
                            <Medal className="h-3.5 w-3.5" />
                          </span>
                          <div>
                            <p className="text-sm font-medium text-white">{item.title}</p>
                            <p className="text-xs text-slate-400">{item.detail}</p>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400">{item.progressLabel}</p>
                      </div>

                      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-linear-to-r from-violet-600 to-fuchsia-500"
                          style={{ width: `${item.progressPercent}%` }}
                        />
                      </div>

                      {item.actionLabel ? (
                        <button
                          type="button"
                          className="mt-2 rounded-md bg-violet-600/90 px-2.5 py-1 text-xs font-medium text-white"
                        >
                          {item.actionLabel}
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-2xl border border-white/10 bg-[#0e121b] p-5">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <h3 className="text-base font-semibold text-white">Recent Activity</h3>
                  <button
                    type="button"
                    className="rounded-md border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
                  >
                    View Full History
                  </button>
                </div>

                <div className="space-y-3">
                  {recentActivity.map((item) => (
                    <div
                      key={item.title}
                      className="flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-[#101624] px-3 py-3"
                    >
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 rounded-full bg-emerald-500/20 p-1.5 text-emerald-400">
                          <Crosshair className="h-3.5 w-3.5" />
                        </span>
                        <div>
                          <p className="text-sm font-medium text-white">{item.title}</p>
                          <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                            <span>{item.level}</span>
                            <span className="text-slate-600">•</span>
                            <span>{item.timeAgo}</span>
                          </div>
                        </div>
                      </div>

                      <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${item.statusClass}`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </article>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatPill({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#111826] px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-wide text-slate-500">{title}</p>
      <p className="mt-1 text-sm font-semibold text-slate-100">{value}</p>
    </div>
  );
}