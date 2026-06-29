"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Clock, Users, Shield, ArrowRight, Lock } from "lucide-react";
import { api } from "~/trpc/react";

export default function ContestHubPage() {
    const router = useRouter();
    const [joinPassword, setJoinPassword] = useState("");

    const { data: allContests } = api.contest.getAll.useQuery();

    const now = new Date();
    
    const ongoingContests = allContests?.filter(c => new Date(c.startTime) <= now && new Date(c.endTime) >= now).map(c => ({
        id: c.id,
        title: c.title,
        host: c.host.name || "Admin",
        participants: 0,
        endsIn: Math.floor((new Date(c.endTime).getTime() - now.getTime()) / (1000 * 60)) + "m",
        isPrivate: c.isPrivate
    })) || [];

    const upcomingContests = allContests?.filter(c => new Date(c.startTime) > now).map(c => ({
        id: c.id,
        title: c.title,
        host: c.host.name || "Admin",
        startsIn: Math.floor((new Date(c.startTime).getTime() - now.getTime()) / (1000 * 60)) + "m"
    })) || [];

    return (
        <div className="pt-10 px-6 max-w-6xl mx-auto flex flex-col min-h-[80vh] pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-[var(--color-clay-text)] flex items-center gap-4">
                        <Trophy className="w-10 h-10 text-yellow-500" /> Contest Hub
                    </h1>
                    <p className="text-[var(--color-clay-text-muted)] font-medium text-lg max-w-xl">
                        Compete in massive scheduled events, host your own private tournaments, or recruit top talent.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <button 
                        onClick={() => router.push('/contest/admin')}
                        className="clay-btn px-8 py-4 text-purple-400 font-extrabold text-lg flex items-center justify-center gap-2"
                    >
                        <Shield className="w-5 h-5" /> Host a Contest
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column: Ongoing & Upcoming */}
                <div className="lg:col-span-2 space-y-8">
                    
                    <section>
                        <h2 className="text-2xl font-extrabold text-[var(--color-clay-text)] mb-6 flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                            Live Now
                        </h2>
                        <div className="space-y-4">
                            {ongoingContests.map(c => (
                                <div key={c.id} className="clay-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold text-[var(--color-clay-text)]">{c.title}</h3>
                                            {c.isPrivate && <Lock className="w-4 h-4 text-slate-400" />}
                                        </div>
                                        <p className="text-sm font-bold text-slate-400">Hosted by {c.host}</p>
                                    </div>
                                    <div className="flex flex-col sm:items-end gap-3 shrink-0">
                                        <div className="flex items-center gap-4 text-sm font-bold text-slate-400">
                                            <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {c.participants}</span>
                                            <span className="flex items-center gap-1 text-emerald-400"><Clock className="w-4 h-4" /> {c.endsIn} left</span>
                                        </div>
                                        <button onClick={() => router.push(`/contest/${c.id}`)} className="clay-panel px-6 py-2 text-sm font-bold text-[var(--color-clay-text)] hover:text-white transition flex items-center gap-2 w-full sm:w-auto justify-center">
                                            Enter <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-extrabold text-[var(--color-clay-text)] mb-6 flex items-center gap-2">
                            <Clock className="w-6 h-6 text-blue-400" />
                            Upcoming Contests
                        </h2>
                        <div className="space-y-4">
                            {upcomingContests.map(c => (
                                <div key={c.id} className="clay-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-l-blue-500/50">
                                    <div>
                                        <h3 className="text-xl font-bold text-[var(--color-clay-text)] mb-2">{c.title}</h3>
                                        <p className="text-sm font-bold text-slate-400">Hosted by {c.host}</p>
                                    </div>
                                    <div className="flex flex-col sm:items-end gap-3 shrink-0">
                                        <span className="text-sm font-bold text-blue-400 flex items-center gap-1">
                                            Starts in {c.startsIn}
                                        </span>
                                        <button onClick={() => router.push(`/contest/${c.id}`)} className="clay-panel px-6 py-2 text-sm font-bold text-[var(--color-clay-text)] hover:text-white transition">
                                            Register
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                </div>

                {/* Right Column: Private Join & Past Winners */}
                <div className="space-y-8">
                    
                    <div className="clay-card p-8 text-center border-t-4 border-t-purple-500/50">
                        <h3 className="text-xl font-extrabold text-[var(--color-clay-text)] mb-2">Private Contest?</h3>
                        <p className="text-sm font-bold text-slate-400 mb-6">Enter your invitation code below.</p>
                        <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-3">
                            <input 
                                type="text"
                                placeholder="Enter Code or Password"
                                value={joinPassword}
                                onChange={e => setJoinPassword(e.target.value)}
                                className="w-full clay-panel px-4 py-3 text-center font-mono font-bold text-[var(--color-clay-text)] outline-none"
                            />
                            <button className="clay-btn w-full py-3 text-purple-400 font-bold">
                                Join Room
                            </button>
                        </form>
                    </div>

                    <div className="clay-card p-6">
                        <h3 className="text-lg font-extrabold text-[var(--color-clay-text)] mb-6 flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-500" />
                            Recent Hall of Fame
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between pb-4 border-b border-white/5">
                                <div>
                                    <p className="text-sm font-bold text-slate-300">Global Sprint #41</p>
                                    <p className="text-xs font-bold text-yellow-500 mt-1">1st: ThePrimeagen</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between pb-4 border-b border-white/5">
                                <div>
                                    <p className="text-sm font-bold text-slate-300">AlgoMasters Nov</p>
                                    <p className="text-xs font-bold text-yellow-500 mt-1">1st: TJ_Dev</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
