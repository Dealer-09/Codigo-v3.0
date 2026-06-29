"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { Sparkles, Play, Send, Trophy, XCircle } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import Editor from "@monaco-editor/react";
import confetti from "canvas-confetti";

type Problem = {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    examples: string;
    constraints: string;
};

const BOILERPLATES: Record<string, string> = {
    "javascript": "function solve() {\n  // Write your code here\n}",
    "python": "def solve():\n    # Write your code here\n    pass",
    "java": "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}",
    "c++": "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}",
    "c": "#include <stdio.h>\n\nint main() {\n    // Write your code here\n    return 0;\n}"
};

export function ArenaWorkspace({ problems, roomId, matchType = "custom", timeLimit = null, startedAt, initialMatchStatus = "waiting", penaltyType = "none", hideTestCases = false, blindMode = false, bonusMarks = 5 }: { problems: Problem[], roomId?: string, matchType?: string, timeLimit?: number | null, startedAt?: string, initialMatchStatus?: string, penaltyType?: string, hideTestCases?: boolean, blindMode?: boolean, bonusMarks?: number }) {
    const { resolvedTheme } = useTheme();
    const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
    const problem = problems[currentProblemIndex];
    const [language, setLanguage] = useState("javascript");
    const [code, setCode] = useState(BOILERPLATES["javascript"] ?? "// Write your code here");
    const [aiKey, setAiKey] = useState("");
    const [aiModel, setAiModel] = useState("");
    const [aiFeedback, setAiFeedback] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isConsoleOpen, setIsConsoleOpen] = useState(false);
    const [runOutput, setRunOutput] = useState("");
    const [customInput, setCustomInput] = useState("");
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Socket State
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [opponentStatus, setOpponentStatus] = useState(initialMatchStatus === "in-progress" ? "Opponent Coding..." : "Waiting for opponent...");
    const [matchStatus, setMatchStatus] = useState(initialMatchStatus);
    const [matchResult, setMatchResult] = useState<"won" | "lost" | null>(null);
    const [points, setPoints] = useState(0);
    
    // Server authoritative time init
    const getProblemTimeLimit = (diff: string) => diff === "hard" ? 20 : diff === "medium" ? 15 : 10;
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [opponentRank, setOpponentRank] = useState<number | null>(null);

    const { user } = useUser();
    const userId = user?.id || "anonymous";

    const recordMatchResult = api.arena.recordMatchResult.useMutation();



    useEffect(() => {
        // Load key on mount
        const storedKey = localStorage.getItem("codigo_gemini_key");
        if (storedKey) setAiKey(storedKey);
        const storedModel = localStorage.getItem("codigo_gemini_model");
        if (storedModel) setAiModel(storedModel);

        const handleUpdate = () => {
            const updatedKey = localStorage.getItem("codigo_gemini_key");
            if (updatedKey) setAiKey(updatedKey);
            const updatedModel = localStorage.getItem("codigo_gemini_model");
            if (updatedModel) setAiModel(updatedModel);
        };
        window.addEventListener("api_key_updated", handleUpdate);

        // Socket Connection
        if (roomId) {
            const newSocket = new WebSocket("ws://localhost:3001");
            setSocket(newSocket);

            newSocket.onopen = () => {
                if (matchType === "global") {
                    newSocket.send(JSON.stringify({ type: "arena:join-queue", payload: {
                        userId,
                        username: "Player",
                        difficulty: problem.difficulty
                    }}));
                } else {
                    newSocket.send(JSON.stringify({ type: "arena:join-room", payload: { 
                        roomId,
                        userId,
                        username: "Player"
                    }}));
                }
            };

            newSocket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                const match = data.payload;
                
                switch(data.type) {
                    case "arena:match-found":
                        setMatchStatus("in-progress");
                        setOpponentStatus("Opponent Coding...");
                        if (match.startedAt && currentProblemIndex === 0) {
                            if (timeLimit) {
                                const elapsed = Math.floor((Date.now() - new Date(match.startedAt).getTime()) / 1000);
                                setTimeLeft(Math.max(0, (timeLimit * 60) - elapsed));
                            } else {
                                const key = `arena_${roomId}_p0_start`;
                                localStorage.setItem(key, new Date(match.startedAt).getTime().toString());
                                const limitMins = getProblemTimeLimit(problem.difficulty.toLowerCase());
                                const elapsed = Math.floor((Date.now() - new Date(match.startedAt).getTime()) / 1000);
                                setTimeLeft(Math.max(0, (limitMins * 60) - elapsed));
                            }
                        }
                        break;
                    case "arena:opponent-code-update":
                        setOpponentStatus("Opponent Typing...");
                        // Reset back to coding after a delay
                        setTimeout(() => setOpponentStatus("Opponent Coding..."), 2000);
                        break;
                    case "arena:opponent-finished":
                        setOpponentStatus(match.rank ? `Finished! (Rank #${match.rank})` : "Finished! 🎉");
                        setOpponentRank(match.rank || null);
                        break;
                    case "arena:match-terminated":
                        alert(`Match Terminated: ${match.reason}`);
                        setMatchResult("lost");
                        setShowSuccessModal(true);
                        if (roomId) {
                            recordMatchResult.mutate({ roomId, isWinner: false });
                        }
                        break;
                    case "arena:opponent-cheated":
                        let msg = "suspicious behavior";
                        if (match.reason === "paste") msg = "pasting code";
                        if (match.reason === "copy") msg = "copying code";
                        if (match.reason === "tab_switch") msg = "leaving the browser tab";
                        alert(`⚠️ Anti-Cheat Radar: Your opponent was caught ${msg}!`);
                        break;
                    case "arena:disqualified":
                        setMatchStatus("terminated");
                        setMatchResult("lost");
                        alert(`You have been disqualified: ${match.reason}`);
                        break;
                    case "arena:opponent-disconnected":
                        setOpponentStatus("Disconnected (Opponent Left)");
                        setMatchResult("won");
                        setShowSuccessModal(true);
                        break;
                }
            };

            return () => {
                newSocket.close();
            };
        }

        return () => window.removeEventListener("api_key_updated", handleUpdate);
    }, [roomId, matchType, timeLimit, problem?.difficulty, userId]);


    useEffect(() => {
        if (!roomId || matchStatus !== "in-progress") return;
        
        if (timeLimit) {
            // Global override: time doesn't reset per problem
            if (startedAt) {
                const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
                setTimeLeft(Math.max(0, (timeLimit * 60) - elapsed));
            }
        } else {
            // Per-problem timer
            const key = `arena_${roomId}_p${currentProblemIndex}_start`;
            let stored = localStorage.getItem(key);
            
            if (!stored) {
                const start = currentProblemIndex === 0 && startedAt ? new Date(startedAt).getTime() : Date.now();
                localStorage.setItem(key, start.toString());
                stored = start.toString();
            }

            const startMs = parseInt(stored);
            const limitMins = problem ? getProblemTimeLimit(problem.difficulty.toLowerCase()) : 10;
            const elapsed = Math.floor((Date.now() - startMs) / 1000);
            setTimeLeft(Math.max(0, (limitMins * 60) - elapsed));
        }
    }, [currentProblemIndex, roomId, matchStatus, startedAt, problem?.difficulty, timeLimit]);

    useEffect(() => {
        if (timeLeft === null || matchStatus !== "in-progress" || matchResult !== null) return;
        if (timeLeft <= 0) {
            setMatchResult("lost");
            setShowSuccessModal(true);
            if (roomId) {
                recordMatchResult.mutate({ roomId, isWinner: false });
                if (socket) socket.send(JSON.stringify({ type: "arena:match-finished", payload: { roomId, userId } })); // DNF
            }
            return;
        }
        const timer = setInterval(() => setTimeLeft(t => t !== null ? t - 1 : null), 1000);
        return () => clearInterval(timer);
    }, [timeLeft, matchStatus, matchResult, roomId, userId, socket, recordMatchResult]);

    // Anti-Cheat System
    useEffect(() => {
        if (!roomId) return; // Only enforce in Arena mode

        const handlePaste = (e: ClipboardEvent) => {
            e.preventDefault();
            alert("🛡️ Anti-Cheat: Pasting code is strictly forbidden in Arena matches!");
            if (socket) socket.send(JSON.stringify({ type: "arena:cheat-warning", payload: { roomId, reason: "paste" } }));
        };

        const handleCopy = (e: ClipboardEvent) => {
            e.preventDefault();
            alert("🛡️ Anti-Cheat: Copying code is strictly forbidden in Arena matches!");
            if (socket) socket.send(JSON.stringify({ type: "arena:cheat-warning", payload: { roomId, reason: "copy" } }));
        };

        const handleVisibility = () => {
            if (document.hidden) {
                alert("🛡️ Anti-Cheat: Leaving the tab during an Arena match is recorded!");
                if (socket) socket.send(JSON.stringify({ type: "arena:cheat-warning", payload: { roomId, reason: "tab_switch" } }));
            }
        };

        document.addEventListener("paste", handlePaste);
        document.addEventListener("copy", handleCopy);
        document.addEventListener("visibilitychange", handleVisibility);

        return () => {
            document.removeEventListener("paste", handlePaste);
            document.removeEventListener("copy", handleCopy);
            document.removeEventListener("visibilitychange", handleVisibility);
        };
    }, [roomId, socket]);

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
        if (problem.difficulty.toLowerCase() !== "easy") {
            setAiFeedback("🤖 AI Sensei Guardrails: AI assistance is strictly disabled for Medium and Hard problems in Arena Mode to prevent over-reliance.");
            return;
        }
        if (!aiKey) {
            setAiFeedback("Please enter your Gemini API Key in Dashboard Settings first.");
            return;
        }
        setIsAnalyzing(true);
        analyzeMutation.mutate({
            code: code ?? "",
            language,
            problemId: problem.id,
            apiKey: aiKey,
            aiModel: aiModel || undefined
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
                const earnedPoints = 10 * data.total + bonusMarks; // 10 pts per test case + bonus marks
                setPoints(p => p + earnedPoints);
                
                const msg = `🎉 ALL TEST CASES PASSED! (${data.passed}/${data.total})\n+${earnedPoints} Points Earned!\nSubmission Accepted!`;
                setAiFeedback(msg);
                setRunOutput(msg);
                
                // Check if match is finished or moving to next problem
                if (data.success) {
                    confetti({
                        particleCount: 150,
                        spread: 70,
                        origin: { y: 0.6 }
                    });
                    
                    if (currentProblemIndex < problems.length - 1) {
                        setTimeout(() => setCurrentProblemIndex(i => i + 1), 2000);
                        setAiFeedback(msg + "\n\nMoving to next problem...");
                        setRunOutput(msg + "\n\nMoving to next problem...");
                    } else {
                        setMatchResult("won");
                        setShowSuccessModal(true);
                        if (roomId) {
                            recordMatchResult.mutate({ roomId, isWinner: true });
                        }
                        
                        // Notify opponent
                        if (socket && roomId) {
                            socket.send(JSON.stringify({ type: "arena:match-finished", payload: { roomId, userId } }));
                        }
                    }
                }
            } else {
                let msg = "";
                
                if (hideTestCases && (problem.difficulty.toLowerCase() === "medium" || problem.difficulty.toLowerCase() === "hard")) {
                    msg = `❌ Failed Hidden Test Case #${data.passed + 1}/${data.total}.\nEdge case failed! Check your algorithmic logic.`;
                } else {
                    msg = `❌ Failed at test case ${data.passed + 1}/${data.total}.\nInput: ${data.failedCase?.input}\nExpected: ${data.failedCase?.expected}\nActual: ${data.failedCase?.actual}\nError: ${data.failedCase?.error}`;
                }

                if (penaltyType === "marks") {
                    setPoints(p => Math.max(0, p - 5));
                    msg += "\n\n⚠️ Penalty: -5 Points for Failed Submission.";
                } else if (penaltyType === "time") {
                    setTimeLeft(prev => prev !== null ? Math.max(0, prev - 300) : null);
                    msg += "\n\n⚠️ Penalty: -5 Minutes for Failed Submission.";
                }
                
                const isEasyPractice = !roomId && problem.difficulty.toLowerCase() === "easy";
                if (isEasyPractice && aiKey) {
                    setAiFeedback(msg + "\n\n🤖 AI is analyzing your failure...");
                } else {
                    setAiFeedback(msg);
                }
                setRunOutput(msg);

                // Auto-analyze failure
                if (isEasyPractice && aiKey) {
                    analyzeTestFailure.mutate({
                        code: code ?? "",
                        language,
                        problemId: problem.id,
                        failedInput: data.failedCase?.input || "",
                        expectedOutput: data.failedCase?.expected || "",
                        actualOutput: data.failedCase?.actual || "",
                        errorMessage: data.failedCase?.error,
                        apiKey: aiKey,
                        aiModel: aiModel || undefined
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
        runMutation.mutate({ code: code ?? "", language, stdin: customInput });
    };

    const handleSubmitCode = () => {
        if (!problem) return;
        setIsConsoleOpen(true);
        setRunOutput("Running against test cases...");
        setAiFeedback("Running against test cases...");
        submitMutation.mutate({ problemId: problem.id, code: code ?? "", language });
    };

    if (!problem) {
        return <div className="p-8 text-center text-gray-500 font-bold mt-20">Loading problem data...</div>;
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {roomId && (
                <header className="clay-panel h-14 border-b border-[var(--color-clay-border)] flex items-center justify-between px-6 shrink-0">
                    <div className="flex items-center gap-4">
                        <span className="font-bold text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                            BATTLE ARENA
                        </span>
                        {timeLeft !== null && (
                            <span className={`px-2 py-1 rounded text-xs font-mono font-bold ${timeLeft < 60 ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-white/5 text-slate-400 border-white/10'} border`}>
                                ⏱️ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                            </span>
                        )}
                        {matchType !== "global" && (
                            <span className="px-2 py-1 bg-white/5 rounded text-xs font-mono text-slate-400 border border-white/10">
                                Room: {roomId}
                            </span>
                        )}
                    </div>
                    <div className="flex-1 flex justify-center items-center gap-2">
                        {matchType !== "contest" && (
                            <>
                                <span className={`w-3 h-3 rounded-full ${matchStatus === 'in-progress' ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`}></span>
                                <span className="font-bold text-slate-300">
                                    {opponentStatus}
                                </span>
                            </>
                        )}
                        {matchType === "contest" && (
                            <span className="font-bold text-amber-500 flex items-center gap-2">
                                <Trophy className="w-5 h-5" /> Contest Mode Active
                            </span>
                        )}
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
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
                    <div className="bg-[var(--color-clay-bg)] border border-white/10 p-12 rounded-3xl text-center max-w-md w-full shadow-2xl relative overflow-hidden">
                        {matchResult === "won" ? (
                            <>
                                <div className="w-24 h-24 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Trophy className="w-12 h-12" />
                                </div>
                                <h2 className="text-4xl font-black text-[var(--color-clay-text)] mb-4">VICTORY!</h2>
                                <p className="text-lg text-[var(--color-clay-text-muted)] font-medium mb-2">
                                    You defeated your opponent!
                                </p>
                                <p className="text-2xl font-bold text-emerald-400 mb-8">Score: {points} pts</p>
                            </>
                        ) : matchResult === "lost" ? (
                            <>
                                <div className="w-24 h-24 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <XCircle className="w-12 h-12" />
                                </div>
                                <h2 className="text-4xl font-black text-[var(--color-clay-text)] mb-4">DEFEAT!</h2>
                                <p className="text-lg text-[var(--color-clay-text-muted)] font-medium mb-2">
                                    Your opponent finished first!
                                </p>
                                <p className="text-2xl font-bold text-rose-400 mb-8">Score: {points} pts</p>
                            </>
                        ) : (
                            <>
                                <div className="w-24 h-24 bg-purple-500/20 text-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Trophy className="w-12 h-12" />
                                </div>
                                <h2 className="text-4xl font-black text-[var(--color-clay-text)] mb-4">MATCH COMPLETE!</h2>
                                <p className="text-lg text-[var(--color-clay-text-muted)] font-medium mb-8">
                                    You completed the challenge.
                                </p>
                            </>
                        )}
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
            <div className="clay-panel w-1/3 min-w-[300px] border-r border-[var(--color-clay-border)] flex flex-col overflow-y-auto custom-scrollbar text-[var(--color-clay-text)]">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <h1 className="text-2xl font-bold text-[var(--color-clay-text)]">{problem.title}</h1>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                            problem.difficulty === 'easy' ? 'bg-emerald-500/20 text-emerald-400' :
                            problem.difficulty === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-red-500/20 text-red-400'
                        }`}>
                            {problem.difficulty.toUpperCase()}
                        </span>
                    </div>
                    
                    <div className="prose dark:prose-invert max-w-none text-[var(--color-clay-text)]">
                        <p className="whitespace-pre-wrap">{problem.description}</p>
                    </div>

                    {problem.constraints && (
                        <div className="mt-8">
                            <h3 className="text-sm font-bold text-[var(--color-clay-text-muted)] uppercase tracking-wider mb-2">Constraints</h3>
                            <div className="bg-[var(--color-clay-bg)] border border-[var(--color-clay-border)] rounded-lg p-3 font-mono text-sm text-[var(--color-clay-text)]">
                                {problem.constraints}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Middle Panel: Code Editor */}
            <div className="flex-1 flex flex-col bg-[var(--color-clay-bg)] text-[var(--color-clay-text)]">
                <div className="clay-panel h-10 border-b border-[var(--color-clay-border)] flex items-center px-4 justify-between">
                    <div className="flex gap-2">
                        <div className="h-3 w-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                        <div className="h-3 w-3 rounded-full bg-amber-500/20 border border-amber-500/50"></div>
                        <div className="h-3 w-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                    </div>
                    <select 
                        className="bg-transparent text-sm text-slate-400 outline-none border-none cursor-pointer"
                        value={language}
                        onChange={(e) => {
                            const newLang = e.target.value;
                            setLanguage(newLang);
                            if (BOILERPLATES[newLang] && (code === "" || Object.values(BOILERPLATES).includes(code ?? ""))) {
                                setCode(BOILERPLATES[newLang]!);
                            }
                        }}
                    >
                        <option value="javascript" className="bg-[var(--color-clay-bg)] text-[var(--color-clay-text)]">JavaScript</option>
                        <option value="python" className="bg-[var(--color-clay-bg)] text-[var(--color-clay-text)]">Python 3</option>
                        <option value="java" className="bg-[var(--color-clay-bg)] text-[var(--color-clay-text)]">Java</option>
                        <option value="c++" className="bg-[var(--color-clay-bg)] text-[var(--color-clay-text)]">C++</option>
                        <option value="c" className="bg-[var(--color-clay-bg)] text-[var(--color-clay-text)]">C</option>
                    </select>
                </div>
                
                <div className="flex-1 relative flex flex-col min-h-0">
                    <div className="flex-1 relative min-h-0">
                        <Editor
                            height="100%"
                            language={language === "c++" ? "cpp" : language}
                            theme={resolvedTheme === 'light' ? "codigo-light" : "codigo-dark"}
                            beforeMount={(monaco) => {
                                monaco.editor.defineTheme('codigo-dark', {
                                    base: 'vs-dark',
                                    inherit: true,
                                    rules: [
                                        { background: '0a0d12' },
                                        { token: 'comment', foreground: '8b949e', fontStyle: 'italic' },
                                        { token: 'keyword', foreground: 'ff7b72', fontStyle: 'bold' },
                                        { token: 'identifier', foreground: 'c9d1d9' },
                                        { token: 'string', foreground: 'a5d6ff' },
                                        { token: 'number', foreground: '79c0ff' },
                                        { token: 'type', foreground: 'ffa657' },
                                        { token: 'class', foreground: 'ffa657', fontStyle: 'bold' },
                                        { token: 'function', foreground: 'd2a8ff' },
                                        { token: 'operator', foreground: '79c0ff' },
                                    ],
                                    colors: {
                                        'editor.background': '#0a0d12',
                                        'editor.foreground': '#c9d1d9',
                                        'editor.lineHighlightBackground': '#161b22',
                                        'editorLineNumber.foreground': '#484f58',
                                        'editorIndentGuide.background': '#21262d',
                                        'editorSuggestWidget.background': '#161b22',
                                        'editorSuggestWidget.border': '#30363d',
                                    }
                                });
                                monaco.editor.defineTheme('codigo-light', {
                                    base: 'vs',
                                    inherit: true,
                                    rules: [
                                        { background: 'ffffff' },
                                        { token: 'comment', foreground: '6e7781', fontStyle: 'italic' },
                                        { token: 'keyword', foreground: 'cf222e', fontStyle: 'bold' },
                                        { token: 'identifier', foreground: '24292f' },
                                        { token: 'string', foreground: '0a3069' },
                                        { token: 'number', foreground: '0550ae' },
                                        { token: 'type', foreground: '953800' },
                                        { token: 'class', foreground: '953800', fontStyle: 'bold' },
                                        { token: 'function', foreground: '8250df' },
                                        { token: 'operator', foreground: '0550ae' },
                                    ],
                                    colors: {
                                        'editor.background': '#ffffff',
                                        'editor.foreground': '#24292f',
                                        'editor.lineHighlightBackground': '#f6f8fa',
                                        'editorLineNumber.foreground': '#8c959f',
                                        'editorIndentGuide.background': '#d0d7de',
                                        'editorSuggestWidget.background': '#ffffff',
                                        'editorSuggestWidget.border': '#d0d7de',
                                    }
                                });
                            }}
                            value={code}
                            onChange={(val) => {
                                setCode(val || "");
                                if (socket && roomId) {
                                    socket.send(JSON.stringify({ type: "arena:code-update", payload: { roomId, code: val } }));
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
                        <div className="clay-panel h-64 border-t border-[var(--color-clay-border)] flex flex-col shrink-0">
                            <div className="flex items-center justify-between p-2 border-b border-[var(--color-clay-border)]">
                                <div className="flex gap-4 px-2">
                                    <span className="text-sm font-bold text-[var(--color-clay-text-muted)]">Execution Output</span>
                                </div>
                                <button onClick={() => setIsConsoleOpen(false)} className="text-[var(--color-clay-text-muted)] hover:text-[var(--color-clay-text)] px-2">✕</button>
                            </div>
                            
                            <div className="flex flex-1 overflow-hidden">
                                <div className="w-1/2 border-r border-[var(--color-clay-border)] p-4 flex flex-col">
                                    <label className="text-xs font-bold text-[var(--color-clay-text-muted)] uppercase mb-2">Custom Input (stdin)</label>
                                    <textarea 
                                        className="flex-1 bg-[var(--color-clay-bg)] border border-[var(--color-clay-border)] rounded p-2 text-sm text-[var(--color-clay-text)] font-mono focus:outline-none focus:border-indigo-500 resize-none custom-scrollbar"
                                        placeholder="Enter standard input here..."
                                        value={customInput}
                                        onChange={(e) => setCustomInput(e.target.value)}
                                    />
                                </div>
                                <div className="w-1/2 p-4 flex flex-col overflow-y-auto custom-scrollbar">
                                    <label className="text-xs font-bold text-[var(--color-clay-text-muted)] uppercase mb-2">Output (stdout)</label>
                                    <pre className="font-mono text-sm text-[var(--color-clay-text)] whitespace-pre-wrap">{runOutput}</pre>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="clay-panel h-14 border-t border-[var(--color-clay-border)] flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setIsConsoleOpen(!isConsoleOpen)}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition ${isConsoleOpen ? 'bg-indigo-500 text-white' : 'bg-transparent text-[var(--color-clay-text-muted)] hover:bg-[var(--color-clay-border)]'}`}>
                            Console
                        </button>
                    </div>
                    <div className="flex items-center gap-3">
                        {!blindMode && (
                            <button 
                                onClick={handleRun}
                                disabled={runMutation.isPending}
                                className="flex items-center gap-2 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition disabled:opacity-50"
                            >
                                <Play className="w-4 h-4" /> {runMutation.isPending ? "Running..." : "Run"}
                            </button>
                        )}
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

            {/* Right Panel: AI BYOK Assistant - ONLY FOR EASY PRACTICE PROBLEMS */}
            {(!roomId && problem.difficulty.toLowerCase() === 'easy') && (
                <div className="clay-panel w-1/4 min-w-[280px] border-l border-[var(--color-clay-border)] flex flex-col">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-purple-400 font-bold">
                        <Sparkles className="w-4 h-4" /> AI Sensei
                    </div>
                    <span className="text-[10px] uppercase bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">
                        BYOK Mode
                    </span>
                </div>
                
                <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-4">
                    <div className="bg-[var(--color-clay-bg)] border border-[var(--color-clay-border)] rounded-xl p-4 text-sm text-[var(--color-clay-text-muted)]">
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
            )}
            </div>
        </div>
    );
}
