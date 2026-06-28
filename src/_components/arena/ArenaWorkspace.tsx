"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { Sparkles, Play, Send } from "lucide-react";
import Editor from "@monaco-editor/react";
import confetti from "canvas-confetti";
import { io, Socket } from "socket.io-client";

type Problem = {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    examples: string;
    constraints: string;
};

export function ArenaWorkspace({ problem, roomId }: { problem: Problem, roomId?: string }) {
    const [code, setCode] = useState("function solve() {\n  // Write your code here\n}");
    const [language, setLanguage] = useState("javascript");
    const [aiKey, setAiKey] = useState("");
    const [aiFeedback, setAiFeedback] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isConsoleOpen, setIsConsoleOpen] = useState(false);
    const [runOutput, setRunOutput] = useState("");
    const [customInput, setCustomInput] = useState("");
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Socket State
    const [socket, setSocket] = useState<Socket | null>(null);
    const [opponentStatus, setOpponentStatus] = useState("Waiting for opponent...");
    const [matchStatus, setMatchStatus] = useState("waiting");

    // BYOK State
    const [aiKey, setAiKey] = useState("");

    useEffect(() => {
        // Load key on mount
        const storedKey = localStorage.getItem("codigo_gemini_key");
        if (storedKey) setAiKey(storedKey);

        const handleUpdate = () => {
            const updatedKey = localStorage.getItem("codigo_gemini_key");
            if (updatedKey) setAiKey(updatedKey);
        };
        window.addEventListener("api_key_updated", handleUpdate);

        // Socket Connection
        if (roomId) {
            const newSocket = io("http://localhost:3001");
            setSocket(newSocket);

            newSocket.on("connect", () => {
                newSocket.emit("arena:join-queue", {
                    userId: "user_" + Math.random().toString(36).substring(7), // Mock userId for now since we don't have auth context easily available here
                    username: "Player",
                    difficulty: problem.difficulty
                });
            });

            newSocket.on("arena:match-found", (match: any) => {
                setMatchStatus("in-progress");
                setOpponentStatus("Opponent Coding...");
            });

            newSocket.on("arena:opponent-code-update", () => {
                setOpponentStatus("Opponent Typing...");
                // Reset back to coding after a delay
                setTimeout(() => setOpponentStatus("Opponent Coding..."), 2000);
            });

            newSocket.on("arena:opponent-finished", () => {
                setOpponentStatus("Opponent Finished!");
            });

            return () => {
                newSocket.disconnect();
                window.removeEventListener("api_key_updated", handleUpdate);
            };
        }

        return () => window.removeEventListener("api_key_updated", handleUpdate);
    }, [roomId, problem.difficulty]);

    // Execution Mutations
    const analyzeMutation = api.ai.analyzeCode.useMutation({
        onSuccess: (data) => {
            if (data.status === "success") {
                setAiFeedback(data.feedback.join("\n"));
            } else {
                setAiFeedback(data.message || "Analysis failed.");
            }
            setIsAnalyzing(false);
        },
        onError: (err) => {
            setAiFeedback("Error: " + err.message);
            setIsAnalyzing(false);
        }
    });

    const analyzeTestFailure = api.ai.analyzeTestFailure.useMutation({
        onSuccess: (data) => {
            if (data.feedback) {
                setAiFeedback(`🤖 AI Analysis of Failure:\n${data.feedback}`);
            }
        }
    });

    const handleAskAi = () => {
        if (!aiKey) {
            setAiFeedback("Please enter your Gemini API Key in Dashboard Settings first.");
            return;
        }
        setIsAnalyzing(true);
        analyzeMutation.mutate({
            code,
            language,
            problemId: problem.id,
            apiKey: aiKey
        });
    };

    // Execution Mutations
    const runMutation = api.execution.run.useMutation({
        onSuccess: (data) => {
            setIsConsoleOpen(true);
            if (data.success) {
                setRunOutput(data.output || "Success! (No output generated)");
            } else {
                setRunOutput(`Error:\n${data.error || data.output}`);
            }
        },
        onError: (err) => {
            setIsConsoleOpen(true);
            setRunOutput(`Error running code: ${err.message}`);
        }
    });

    const submitMutation = api.execution.submit.useMutation({
        onSuccess: (data) => {
            setIsConsoleOpen(true);
            if (data.success) {
                const msg = `🎉 ALL TEST CASES PASSED! (${data.passed}/${data.total})\nSubmission Accepted!`;
                setAiFeedback(msg);
                setRunOutput(msg);
                
                // Trigger confetti and show success modal
                if (data.success) {
                    confetti({
                        particleCount: 150,
                        spread: 70,
                        origin: { y: 0.6 }
                    });
                    setShowSuccessModal(true);
                    
                    // Notify opponent
                    if (socket && roomId) {
                        socket.emit("arena:match-finished", { roomId, userId: "user" });
                    }
                }
            } else {
                const msg = `❌ Failed at test case ${data.passed + 1}/${data.total}.\nInput: ${data.failedCase?.input}\nExpected: ${data.failedCase?.expected}\nActual: ${data.failedCase?.actual}\nError: ${data.failedCase?.error}`;
                setAiFeedback(msg + "\n\n🤖 AI is analyzing your failure...");
                setRunOutput(msg);

                // Auto-analyze failure
                if (problem.difficulty === "easy" && aiKey) {
                    analyzeTestFailure.mutate({
                        code,
                        language,
                        problemId: problem.id,
                        failedInput: data.failedCase?.input || "",
                        expectedOutput: data.failedCase?.expected || "",
                        actualOutput: data.failedCase?.actual || "",
                        errorMessage: data.failedCase?.error,
                        apiKey: aiKey
                    });
                }
            }
        },
        onError: (err) => {
            setIsConsoleOpen(true);
            const msg = `Submission Error: ${err.message}`;
            setAiFeedback(msg);
            setRunOutput(msg);
        }
    });

    const handleRun = () => {
        setIsConsoleOpen(true);
        setRunOutput("Running code...");
        runMutation.mutate({ code, language, stdin: customInput });
    };

    const handleSubmitCode = () => {
        setIsConsoleOpen(true);
        setRunOutput("Running against test cases...");
        setAiFeedback("Running against test cases...");
        submitMutation.mutate({ problemId: problem.id, code, language });
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {roomId && (
                <header className="h-14 border-b border-white/10 bg-[#0a0d12] flex items-center justify-between px-6 shrink-0">
                    <div className="flex items-center gap-4">
                        <span className="font-bold text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                            BATTLE ARENA
                        </span>
                        <span className="px-2 py-1 bg-white/5 rounded text-xs font-mono text-slate-400 border border-white/10">
                            Room: {roomId}
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                            <span className="relative flex h-3 w-3">
                                {opponentStatus.includes("Finished") ? (
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                ) : (
                                    <>
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                    </>
                                )}
                            </span>
                            {opponentStatus}
                        </div>
                    </div>
                </header>
            )}
            
            <div className="flex-1 flex overflow-hidden relative">
            {showSuccessModal && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#0a0d12] border border-white/10 p-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-md w-full animate-in fade-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 border border-green-500/50">
                            <Sparkles className="w-10 h-10 text-green-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Accepted!</h2>
                        <p className="text-slate-400 text-center mb-8">
                            You successfully solved <span className="text-white font-semibold">{problem.title}</span>. 
                            {submitMutation.data?.isFirstSolve ? (
                                <span className="block mt-2 text-green-400 font-bold">+{submitMutation.data.earnedPoints} Rank Points!</span>
                            ) : (
                                <span className="block mt-2 text-slate-500">(Already solved previously)</span>
                            )}
                        </p>
                        <div className="flex gap-4 w-full">
                            <button 
                                onClick={() => setShowSuccessModal(false)}
                                className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition"
                            >
                                Keep Editing
                            </button>
                            <a 
                                href="/practice"
                                className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition text-center"
                            >
                                Next Problem
                            </a>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Left Panel: Problem Statement */}
            <div className="w-1/3 min-w-[300px] border-r border-white/10 bg-[#0a0d12] flex flex-col overflow-y-auto custom-scrollbar">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <h1 className="text-2xl font-bold text-white">{problem.title}</h1>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                            problem.difficulty === 'easy' ? 'bg-emerald-500/20 text-emerald-400' :
                            problem.difficulty === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-red-500/20 text-red-400'
                        }`}>
                            {problem.difficulty.toUpperCase()}
                        </span>
                    </div>
                    
                    <div className="prose prose-invert max-w-none text-slate-300">
                        <p className="whitespace-pre-wrap">{problem.description}</p>
                    </div>

                    {problem.constraints && (
                        <div className="mt-8">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Constraints</h3>
                            <div className="bg-white/5 border border-white/10 rounded-lg p-3 font-mono text-sm text-slate-300">
                                {problem.constraints}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Middle Panel: Code Editor */}
            <div className="flex-1 flex flex-col bg-[#06080d]">
                <div className="h-10 bg-[#0a0d12] border-b border-white/10 flex items-center px-4 justify-between">
                    <div className="flex gap-2">
                        <div className="h-3 w-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                        <div className="h-3 w-3 rounded-full bg-amber-500/20 border border-amber-500/50"></div>
                        <div className="h-3 w-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                    </div>
                    <select 
                        className="bg-transparent text-sm text-slate-400 outline-none border-none cursor-pointer"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                    >
                        <option value="javascript" className="bg-[#0a0d12] text-slate-300">JavaScript</option>
                        <option value="python" className="bg-[#0a0d12] text-slate-300">Python 3</option>
                        <option value="c++" className="bg-[#0a0d12] text-slate-300">C++</option>
                    </select>
                </div>
                
                <div className="flex-1 relative flex flex-col min-h-0">
                    <div className="flex-1 relative min-h-0">
                        <Editor
                            height="100%"
                            language={language === "c++" ? "cpp" : language}
                            theme="vs-dark"
                            value={code}
                            onChange={(val) => {
                                setCode(val || "");
                                if (socket && roomId) {
                                    socket.emit("arena:code-update", { roomId, code: val });
                                }
                            }}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                wordWrap: "on",
                                padding: { top: 16 },
                                scrollBeyondLastLine: false,
                            }}
                        />
                    </div>
                    {isConsoleOpen && (
                        <div className="h-64 bg-[#0a0d12] border-t border-white/10 flex flex-col shrink-0">
                            <div className="flex items-center justify-between p-2 border-b border-white/5">
                                <div className="flex gap-4 px-2">
                                    <span className="text-sm font-bold text-slate-400">Execution Output</span>
                                </div>
                                <button onClick={() => setIsConsoleOpen(false)} className="text-slate-500 hover:text-white px-2">✕</button>
                            </div>
                            
                            <div className="flex flex-1 overflow-hidden">
                                <div className="w-1/2 border-r border-white/5 p-4 flex flex-col">
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2">Custom Input (stdin)</label>
                                    <textarea 
                                        className="flex-1 bg-white/5 border border-white/10 rounded p-2 text-sm text-slate-300 font-mono focus:outline-none focus:border-indigo-500 resize-none custom-scrollbar"
                                        placeholder="Enter standard input here..."
                                        value={customInput}
                                        onChange={(e) => setCustomInput(e.target.value)}
                                    />
                                </div>
                                <div className="w-1/2 p-4 flex flex-col overflow-y-auto custom-scrollbar">
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2">Output (stdout)</label>
                                    <pre className="font-mono text-sm text-slate-300 whitespace-pre-wrap">{runOutput}</pre>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="h-14 border-t border-white/10 bg-[#0a0d12] flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setIsConsoleOpen(!isConsoleOpen)}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition ${isConsoleOpen ? 'bg-white/10 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
                            Console
                        </button>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handleRun}
                            disabled={runMutation.isPending}
                            className="flex items-center gap-2 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition disabled:opacity-50"
                        >
                            <Play className="w-4 h-4" /> {runMutation.isPending ? "Running..." : "Run"}
                        </button>
                        <button 
                            onClick={handleSubmitCode}
                            disabled={submitMutation.isPending}
                            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:opacity-90 text-white rounded-lg text-sm font-bold shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
                        >
                            <Send className="w-4 h-4" /> {submitMutation.isPending ? "Submitting..." : "Submit"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Panel: AI BYOK Assistant */}
            <div className="w-1/4 min-w-[280px] border-l border-white/10 bg-[#0a0d12] flex flex-col">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-purple-400 font-bold">
                        <Sparkles className="w-4 h-4" /> AI Sensei
                    </div>
                    <span className="text-[10px] uppercase bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">
                        BYOK Mode
                    </span>
                </div>
                
                <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-4">
                    <div className="bg-[#111826] border border-white/5 rounded-xl p-4 text-sm text-slate-400">
                        {aiKey ? (
                            <div className="text-emerald-400 font-medium">✓ API Key loaded from settings.</div>
                        ) : (
                            <div className="text-amber-400 font-medium">⚠️ No API Key found. Please add your Gemini API Key in the Navbar Settings (⚙️) to unlock AI hints.</div>
                        )}
                    </div>

                    <button 
                        onClick={handleAskAi}
                        disabled={isAnalyzing || !aiKey}
                        className="w-full py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 rounded-lg text-sm font-bold transition disabled:opacity-50"
                    >
                        {isAnalyzing ? "Analyzing..." : "Review My Code"}
                    </button>

                    {aiFeedback && (
                        <div className="bg-purple-900/20 border border-purple-500/20 rounded-xl p-4 text-sm text-purple-200 mt-2 whitespace-pre-wrap">
                            {aiFeedback}
                        </div>
                    )}
                </div>
            </div>
            </div>
        </div>
    );
}
