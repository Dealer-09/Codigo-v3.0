import Link from "next/link";
import { CodePreview } from "./CodePreview";

export const HeroSection = () => {
    return (
        <section className="relative overflow-hidden pt-8 pb-20 lg:pt-16 lg:pb-32">
            <div className="container mx-auto px-6">
                <div className="grid items-center gap-12 lg:grid-cols-12">
                    {/* Left Column: Text Content */}
                    <div className="col-span-12 lg:col-span-5">
                        <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight text-white lg:text-7xl">
                            Code <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Smarter</span>
                            <br />
                            Not Harder
                        </h1>
                        <p className="mb-8 text-lg text-gray-400 lg:text-xl">
                            AI-powered competitive coding platform where you can practice, compete with developers, get real-time feedback, and optimize code efficiently.
                        </p>

                        <div className="flex flex-wrap items-center gap-4">
                            <Link
                                href="/sign-up"
                                className="group relative overflow-hidden rounded-full bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-blue-500/20 transition-all hover:bg-blue-500 hover:shadow-blue-500/40"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    Start Coding Now
                                    <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </span>
                            </Link>
                            <Link
                                href="/how-it-works"
                                className="rounded-full border border-white/20 px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-white/5"
                            >
                                See How It works
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="mt-16 grid grid-cols-3 gap-8 border-t border-white/10 pt-8">
                            <div>
                                <div className="text-3xl font-bold text-white">200+</div>
                                <div className="text-sm text-gray-400">Active Users</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-white">750+</div>
                                <div className="text-sm text-gray-400">Solutions</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-white">10+</div>
                                <div className="text-sm text-gray-400">Languages</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Visuals */}
                    <div className="relative col-span-12 lg:col-span-7">
                        <CodePreview />
                    </div>
                </div>
            </div>

            {/* Background Glows */}
            <div className="pointer-events-none absolute left-0 top-0 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/20 blur-[100px]" />
            <div className="pointer-events-none absolute right-0 bottom-0 -z-10 h-[500px] w-[500px] translate-x-1/3 translate-y-1/3 rounded-full bg-purple-600/20 blur-[100px]" />
        </section>
    );
};
