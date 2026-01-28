"use client";

import { motion } from "framer-motion";
import { Brain, Trophy, Activity, Zap } from "lucide-react";

const details = [
    {
        icon: <Brain className="h-6 w-6 text-white" />,
        title: "AI-Powered Practice",
        description: "Generate endlessly new challenges tailored to your skill level.",
        color: "bg-blue-500",
    },
    {
        icon: <Trophy className="h-6 w-6 text-white" />,
        title: "Live Competitions",
        description: "Compete in real-time with developers around the world.",
        color: "bg-pink-500",
    },
    {
        icon: <Activity className="h-6 w-6 text-white" />,
        title: "Real-time Analytics",
        description: "Get detailed performance metrics and visual breakdowns.",
        color: "bg-green-500",
    },
    {
        icon: <Zap className="h-6 w-6 text-white" />,
        title: "Code Optimization",
        description: "Automatically detect inefficiencies and logical errors.",
        color: "bg-orange-500",
    },
];

export const CompetitionsSection = () => {
    return (
        <section id="ai-solution" className="py-24 bg-[#0a0a0a]">
            <div className="container mx-auto px-6">
                <div className="mb-16 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
                    <h2 className="text-4xl font-bold text-white">
                        Build for Developers <br />
                        Who <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Demand more</span>
                    </h2>
                    <div className="max-w-sm text-right">
                        <p className="text-gray-400 mb-4 text-sm">
                            Experience the future of coding with tools designed for speed and scale.
                        </p>
                        <button className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500">
                            Explore All →
                        </button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
                    {/* Left Column */}
                    <div className="space-y-6 lg:col-span-3">
                        <FeatureCard data={details[0]!} />
                        <FeatureCard data={details[1]!} />
                    </div>

                    {/* Center Column - Video/Demo Placeholder */}
                    <div className="relative min-h-[300px] overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f0f] lg:col-span-6">
                        {/* Placeholder for video or large graphic */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5 backdrop-blur-sm">
                                    <div className="h-0 w-0 border-b-[10px] border-l-[16px] border-t-[10px] border-b-transparent border-l-white border-t-transparent ml-1" />
                                </div>
                                <span className="text-sm font-medium text-gray-500">Watch Demo</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6 lg:col-span-3">
                        <FeatureCard data={details[2]!} />
                        <FeatureCard data={details[3]!} />
                    </div>
                </div>
            </div>
        </section>
    );
};

const FeatureCard = ({ data }: { data: typeof details[0] }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="rounded-2xl border border-white/10 bg-[#111] p-6 transition-colors hover:bg-[#161616]"
    >
        <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg ${data.color} shadow-lg shadow-white/5`}>
            {data.icon}
        </div>
        <h3 className="mb-2 text-lg font-bold text-white">{data.title}</h3>
        <p className="text-sm text-gray-400 leading-relaxed">
            {data.description}
        </p>
    </motion.div>
);
