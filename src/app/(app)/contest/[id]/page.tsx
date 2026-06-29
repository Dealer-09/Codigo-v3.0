"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { Shield, Clock, Lock, Key, Users, Code2 } from "lucide-react";
import { ArenaWorkspace } from "~/_components/arena/ArenaWorkspace";

export default function ContestParticipantPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [password, setPassword] = useState("");
    const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number } | null>(null);

    const { data: contest, isLoading } = api.contest.getById.useQuery({ id });
    const joinMutation = api.contest.join.useMutation({
        onSuccess: () => {
            alert("Successfully joined the contest!");
            window.location.reload();
        },
        onError: (e) => {
            alert(e.message);
        }
    });

    useEffect(() => {
        if (!contest) return;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const start = new Date(contest.startTime).getTime();
            const distance = start - now;

            if (distance < 0) {
                setTimeLeft(null); // Started!
                clearInterval(interval);
            } else {
                setTimeLeft({
                    d: Math.floor(distance / (1000 * 60 * 60 * 24)),
                    h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                    s: Math.floor((distance % (1000 * 60)) / 1000)
                });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [contest]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[80vh]">
                <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!contest) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
                <Shield className="w-16 h-16 text-slate-600 mb-4" />
                <h1 className="text-3xl font-black text-slate-400">Contest Not Found</h1>
                <p className="text-slate-500 mt-2">This tournament does not exist or was deleted.</p>
            </div>
        );
    }

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        joinMutation.mutate({ contestId: id, password });
    };

    const hasStarted = new Date() >= new Date(contest.startTime);
    const isFinished = new Date() >= new Date(contest.endTime);

    // If it hasn't started yet, show the waiting room
    if (!hasStarted) {
        return (
            <div className="pt-10 px-6 max-w-4xl mx-auto flex flex-col min-h-[80vh]">
                <div className="clay-card p-12 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-500" />
                    
                    <Shield className="w-20 h-20 text-purple-500 mx-auto mb-6" />
                    <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--color-clay-text)] mb-4">
                        {contest.title}
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
                        {contest.description || "The ultimate competitive programming showdown."}
                    </p>

                    {!contest.hasJoined && contest.isPrivate ? (
                        <div className="max-w-md mx-auto clay-panel p-8">
                            <h3 className="text-xl font-bold text-amber-400 mb-4 flex items-center justify-center gap-2">
                                <Lock className="w-5 h-5" /> Private Tournament
                            </h3>
                            <form onSubmit={handleJoin} className="space-y-4">
                                <input 
                                    type="text" 
                                    placeholder="Enter access code..." 
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full clay-panel px-4 py-3 text-center font-bold outline-none"
                                />
                                <button type="submit" className="clay-btn w-full py-3 text-amber-400 font-bold flex items-center justify-center gap-2">
                                    <Key className="w-4 h-4" /> Unlock & Join
                                </button>
                            </form>
                        </div>
                    ) : !contest.hasJoined && !contest.isPrivate ? (
                        <div className="max-w-md mx-auto clay-panel p-8">
                            <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center justify-center gap-2">
                                <Users className="w-5 h-5" /> Public Tournament
                            </h3>
                            <button onClick={() => joinMutation.mutate({ contestId: id })} className="clay-btn w-full py-3 text-blue-400 font-bold flex items-center justify-center gap-2">
                                Enter Waiting Room
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div className="clay-panel p-8 inline-block">
                                <h3 className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-4 flex items-center justify-center gap-2">
                                    <Clock className="w-4 h-4" /> Starting In
                                </h3>
                                {timeLeft ? (
                                    <div className="flex items-center gap-6 text-3xl font-black text-[var(--color-clay-text)]">
                                        <div className="flex flex-col items-center"><span className="text-purple-400">{timeLeft.d}</span><span className="text-xs text-slate-500 mt-1 uppercase">Days</span></div>
                                        <div className="flex flex-col items-center"><span className="text-blue-400">{timeLeft.h}</span><span className="text-xs text-slate-500 mt-1 uppercase">Hours</span></div>
                                        <div className="flex flex-col items-center"><span className="text-emerald-400">{timeLeft.m}</span><span className="text-xs text-slate-500 mt-1 uppercase">Mins</span></div>
                                        <div className="flex flex-col items-center"><span className="text-amber-400">{timeLeft.s}</span><span className="text-xs text-slate-500 mt-1 uppercase">Secs</span></div>
                                    </div>
                                ) : (
                                    <div className="text-2xl font-bold text-emerald-400 animate-pulse">
                                        Preparing Arena...
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex justify-center gap-8 text-sm font-bold text-slate-400">
                                <div className="flex items-center gap-2"><Users className="w-4 h-4" /> Global Event</div>
                                <div className="flex items-center gap-2"><Code2 className="w-4 h-4" /> {contest.problems.length} Problems</div>
                                <div className="flex items-center gap-2"><Shield className="w-4 h-4" /> Strict Anti-Cheat</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (isFinished) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
                <h1 className="text-4xl font-black text-slate-400 mb-4">Contest Has Ended</h1>
                <p className="text-slate-500">The leaderboard is now finalized.</p>
                <button onClick={() => router.push('/contest')} className="mt-8 clay-btn px-6 py-2 text-purple-400 font-bold">
                    Return to Hub
                </button>
            </div>
        );
    }

    // Calculate total duration for the contest (in minutes)
    const contestDurationMins = Math.floor((new Date(contest.endTime).getTime() - new Date(contest.startTime).getTime()) / (1000 * 60));

    return (
        <div className="w-full h-[calc(100vh-4rem)]">
            <ArenaWorkspace 
                problems={contest.problems.map(p => p.problem)}
                matchType="contest"
                timeLimit={contestDurationMins}
                startedAt={new Date(contest.startTime).toISOString()}
                initialMatchStatus="in-progress"
                penaltyType={contest.penaltyType}
                hideTestCases={contest.hideTestCases}
                blindMode={contest.blindMode}
                bonusMarks={contest.bonusMarks}
            />
        </div>
    );
}
