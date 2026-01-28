"use client";

import { motion } from "framer-motion";
import { Code2, Cpu, TrendingUp } from "lucide-react";

const features = [
    {
        icon: <Code2 className="h-8 w-8 text-white" />,
        title: "Write & Submit Your Code",
        description: "Practice seamlessly in our intelligent code editor with syntax highlighting.",
        color: "bg-blue-500",
    },
    {
        icon: <Cpu className="h-8 w-8 text-white" />,
        title: "Get Real-Time AI Analysis",
        description: "Receive instant feedback on runtime, memory usage, and logic efficiency.",
        color: "bg-orange-500",
    },
    {
        icon: <TrendingUp className="h-8 w-8 text-white" />,
        title: "Improve & Compete",
        description: "Climb the leaderboard and challenge others with your optimized solutions.",
        color: "bg-green-500",
    },
];

export const FeaturesSection = () => {
    return (
        <section id="features" className="py-24 bg-[#0a0a0a]">
            <div className="container mx-auto px-6">
                <div className="mb-16">
                    <h2 className="text-4xl font-bold text-white mb-4">
                        Master Coding <br />
                        with <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">CodiGo</span>
                    </h2>
                    <div className="mt-4 flex items-center justify-between">
                        <p className="max-w-xl text-gray-400">
                            Start your journey today. Smart tools for improved logic and performance.
                        </p>
                        <button className="hidden rounded-full bg-purple-600/10 px-6 py-2 text-sm font-medium text-purple-400 transition-colors hover:bg-purple-600/20 md:block">
                            Learn More →
                        </button>
                    </div>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#111] p-8 transition-all hover:border-white/20"
                        >
                            <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl ${feature.color} shadow-lg shadow-white/5`}>
                                {feature.icon}
                            </div>
                            <h3 className="mb-3 text-xl font-bold text-white">{feature.title}</h3>
                            <p className="text-gray-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
