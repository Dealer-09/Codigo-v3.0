"use client";

import { useState } from "react";
import { api } from "~/trpc/react";


export default function NewProblemPage() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [difficulty, setDifficulty] = useState("easy");
    const [category, setCategory] = useState("Algorithms");
    const [testCases, setTestCases] = useState([{ input: "", expectedOutput: "", isHidden: false }]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const createProblem = api.problem.create.useMutation({
        onSuccess: () => {
            alert("Problem added successfully!");
            setTitle("");
            setDescription("");
            setTestCases([{ input: "", expectedOutput: "", isHidden: false }]);
        },
        onError: (err) => {
            alert(`Error: ${err.message}`);
        }
    });

    const handleAddTestCase = () => {
        setTestCases([...testCases, { input: "", expectedOutput: "", isHidden: false }]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await createProblem.mutateAsync({
                title,
                description,
                difficulty,
                category,
                testCases,
                tags: ["array"], // Defaulting for simplicity (ponytail)
                constraints: "None",
                examples: "[]",
                hints: "[]",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white selection:bg-purple-500/30 pb-20">

            
            <div className="pt-32 px-6 max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Admin: Add New Question</h1>
                
                <form onSubmit={handleSubmit} className="space-y-6 bg-[#0e121b] p-8 rounded-2xl border border-white/10 shadow-2xl">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Title</label>
                        <input 
                            required
                            type="text" 
                            className="w-full bg-[#161b22] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                        <textarea 
                            required
                            rows={4}
                            className="w-full bg-[#161b22] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Difficulty</label>
                            <select 
                                className="w-full bg-[#161b22] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                            >
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                                <option value="real-world">Real-World</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
                            <input 
                                required
                                type="text" 
                                className="w-full bg-[#161b22] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="mt-8 border-t border-white/10 pt-8">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Test Cases</h2>
                            <button type="button" onClick={handleAddTestCase} className="text-sm bg-blue-600/20 text-blue-400 px-3 py-1 rounded-lg hover:bg-blue-600/30">
                                + Add Case
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            {testCases.map((tc, idx) => (
                                <div key={idx} className="grid grid-cols-2 gap-4 bg-[#111826] p-4 rounded-xl border border-white/5">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Input</label>
                                        <input 
                                            required
                                            type="text" 
                                            className="w-full bg-[#161b22] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white"
                                            value={tc.input}
                                            onChange={(e) => {
                                                const newTc = [...testCases];
                                                if (newTc[idx]) newTc[idx].input = e.target.value;
                                                setTestCases(newTc);
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Expected Output</label>
                                        <input 
                                            required
                                            type="text" 
                                            className="w-full bg-[#161b22] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white"
                                            value={tc.expectedOutput}
                                            onChange={(e) => {
                                                const newTc = [...testCases];
                                                if (newTc[idx]) newTc[idx].expectedOutput = e.target.value;
                                                setTestCases(newTc);
                                            }}
                                        />
                                    </div>
                                    <div className="col-span-2 flex items-center gap-2">
                                        <input 
                                            type="checkbox" 
                                            checked={tc.isHidden}
                                            onChange={(e) => {
                                                const newTc = [...testCases];
                                                if (newTc[idx]) newTc[idx].isHidden = e.target.checked;
                                                setTestCases(newTc);
                                            }}
                                        />
                                        <span className="text-xs text-gray-400">Hidden Test Case?</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/20 transition-all hover:opacity-90 disabled:opacity-50"
                    >
                        {isSubmitting ? "Saving..." : "Save Question to Database"}
                    </button>
                </form>
            </div>
        </main>
    );
}
