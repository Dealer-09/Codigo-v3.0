"use client";

import { motion } from "framer-motion";
import { Sparkles, Zap } from "lucide-react";

export const CodePreview = () => {
    const codeLines = [
        { line: 1, content: <><span className="text-purple-400">def</span> <span className="text-blue-400 pl-2">calculate_complexity</span><span className="text-gray-300">(code):</span></> },
        { line: 2, content: <span className="pl-4 text-gray-500"># AI Analysis </span> },
        { line: 3, content: <><span className="pl-4 text-purple-400">if</span> <span className="text-gray-300 pl-2">complexity &gt; O(n^2):</span></> },
        { line: 4, content: <><span className="pl-8 text-blue-400">return</span> <span className="text-green-400 pl-2">"Optimize Loop"</span></> },
        { line: 5, content: null },
        { line: 6, content: <><span className="pl-4 text-blue-400">return</span> <span className="text-green-400 pl-2">"Good Job!"</span></> },
        { line: 7, content: null },
        { line: 8, content: <span className="text-gray-300">result = analyze(user_code)</span> },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative w-full max-w-xl lg:ml-auto"
        >
            <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10 overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a]/90 shadow-2xl shadow-blue-900/20 backdrop-blur-sm"
            >
                {/* Window Controls */}
                <div className="flex items-center gap-2 border-b border-white/5 bg-white/5 px-4 py-3">
                    <div className="h-3 w-3 rounded-full bg-red-500/80" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                    <div className="h-3 w-3 rounded-full bg-green-500/80" />
                    <div className="ml-2 text-xs text-gray-500 font-mono">main.py</div>
                </div>

                {/* Code Content */}
                <div className="p-6 font-mono text-sm leading-relaxed">
                    {codeLines.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
                            className="flex"
                        >
                            <span className="w-8 select-none text-gray-700 text-right pr-4">{item.line}</span>
                            {item.content || <span className="h-5 block" />}
                        </motion.div>
                    ))}
                </div>

                {/* Floating AI Toast */}
                <motion.div
                    initial={{ y: 20, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{ delay: 1.5, duration: 0.5, type: "spring" }}
                    className="absolute bottom-20 right-6 z-20 flex items-center gap-3 rounded-lg border border-white/10 bg-[#151515]/95 px-4 py-3 shadow-xl backdrop-blur-md ring-1 ring-white/5"
                >
                    <div className="rounded-full bg-blue-500/20 p-2 text-blue-400">
                        <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-gray-500">AI Insight</span>
                        <span className="text-sm font-semibold text-white">Optimize nested loops</span>
                    </div>
                    <div className="ml-2 h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] animate-pulse" />
                </motion.div>

                {/* Search Bar Visual at bottom */}
                <div className="mx-6 mb-6 mt-2 flex items-center gap-2 rounded-lg bg-[#0f0f0f] px-4 py-3 border border-white/5 transition-colors hover:border-white/10">
                    <span className="text-gray-500 text-sm">Ask generic AI to refactor...</span>
                    <div className="ml-auto rounded-md bg-blue-600/20 p-1.5 transition-colors hover:bg-blue-600/30 cursor-pointer">
                        <Zap className="h-3 w-3 text-blue-400" />
                    </div>
                </div>
            </motion.div>

            {/* Background Decor */}
            <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 8, repeat: Infinity }}
                className="absolute -top-20 -right-20 -z-10 h-80 w-80 rounded-full bg-blue-600/30 blur-[100px]"
            />
            <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 10, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-20 -left-20 -z-10 h-80 w-80 rounded-full bg-purple-600/30 blur-[100px]"
            />
        </motion.div>
    );
};
