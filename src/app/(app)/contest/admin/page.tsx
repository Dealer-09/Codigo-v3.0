"use client";

import { useState } from "react";
import { Shield, Plus, Settings, Users, Key, Clock, Code2, PenTool, LayoutDashboard } from "lucide-react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";

export default function ContestAdminPage() {
    const router = useRouter();
    const createContestMutation = api.contest.create.useMutation({
        onSuccess: (data) => {
            alert("Contest Created! ID: " + data.id);
            setView("dashboard");
            refetchContests();
        },
        onError: (e) => {
            alert("Failed to create contest: " + e.message);
        }
    });

    const { data: pastContests, refetch: refetchContests } = api.contest.getHostedContests.useQuery();
    const [view, setView] = useState<"dashboard" | "form" | "scoreboard" | "problems">("dashboard");
    const [role, setRole] = useState<"host" | "co-host">("host");
    const [cocreatePassword, setCocreatePassword] = useState("");
    const [isCocreatePromptOpen, setIsCocreatePromptOpen] = useState(false);

    const [contestName, setContestName] = useState("");
    const [isPrivate, setIsPrivate] = useState(false);
    const [password, setPassword] = useState("");
    const [hasCoHosts, setHasCoHosts] = useState(false);
    const [coHostPassword, setCoHostPassword] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    // Database Problems
    const [dbEasyCount, setDbEasyCount] = useState(0);
    const [dbMediumCount, setDbMediumCount] = useState(0);
    const [dbHardCount, setDbHardCount] = useState(0);

    // Custom Problems State
    const [customProblems, setCustomProblems] = useState<any[]>([]);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editProblem, setEditProblem] = useState({ 
        title: "", 
        description: "", 
        difficulty: "medium", 
        testCases: [{ input: "", output: "", isHidden: false }]
    });

    // Ruleset State
    const [penaltyType, setPenaltyType] = useState("none");
    const [hideTestCases, setHideTestCases] = useState(false);
    const [blindMode, setBlindMode] = useState(false);
    const [bonusMarks, setBonusMarks] = useState(5);
    const [maxWarnings, setMaxWarnings] = useState(2);

    const handleSaveCustomProblem = () => {
        if (!editProblem.title || !editProblem.description) return;
        setCustomProblems([...customProblems, { id: Math.random().toString(), ...editProblem }]);
        setIsEditorOpen(false);
        setEditProblem({ 
            title: "", 
            description: "", 
            difficulty: "medium", 
            testCases: [{ input: "", output: "", isHidden: false }]
        });
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!contestName || !startTime || !endTime) {
            return alert("Please fill in all required fields (Name, Start Time, End Time)");
        }

        createContestMutation.mutate({
            title: contestName,
            description: "",
            startTime: startTime,
            endTime: endTime,
            isPrivate,
            joinPassword: password,
            hasCoHosts,
            coHostPassword,
            penaltyType,
            hideTestCases,
            blindMode,
            bonusMarks,
            maxWarnings,
            dbEasyCount,
            dbMediumCount,
            dbHardCount,
            customProblems: customProblems.map(cp => ({
                title: cp.title,
                difficulty: cp.difficulty,
                description: cp.description,
                testCases: cp.testCases
            }))
        });
    };

    const handleCoCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (cocreatePassword) {
            setIsCocreatePromptOpen(false);
            setRole("co-host");
            setView("form");
        }
    };

    if (view === "dashboard") {
        return (
            <div className="pt-10 px-6 max-w-5xl mx-auto flex flex-col min-h-[80vh] pb-20">
                <div className="mb-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-[var(--color-clay-text)] flex items-center gap-4">
                        <Shield className="w-10 h-10 text-purple-500" /> Organizer Dashboard
                    </h1>
                    <p className="text-[var(--color-clay-text-muted)] font-medium text-lg max-w-xl">
                        Manage your past contests or launch new massive tournaments.
                    </p>
                </div>

                <div className="clay-card p-8 mb-8">
                    <h2 className="text-xl font-extrabold text-[var(--color-clay-text)] mb-6 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-400" /> Past Contests
                    </h2>
                    
                    {!pastContests || pastContests.length === 0 ? (
                        <div className="clay-panel p-8 border border-dashed border-white/10 text-center">
                            <p className="text-slate-400 font-bold mb-2">No previous contest creations detected.</p>
                            <p className="text-sm text-slate-500">Your hosted contests will appear here.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pastContests.map(c => (
                                <div key={c.id} className="clay-panel p-4 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-[var(--color-clay-text)]">{c.title}</h3>
                                        <p className="text-xs text-slate-400 mt-1">
                                            {new Date(c.startTime).toLocaleString()} - {new Date(c.endTime).toLocaleString()}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => router.push(`/contest/${c.id}`)}
                                        className="clay-btn px-4 py-2 text-sm text-blue-400 font-bold"
                                    >
                                        Join / View
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-6">
                    <button 
                        onClick={() => {
                            setRole("host");
                            setView("form");
                        }}
                        className="clay-btn flex-1 py-4 text-purple-400 font-extrabold text-lg flex items-center justify-center gap-2"
                    >
                        <Plus className="w-5 h-5" /> Create New Contest
                    </button>
                    <button 
                        onClick={() => setIsCocreatePromptOpen(true)}
                        className="clay-btn flex-1 py-4 text-emerald-400 font-extrabold text-lg flex items-center justify-center gap-2"
                    >
                        <Users className="w-5 h-5" /> Co-Create a Contest
                    </button>
                </div>

                {isCocreatePromptOpen && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
                        <div className="bg-[var(--color-clay-bg)] border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl relative">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-black text-[var(--color-clay-text)] flex items-center gap-2">
                                    <Key className="w-5 h-5 text-emerald-500" /> Co-Create Login
                                </h2>
                                <button onClick={() => setIsCocreatePromptOpen(false)} className="text-slate-500 hover:text-white">✕</button>
                            </div>
                            <form onSubmit={handleCoCreateSubmit} className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 block mb-2">Host Provided Password</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={cocreatePassword} 
                                        onChange={e => setCocreatePassword(e.target.value)} 
                                        className="w-full clay-panel px-4 py-3 font-bold text-[var(--color-clay-text)] outline-none text-center" 
                                    />
                                </div>
                                <button type="submit" className="clay-btn w-full py-3 text-emerald-400 font-extrabold">
                                    Authenticate
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (view === "problems") {
        return (
            <div className="pt-10 px-6 max-w-5xl mx-auto flex flex-col min-h-[80vh] pb-20">
                <div className="mb-10 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-[var(--color-clay-text)] flex items-center gap-4">
                            <PenTool className="w-10 h-10 text-emerald-500" /> Contest Problems
                        </h1>
                        <p className="text-[var(--color-clay-text-muted)] font-medium text-lg max-w-xl">
                            Manage the problem pool for this contest. Toggle visibility or edit custom test cases on the fly.
                        </p>
                    </div>
                    <button onClick={() => setView("form")} className="clay-panel px-6 py-2 text-sm font-bold text-[var(--color-clay-text)] hover:text-white self-start sm:self-auto">
                        ← Back to Studio
                    </button>
                </div>

                <div className="clay-card p-8">
                    <h2 className="text-xl font-extrabold text-[var(--color-clay-text)] mb-6 flex items-center gap-2">
                        <Code2 className="w-5 h-5 text-emerald-400" /> Authored Problems
                    </h2>

                    {customProblems.length === 0 ? (
                        <div className="clay-panel p-6 border border-dashed border-white/10 text-center">
                            <p className="text-slate-400 font-bold">No custom problems available.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {customProblems.map((p, i) => (
                                <div key={p.id} className="clay-panel p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="font-bold text-[var(--color-clay-text)] text-lg">Q{i+1}: {p.title}</h4>
                                            <span className={`text-xs px-2 py-1 rounded-md font-bold uppercase ${p.difficulty === 'hard' ? 'bg-red-500/20 text-red-400' : p.difficulty === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                                {p.difficulty}
                                            </span>
                                        </div>
                                        <div className="text-sm font-bold text-slate-400 flex items-center gap-4">
                                            <span>{p.testCases.length} Total Test Cases</span>
                                            <span>{p.testCases.filter((tc:any) => tc.isHidden).length} Hidden Edge Cases</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <label className="flex items-center gap-2 text-sm font-bold text-slate-300 cursor-pointer">
                                            <input type="checkbox" defaultChecked className="accent-emerald-500 w-4 h-4" />
                                            Active in Contest
                                        </label>
                                        <button 
                                            onClick={() => {
                                                setEditProblem(p);
                                                setIsEditorOpen(true);
                                                // Actually in a real app this would just open the editor, but we should make sure we don't duplicate on save
                                            }}
                                            className="clay-panel p-2 hover:text-white transition"
                                            title="Edit Problem"
                                        >
                                            <PenTool className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (view === "scoreboard") {
        return (
            <div className="pt-10 px-6 max-w-7xl mx-auto flex flex-col min-h-[80vh] pb-20">
                <div className="mb-10 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-[var(--color-clay-text)] flex items-center gap-4">
                            <LayoutDashboard className="w-10 h-10 text-blue-500" /> God View Scoreboard
                        </h1>
                        <p className="text-[var(--color-clay-text-muted)] font-medium text-lg max-w-xl">
                            Live telemetry and statistics of all participants in real-time.
                        </p>
                    </div>
                    <button onClick={() => setView("form")} className="clay-panel px-6 py-2 text-sm font-bold text-[var(--color-clay-text)] hover:text-white self-start sm:self-auto">
                        ← Back to Studio
                    </button>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 clay-card p-8 min-h-[400px] flex items-center justify-center border border-dashed border-white/10">
                        <div className="text-center">
                            <Clock className="w-10 h-10 text-slate-500 mx-auto mb-4 animate-pulse" />
                            <p className="text-slate-400 font-bold text-lg">Contest has not started yet.</p>
                            <p className="text-slate-500 text-sm mt-2">Live participant graphs and solve rates will appear here.</p>
                        </div>
                    </div>
                    <div className="clay-card p-6 border border-dashed border-red-500/20">
                        <h2 className="text-lg font-extrabold text-red-400 mb-6 flex items-center gap-2">
                            <Shield className="w-5 h-5" /> Anti-Cheat Feed
                        </h2>
                        <div className="space-y-4">
                            <p className="text-slate-500 text-sm font-bold text-center mt-10">Monitoring active...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-10 px-6 max-w-5xl mx-auto flex flex-col min-h-[80vh] pb-20">
            <div className="mb-10 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-[var(--color-clay-text)] flex items-center gap-4">
                        <Shield className="w-10 h-10 text-purple-500" /> Contest Studio
                    </h1>
                    <p className="text-[var(--color-clay-text-muted)] font-medium text-lg max-w-xl">
                        Host a massive tournament. Define custom problems, hidden test cases, and enforce strict execution rules.
                    </p>
                </div>
                <button onClick={() => setView("dashboard")} className="clay-panel px-6 py-2 text-sm font-bold text-[var(--color-clay-text)] hover:text-white self-start sm:self-auto">
                    ← Back to Dashboard
                </button>
            </div>

            <form onSubmit={handleCreate} className="grid md:grid-cols-3 gap-8">
                
                {/* Main Settings */}
                <div className="md:col-span-2 space-y-8">
                    <div className="clay-card p-8">
                        <h2 className="text-xl font-extrabold text-[var(--color-clay-text)] mb-6 flex items-center gap-2">
                            <Settings className="w-5 h-5 text-blue-400" /> Basic Details
                        </h2>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="text-sm font-bold text-slate-400 block mb-2">Contest Name</label>
                                <input 
                                    type="text" 
                                    required
                                    value={contestName}
                                    onChange={e => setContestName(e.target.value)}
                                    placeholder="e.g. November Algorithms Clash"
                                    className="w-full clay-panel px-4 py-3 font-bold text-[var(--color-clay-text)] outline-none"
                                />
                            </div>

                            <div className="grid sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-sm font-bold text-slate-400 block mb-2">Start Time</label>
                                    <input 
                                        type="datetime-local" 
                                        required
                                        value={startTime}
                                        onChange={e => setStartTime(e.target.value)}
                                        className="w-full clay-panel px-4 py-3 font-bold text-[var(--color-clay-text)] outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-400 block mb-2">End Time</label>
                                    <input 
                                        type="datetime-local" 
                                        required
                                        value={endTime}
                                        onChange={e => setEndTime(e.target.value)}
                                        className="w-full clay-panel px-4 py-3 font-bold text-[var(--color-clay-text)] outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="clay-card p-8">
                        <h2 className="text-xl font-extrabold text-[var(--color-clay-text)] mb-6 flex items-center gap-2">
                            <Code2 className="w-5 h-5 text-blue-400" /> Platform Problems (Auto-Select)
                        </h2>
                        
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <span className="text-xs text-emerald-400 font-bold block mb-1">Easy</span>
                                <select value={dbEasyCount} onChange={e => setDbEasyCount(Number(e.target.value))} className="w-full clay-panel px-4 py-3 text-sm font-bold text-[var(--color-clay-text)] outline-none">
                                    {[0,1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                            </div>
                            <div>
                                <span className="text-xs text-amber-400 font-bold block mb-1">Medium</span>
                                <select value={dbMediumCount} onChange={e => setDbMediumCount(Number(e.target.value))} className="w-full clay-panel px-4 py-3 text-sm font-bold text-[var(--color-clay-text)] outline-none">
                                    {[0,1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                            </div>
                            <div>
                                <span className="text-xs text-red-400 font-bold block mb-1">Hard</span>
                                <select value={dbHardCount} onChange={e => setDbHardCount(Number(e.target.value))} className="w-full clay-panel px-4 py-3 text-sm font-bold text-[var(--color-clay-text)] outline-none">
                                    {[0,1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="clay-card p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-extrabold text-[var(--color-clay-text)] flex items-center gap-2">
                                <Code2 className="w-5 h-5 text-emerald-400" /> Custom Problems
                            </h2>
                            <button type="button" onClick={() => setIsEditorOpen(true)} className="text-emerald-400 text-sm font-bold hover:text-emerald-300 flex items-center gap-1">
                                <Plus className="w-4 h-4" /> Add Problem
                            </button>
                        </div>
                        
                        {customProblems.length === 0 ? (
                            <div className="clay-panel p-6 border border-dashed border-white/10 text-center">
                                <p className="text-slate-400 font-bold mb-4">No custom problems added yet.</p>
                                <button type="button" onClick={() => setIsEditorOpen(true)} className="clay-btn px-6 py-2 text-emerald-400 font-bold text-sm">
                                    Open Problem Editor
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {customProblems.map((p, i) => (
                                    <div key={p.id} className="clay-panel p-4 flex justify-between items-center">
                                        <div>
                                            <h4 className="font-bold text-[var(--color-clay-text)]">Q{i+1}: {p.title}</h4>
                                            <p className="text-xs text-slate-400 capitalize">{p.difficulty} Difficulty</p>
                                        </div>
                                        <button type="button" onClick={() => setCustomProblems(customProblems.filter(cp => cp.id !== p.id))} className="text-red-400 text-xs font-bold">Remove</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="clay-card p-8">
                        <h2 className="text-xl font-extrabold text-[var(--color-clay-text)] mb-6 flex items-center gap-2">
                            <Settings className="w-5 h-5 text-purple-400" /> Contest Rules & Anti-Cheat
                        </h2>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="text-sm font-bold text-slate-400 block mb-2">Wrong Answer Penalty</label>
                                <select 
                                    value={penaltyType} 
                                    onChange={e => setPenaltyType(e.target.value)} 
                                    className="w-full clay-panel px-4 py-3 font-bold text-[var(--color-clay-text)] outline-none"
                                >
                                    <option value="none">None (Standard Scoring)</option>
                                    <option value="marks">-5 Points per Failed Submission</option>
                                    <option value="time">+5 Minutes Penalty (Tie-breaker)</option>
                                </select>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-6">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-400 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={hideTestCases} 
                                        onChange={e => setHideTestCases(e.target.checked)} 
                                        className="accent-purple-500 w-5 h-5" 
                                    />
                                    Hide Edge Cases
                                </label>
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-400 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={blindMode} 
                                        onChange={e => setBlindMode(e.target.checked)} 
                                        className="accent-purple-500 w-5 h-5" 
                                    />
                                    Blind Coding (No Run Button)
                                </label>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-sm font-bold text-slate-400 block mb-2">Early Finish Bonus (Pts)</label>
                                    <input 
                                        type="number" 
                                        min="0" max="100" 
                                        value={bonusMarks} 
                                        onChange={e => setBonusMarks(Number(e.target.value))} 
                                        className="w-full clay-panel px-4 py-3 font-bold text-[var(--color-clay-text)] outline-none" 
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-400 block mb-2">Max Anti-Cheat Warnings</label>
                                    <input 
                                        type="number" 
                                        min="0" max="10" 
                                        value={maxWarnings} 
                                        onChange={e => setMaxWarnings(Number(e.target.value))} 
                                        className="w-full clay-panel px-4 py-3 font-bold text-[var(--color-clay-text)] outline-none" 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Sidebar Settings */}
                <div className="space-y-8">
                    
                    {role === "host" && (
                        <div className="clay-card p-6">
                            <h2 className="text-lg font-extrabold text-[var(--color-clay-text)] mb-6 flex items-center gap-2">
                                <Key className="w-5 h-5 text-amber-500" /> Access Control
                            </h2>
                            
                            <div className="space-y-6">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-400 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={isPrivate} 
                                        onChange={e => setIsPrivate(e.target.checked)}
                                        className="accent-amber-500 w-4 h-4"
                                    />
                                    Private Contest (Requires Password)
                                </label>

                                {isPrivate && (
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 block mb-2">Join Password (For Participants)</label>
                                        <input 
                                            type="text" 
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            placeholder="Secret code..."
                                            className="w-full clay-panel px-4 py-3 font-bold text-[var(--color-clay-text)] outline-none text-sm"
                                        />
                                    </div>
                                )}

                                <label className="flex items-center gap-2 text-sm font-bold text-slate-400 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={hasCoHosts} 
                                        onChange={e => setHasCoHosts(e.target.checked)}
                                        className="accent-amber-500 w-4 h-4"
                                    />
                                    Allow Co-Hosts
                                </label>

                                {hasCoHosts && (
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 block mb-2">Co-Host Dashboard Password</label>
                                        <input 
                                            type="text" 
                                            value={coHostPassword}
                                            onChange={e => setCoHostPassword(e.target.value)}
                                            placeholder="Admin access code..."
                                            className="w-full clay-panel px-4 py-3 font-bold text-[var(--color-clay-text)] outline-none text-sm"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="clay-card p-6 flex flex-col gap-4">
                        <button 
                            type="button"
                            onClick={() => setView("problems")}
                            className="clay-panel w-full py-4 text-emerald-400 font-extrabold text-sm flex items-center justify-center gap-2 hover:text-emerald-300 transition"
                        >
                            <PenTool className="w-4 h-4" /> Visit Problems
                        </button>
                        <button 
                            type="button"
                            onClick={() => setView("scoreboard")}
                            className="clay-panel w-full py-4 text-blue-400 font-extrabold text-sm flex items-center justify-center gap-2 hover:text-blue-300 transition"
                        >
                            <LayoutDashboard className="w-4 h-4" /> Score Board (God View)
                        </button>
                    </div>

                    <button 
                        type="submit"
                        className="clay-btn w-full py-4 text-purple-400 font-extrabold text-lg flex items-center justify-center gap-2"
                    >
                        Publish Contest
                    </button>

                </div>

            </form>

            {/* Problem Editor Modal */}
            {isEditorOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
                    <div className="bg-[var(--color-clay-bg)] border border-white/10 p-8 rounded-3xl w-full max-w-2xl shadow-2xl relative overflow-hidden">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-[var(--color-clay-text)] flex items-center gap-2">
                                <Code2 className="w-6 h-6 text-emerald-500" /> Problem Editor
                            </h2>
                            <button onClick={() => setIsEditorOpen(false)} className="text-slate-500 hover:text-white">✕</button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-400 block mb-1">Title</label>
                                <input type="text" value={editProblem.title} onChange={e => setEditProblem({...editProblem, title: e.target.value})} className="w-full clay-panel px-4 py-2 font-bold text-[var(--color-clay-text)] outline-none" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 block mb-1">Difficulty</label>
                                <select value={editProblem.difficulty} onChange={e => setEditProblem({...editProblem, difficulty: e.target.value})} className="w-full clay-panel px-4 py-2 font-bold text-[var(--color-clay-text)] outline-none">
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 block mb-1">Description (Markdown)</label>
                                <textarea value={editProblem.description} onChange={e => setEditProblem({...editProblem, description: e.target.value})} className="w-full clay-panel px-4 py-2 font-mono text-sm text-[var(--color-clay-text)] outline-none h-32 resize-none" />
                            </div>
                            <div className="space-y-4 mt-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm font-bold text-[var(--color-clay-text)]">Test Cases</h3>
                                    <button 
                                        type="button" 
                                        onClick={() => setEditProblem({
                                            ...editProblem, 
                                            testCases: [...editProblem.testCases, { input: "", output: "", isHidden: false }]
                                        })} 
                                        className="text-xs font-bold text-blue-400 hover:text-blue-300"
                                    >
                                        + Add Test Case
                                    </button>
                                </div>
                                
                                <div className="max-h-48 overflow-y-auto space-y-4 pr-2">
                                    {editProblem.testCases.map((tc, idx) => (
                                        <div key={idx} className="clay-panel p-4 relative">
                                            {editProblem.testCases.length > 1 && (
                                                <button 
                                                    type="button" 
                                                    onClick={() => setEditProblem({
                                                        ...editProblem,
                                                        testCases: editProblem.testCases.filter((_, i) => i !== idx)
                                                    })}
                                                    className="absolute top-2 right-2 text-red-400 hover:text-red-300 text-xs font-bold"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-xs font-bold text-slate-400 block mb-1">Input {idx + 1}</label>
                                                    <textarea 
                                                        value={tc.input} 
                                                        onChange={e => {
                                                            const newCases = [...editProblem.testCases];
                                                            newCases[idx]!.input = e.target.value;
                                                            setEditProblem({...editProblem, testCases: newCases});
                                                        }} 
                                                        className="w-full clay-panel px-4 py-2 font-mono text-sm text-[var(--color-clay-text)] outline-none h-16 resize-none" 
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-slate-400 block mb-1">Expected Output {idx + 1}</label>
                                                    <textarea 
                                                        value={tc.output} 
                                                        onChange={e => {
                                                            const newCases = [...editProblem.testCases];
                                                            newCases[idx]!.output = e.target.value;
                                                            setEditProblem({...editProblem, testCases: newCases});
                                                        }} 
                                                        className="w-full clay-panel px-4 py-2 font-mono text-sm text-[var(--color-clay-text)] outline-none h-16 resize-none" 
                                                    />
                                                </div>
                                            </div>
                                            <label className="flex items-center gap-2 text-xs font-bold text-slate-400 mt-3 cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={tc.isHidden}
                                                    onChange={e => {
                                                        const newCases = [...editProblem.testCases];
                                                        newCases[idx]!.isHidden = e.target.checked;
                                                        setEditProblem({...editProblem, testCases: newCases});
                                                    }}
                                                    className="accent-emerald-500 w-3 h-3"
                                                />
                                                Hidden Edge Case (Do not show output to players)
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <button onClick={handleSaveCustomProblem} className="clay-btn w-full py-3 text-emerald-400 font-extrabold text-lg mt-4">
                                Save Problem to Contest
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
