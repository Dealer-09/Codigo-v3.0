import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { HeroSection } from "./HeroSection";
import { FeaturesSection } from "./FeaturesSection";

export const HomePage = ({ hasUser }: { hasUser: boolean }) => {
    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white selection:bg-purple-500/30 relative">
            <div className="absolute top-6 right-6 z-50 flex items-center gap-4">
                {hasUser ? (
                    <>
                        <Link
                            href="/dashboard"
                            className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-purple-500/20 transition-all hover:opacity-90 hover:shadow-purple-500/40"
                        >
                            Go to Dashboard
                        </Link>
                        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                            <UserButton />
                        </div>
                    </>
                ) : (
                    <>
                        <Link
                            href="/sign-in"
                            className="rounded-lg border border-white/20 px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-white/10 backdrop-blur-md"
                        >
                            Sign in
                        </Link>
                        <Link
                            href="/sign-up"
                            className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-purple-500/20 transition-all hover:opacity-90 hover:shadow-purple-500/40"
                        >
                            Get Started
                        </Link>
                    </>
                )}
            </div>
            
            <HeroSection />
            <FeaturesSection />
        </main>
    );
};
