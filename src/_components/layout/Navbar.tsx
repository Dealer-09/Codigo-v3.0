import Link from "next/link";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

export const Navbar = async () => {
    const { userId } = await auth();

    return (
        <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                        <Image src="/Logo.svg" alt="Codigo Logo" width={32} height={32} />
                        <span className="text-xl font-bold tracking-tight text-white">CODIGO</span>
                    </div>
                </Link>

                {/* Navigation Links */}
                <div className="hidden items-center gap-8 md:flex">
                    <Link href="#" className="text-sm font-medium text-gray-300 transition-colors hover:text-white">
                        Features
                    </Link>
                    <Link href="#" className="text-sm font-medium text-gray-300 transition-colors hover:text-white">
                        AI Assistant
                    </Link>
                    <Link href="#" className="text-sm font-medium text-gray-300 transition-colors hover:text-white">
                        Testimonials
                    </Link>
                    <Link href="#" className="text-sm font-medium text-gray-300 transition-colors hover:text-white">
                        FAQs
                    </Link>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-4">
                    {userId ? (
                        <>
                            <Link
                                href="/dashboard"
                                className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-purple-500/20 transition-all hover:opacity-90 hover:shadow-purple-500/40"
                            >
                                Dashboard
                            </Link>
                            <UserButton />
                        </>
                    ) : (
                        <>
                            <Link
                                href="/sign-in"
                                className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
                            >
                                Sign in
                            </Link>
                            <Link
                                href="/sign-up"
                                className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-purple-500/20 transition-all hover:opacity-90 hover:shadow-purple-500/40"
                            >
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};
