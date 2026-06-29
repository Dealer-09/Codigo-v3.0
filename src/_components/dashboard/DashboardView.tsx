"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Clock3,
  Sword,
  Trophy,
  ChevronRight,
  Terminal,
  BarChart2
} from "lucide-react";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";

// Moving CustomTooltip outside so it doesn't get recreated on render
const CustomTooltip = ({ active, payload, label, data }: any) => {
  if (active && payload && payload.length) {
    const fullDay = data.find((d: any) => d.day === label)?.fullDay || label;
    return (
      <div className="clay-card border border-white/10 p-3 rounded-xl shadow-2xl">
        <p className="text-[var(--color-clay-text)] font-bold text-sm mb-1">{fullDay}</p>
        <p className="text-purple-400 text-xs font-semibold">Solved : {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

type DashboardViewProps = {
  displayName: string;
  avatarUrl?: string;
  streakDays: number;
  problemsSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  rank: string;
  heatmap: number[][];
  weeklyData: { day: string; fullDay: string; solved: number }[];
  accuracy: number;
  percentile: number;
};

const primaryCards = [
  {
    title: "Practice",
    subtitle: "Solve problems sorted by difficulty.",
    cta: "Start Coding",
    icon: Terminal,
    iconColor: "text-emerald-500",
    bgGlow: "bg-emerald-500/10",
    href: "/practice",
  },
  {
    title: "Arena Duel",
    subtitle: "1v1 battles against other devs.",
    cta: "Find Match",
    icon: Sword,
    iconColor: "text-rose-500",
    bgGlow: "bg-rose-500/10",
    href: "/arena",
  },
  {
    title: "Contest",
    subtitle: "Weekly contests to boost rating.",
    cta: "Register",
    icon: Clock3,
    iconColor: "text-blue-500",
    bgGlow: "bg-blue-500/10",
    href: "/contest",
  },
  {
    title: "Leaderboard",
    subtitle: "View global rankings.",
    cta: "View Top",
    icon: Trophy,
    iconColor: "text-amber-500",
    bgGlow: "bg-amber-500/10",
    href: "/leaderboard",
  },
] as const;

export function DashboardView({ 
  displayName, 
  streakDays,
  problemsSolved,
  easySolved,
  mediumSolved,
  hardSolved,
  rank,
  heatmap,
  weeklyData,
  accuracy,
  percentile
}: DashboardViewProps) {
  const [chartView, setChartView] = useState<"yearly" | "weekly">("yearly");

  // Calculate percentages for the donut chart
  const total = easySolved + mediumSolved + hardSolved || 1;
  const easyPct = (easySolved / total) * 100;
  const medPct = (mediumSolved / total) * 100;
  const hardPct = (hardSolved / total) * 100;

  // Conic gradient string
  const conicGradient = `conic-gradient(#10b981 0% ${easyPct}%, #f59e0b ${easyPct}% ${easyPct + medPct}%, #ef4444 ${easyPct + medPct}% 100%)`;

  return (
    <div className="space-y-8 pb-12 pt-4 w-full max-w-7xl mx-auto">
      
      {/* Header */}
      <section className="px-2 mb-12">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[var(--color-clay-text)] sm:text-4xl md:text-5xl mb-2">
              Welcome back, <span className="text-violet-500">{displayName}!</span>
            </h1>
            <p className="text-base sm:text-lg font-bold text-[var(--color-clay-text-muted)]">
              Let's crush some code today. You're on a <span className="text-emerald-500">{streakDays}-day streak</span>! 🔥
            </p>
          </div>
        </header>
      </section>

      {/* 4 Primary Cards */}
      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {primaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <Link
              key={card.title}
              href={card.href}
              className="flex flex-col clay-card rounded-3xl p-6 transition-all hover:brightness-110 hover:border-[var(--color-clay-text-muted)] group h-[220px]"
            >
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-6 clay-panel ${card.bgGlow}`}>
                <Icon className={`h-6 w-6 ${card.iconColor}`} />
              </div>
              
              <div className="flex-1">
                <h2 className="text-xl font-bold text-[var(--color-clay-text)] mb-1.5">{card.title}</h2>
                <p className="text-sm text-[var(--color-clay-text-muted)] font-medium leading-relaxed pr-4">{card.subtitle}</p>
              </div>

              <div className="flex items-center gap-1 text-sm font-bold text-[var(--color-clay-text-muted)] mt-4 group-hover:text-[var(--color-clay-text)] transition-colors">
                {card.cta} <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </section>

      {/* Stats Layout */}
      <section className="grid gap-5 lg:grid-cols-[1fr_1.5fr] xl:grid-cols-[1fr_2.2fr]">
        
        {/* Problems Solved (Left) */}
        <article className="clay-card rounded-3xl p-8 flex flex-col h-full">
          <h3 className="text-xl font-bold text-[var(--color-clay-text)] mb-8">Problems Solved</h3>
          
          <div className="flex-1 flex flex-col items-center justify-center mb-10">
            <div className="relative h-48 w-48 rounded-full shadow-2xl" style={{ background: conicGradient }}>
              {/* Inner cutout for donut effect */}
              <div className="absolute inset-[15px] rounded-full bg-[var(--color-clay-bg)] flex items-center justify-center">
                <div className="text-center">
                  <p className="text-4xl font-extrabold text-[var(--color-clay-text)]">{problemsSolved}</p>
                  <p className="text-xs font-bold text-[var(--color-clay-text-muted)] mt-1 uppercase tracking-wider">Solved</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="clay-panel rounded-2xl p-4 flex flex-col items-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-clay-text-muted)] mb-1">Easy</p>
              <p className="text-xl font-extrabold text-emerald-500">{easySolved}</p>
            </div>
            <div className="clay-panel rounded-2xl p-4 flex flex-col items-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-clay-text-muted)] mb-1">Medium</p>
              <p className="text-xl font-extrabold text-amber-500">{mediumSolved}</p>
            </div>
            <div className="clay-panel rounded-2xl p-4 flex flex-col items-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-clay-text-muted)] mb-1">Hard</p>
              <p className="text-xl font-extrabold text-rose-500">{hardSolved}</p>
            </div>
          </div>
        </article>

        {/* Problems Solved History (Right) */}
        <article className="clay-card rounded-3xl p-8 flex flex-col h-full min-w-0">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-[var(--color-clay-text)]">Problems Solved History</h3>
            <button 
              onClick={() => setChartView(v => v === "yearly" ? "weekly" : "yearly")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-clay-surface)] hover:brightness-110 text-sm font-bold text-[var(--color-clay-text)] transition border border-white/5 cursor-pointer"
            >
              <BarChart2 className="w-4 h-4" /> {chartView === "yearly" ? "View Weekly Chart" : "View Full Calendar"}
            </button>
          </div>

          {/* Chart Area */}
          {chartView === "weekly" ? (
            <div className="flex-1 min-h-[220px] mb-8 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }} 
                    dy={10} 
                  />
                  <Tooltip content={<CustomTooltip data={weeklyData} />} cursor={{ stroke: '#ffffff33', strokeWidth: 1, strokeDasharray: '3 3' }} />
                  <Area 
                    type="monotone" 
                    dataKey="solved" 
                    stroke="#c084fc" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorSolved)" 
                    activeDot={{ r: 6, fill: '#fff', stroke: '#a855f7', strokeWidth: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 min-h-[220px] mb-8 overflow-x-auto pb-4 custom-scrollbar flex flex-col justify-center">
              <div className="min-w-max">
                {/* Months Header */}
                <div className="flex justify-between text-xs font-bold text-[var(--color-clay-text-muted)] mb-3 px-1">
                  <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span>
                  <span>May</span><span>Jun</span><span>Jul</span><span>Aug</span>
                  <span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                </div>
                
                {/* Grid */}
                <div className="flex flex-col gap-1.5">
                  {heatmap.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex gap-1.5">
                      {row.map((value, colIndex) => (
                        <div
                          key={colIndex}
                          className={`w-3.5 h-3.5 shrink-0 rounded-sm transition-colors hover:ring-1 hover:ring-white/50 cursor-pointer ${
                          value === 0 ? "bg-[var(--color-clay-surface)]" : 
                          value === 1 ? "bg-purple-900/40" :
                          value === 2 ? "bg-purple-700/60" :
                          value === 3 ? "bg-purple-500/80" : "bg-purple-400"
                        }`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
                
                {/* Legend */}
                <div className="flex items-center justify-end gap-2 mt-4 text-xs font-bold text-[var(--color-clay-text-muted)]">
                  <span>Less</span>
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-[2px] bg-[var(--color-clay-surface)]" />
                    <div className="w-3 h-3 rounded-[2px] bg-purple-900/40" />
                    <div className="w-3 h-3 rounded-[2px] bg-purple-700/60" />
                    <div className="w-3 h-3 rounded-[2px] bg-purple-500/80" />
                    <div className="w-3 h-3 rounded-[2px] bg-purple-400" />
                  </div>
                  <span>More</span>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="clay-panel rounded-2xl p-5 flex flex-col justify-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-clay-text-muted)] mb-1.5">Current Streak</p>
              <p className="text-xl font-extrabold text-[var(--color-clay-text)]">{streakDays} Days</p>
            </div>
            <div className="clay-panel rounded-2xl p-5 flex flex-col justify-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-clay-text-muted)] mb-1.5">Accuracy</p>
              <p className="text-xl font-extrabold text-[var(--color-clay-text)]">{accuracy}%</p>
            </div>
            <div className="clay-panel rounded-2xl p-5 flex flex-col justify-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-clay-text-muted)] mb-1.5">Top Percentile</p>
              <p className="text-xl font-extrabold text-[var(--color-clay-text)]">Top {percentile}%</p>
            </div>
            <div className="clay-panel rounded-2xl p-5 flex flex-col justify-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-clay-text-muted)] mb-1.5">Global Ranking</p>
              <p className="text-xl font-extrabold text-[var(--color-clay-text)]">{rank}</p>
            </div>
          </div>
        </article>

      </section>
    </div>
  );
}