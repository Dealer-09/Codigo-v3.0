"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { Trophy, Plus, X } from "lucide-react";

export default function AdminNewContestPage() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [selectedProblems, setSelectedProblems] = useState<string[]>([]);

    const { data: problemsData } = api.problem.getAll.useQuery({});
    
    const createContest = api.contest.create.useMutation({
        onSuccess: () => {
            alert("Contest created!");
            router.push("/contest");
        },
        onError: (err) => {
            alert(err.message);
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Count selected problems by difficulty
        const selected = problemsData?.problems.filter(p => selectedProblems.includes(p.id)) || [];
        const easyCount = selected.filter(p => p.difficulty.toLowerCase() === "easy").length;
        const mediumCount = selected.filter(p => p.difficulty.toLowerCase() === "medium").length;
        const hardCount = selected.filter(p => p.difficulty.toLowerCase() === "hard").length;
        
        createContest.mutate({
            title,
            description,
            startTime: startTime,
            endTime: endTime,
            penaltyType: "none",
            hideTestCases: false,
            blindMode: false,
            bonusMarks: 5,
            maxWarnings: 3,
            isPrivate: false,
            hasCoHosts: false,
            dbEasyCount: easyCount,
            dbMediumCount: mediumCount,
            dbHardCount: hardCount,
            customProblems: []
        });
    };

    return (
        <div className="min-h-screen p-8 text-[var(--color-clay-text)] max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 rounded-xl clay-pill flex items-center justify-center text-purple-500">
                    <Trophy className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Create New Contest</h1>
                    <p className="text-[var(--color-clay-text-muted)] text-sm font-medium">Schedule a coding competition for your venue</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="clay-card p-8 flex flex-col gap-6">
                <div>
                    <label className="block text-sm font-bold text-[var(--color-clay-text-muted)] mb-2">Contest Title</label>
                    <input 
                        required
                        type="text" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full clay-panel px-4 py-3 font-medium outline-none text-[var(--color-clay-text)]"
                        placeholder="e.g. Weekly Algorithm Challenge #42"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-[var(--color-clay-text-muted)] mb-2">Description / Rules</label>
                    <textarea 
                        required
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full clay-panel px-4 py-3 font-medium outline-none text-[var(--color-clay-text)] h-32 resize-none"
                        placeholder="Explain the rules and prizes..."
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-[var(--color-clay-text-muted)] mb-2">Start Time</label>
                        <input 
                            required
                            type="datetime-local" 
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full clay-panel px-4 py-3 font-medium outline-none text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-[var(--color-clay-text-muted)] mb-2">End Time</label>
                        <input 
                            required
                            type="datetime-local" 
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="w-full clay-panel px-4 py-3 font-medium outline-none text-white"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-[var(--color-clay-text-muted)] mb-2">Select Problems</label>
                    <div className="flex flex-col gap-2">
                        {problemsData?.problems.map(p => (
                            <label key={p.id} className="flex items-center gap-3 p-3 clay-panel cursor-pointer group hover:border-purple-500/30 border border-transparent transition-all">
                                <input 
                                    type="checkbox"
                                    checked={selectedProblems.includes(p.id)}
                                    onChange={(e) => {
                                        if (e.target.checked) setSelectedProblems([...selectedProblems, p.id]);
                                        else setSelectedProblems(selectedProblems.filter(id => id !== p.id));
                                    }}
                                    className="w-4 h-4 accent-purple-500"
                                />
                                <div>
                                    <span className="font-bold block">{p.title}</span>
                                    <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">{p.difficulty} • {p.category}</span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end mt-4">
                    <button 
                        type="submit" 
                        disabled={createContest.isPending || selectedProblems.length === 0}
                        className="clay-btn px-8 py-3 text-purple-400 font-extrabold flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        {createContest.isPending ? "Creating..." : "Create Contest"}
                    </button>
                </div>
            </form>
        </div>
    );
}
