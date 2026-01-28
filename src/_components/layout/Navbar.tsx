import Link from "next/link";
import Image from "next/image";

export const Navbar = () => {
    return (
        <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md transition-all">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
                    <div className="flex items-center gap-2">
                        <Image src="/Logo.svg" alt="Codigo Logo" width={32} height={32} className="h-8 w-8" />
                        <span className="text-xl font-bold tracking-tight text-white">CODIGO</span>
                    </div>
                </Link>

                {/* Navigation Links */}
                <div className="hidden items-center gap-8 md:flex">
                    <Link href="#features" className="text-sm font-medium text-gray-400 transition-colors hover:text-white">
                        Features
                    </Link>
                    <Link href="#ai-solution" className="text-sm font-medium text-gray-400 transition-colors hover:text-white">
                        AI Solution
                    </Link>
                    <Link href="#testimonials" className="text-sm font-medium text-gray-400 transition-colors hover:text-white">
                        Testimonials
                    </Link>
                    <Link href="#faqs" className="text-sm font-medium text-gray-400 transition-colors hover:text-white">
                        FAQs
                    </Link>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/api/auth/signin"
                        className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/5 hover:text-white"
                    >
                        Sign in
                    </Link>
                    <Link
                        href="/signup"
                        className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-purple-500/20 transition-all hover:opacity-90 hover:shadow-purple-500/40"
                    >
                        Get Started
                    </Link>
                </div>
            </div>
        </nav>
    );
};
