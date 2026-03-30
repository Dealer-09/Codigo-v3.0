"use client";

import Image from "next/image";
import Link from "next/link";

export const FeaturesSection = () => {
    return (
        <section className="relative bg-[#0a0a0a] py-24 lg:py-32">
            <div className="container mx-auto px-6">
                {/* Header Section */}
                <div className="mb-20 flex flex-col justify-between gap-12 lg:flex-row lg:items-end">
                    <div className="max-w-3xl">
                        <h2 className="text-5xl font-bold leading-tight tracking-tight text-white lg:text-7xl">
                            Master Coding
                            <br />
                            with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">CodiGo</span>
                        </h2>
                    </div>

                    <div className="flex flex-col items-start gap-6 lg:max-w-md">
                        <div>
                            <h3 className="mb-2 text-xl font-semibold text-white">Start Your Journey Today</h3>
                            <p className="text-gray-400">
                                Experience the future of intelligent coding practice.
                            </p>
                        </div>
                        <Link
                            href="/signup"
                            className="group flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-500"
                        >
                            Start Now
                            <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>
                </div>

                {/* Feature Cards Grid */}
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {/* Card 1: Write & Submit */}
                    <div className="group relative overflow-hidden rounded-3xl bg-white/5 p-8 transition-colors hover:bg-white/10 border border-white/5">
                        <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-500/20 shadow-[0_0_30px_-5px_rgba(59,130,246,0.5)]">
                            <Image src="/intellect.svg" alt="Brain Icon" width={80} height={80} className="h-20 w-20 scale-[2.0]" unoptimized />
                        </div>
                        <h3 className="mb-4 text-2xl font-bold text-white">Write & Submit Your Code</h3>
                        <p className="text-gray-400 leading-relaxed">
                            Paste your solution or code directly in our smart editor with multi-language support.
                        </p>
                    </div>

                    {/* Card 2: AI Analysis */}
                    <div className="group relative overflow-hidden rounded-3xl bg-white/5 p-8 transition-colors hover:bg-white/10 border border-white/5">
                        <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-500/20 shadow-[0_0_30px_-5px_rgba(249,115,22,0.5)]">
                            <Image src="/Fast.svg" alt="Lightning Icon" width={80} height={80} className="h-20 w-20 scale-[2.0]" unoptimized />
                        </div>
                        <h3 className="mb-4 text-2xl font-bold text-white">Get Real-Time AI Analysis</h3>
                        <p className="text-gray-400 leading-relaxed">
                            Receive instant feedback on complexity, optimizations, and best practices within seconds.
                        </p>
                    </div>

                    {/* Card 3: Improve & Compete */}
                    <div className="group relative overflow-hidden rounded-3xl bg-white/5 p-8 transition-colors hover:bg-white/10 border border-white/5">
                        <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-green-500/20 shadow-[0_0_30px_-5px_rgba(34,197,94,0.5)]">
                            <Image src="/Growth.svg" alt="Chart Icon" width={80} height={80} className="h-20 w-20" unoptimized />
                        </div>
                        <h3 className="mb-4 text-2xl font-bold text-white">Improve & Compete</h3>
                        <p className="text-gray-400 leading-relaxed">
                            Implement AI suggestions, compare solutions, and climb the global leaderboards.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};
