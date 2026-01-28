import Link from "next/link";
import Image from "next/image";
import { Twitter, Instagram, Linkedin, Github } from "lucide-react";

export const Footer = () => {
    return (
        <footer className="border-t border-white/10 bg-[#050505] pt-16 pb-8">
            <div className="container mx-auto px-6">
                <div className="grid gap-12 lg:grid-cols-4">
                    {/* Brand */}
                    <div className="lg:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-6">
                            <div className="flex items-center gap-2">
                                <Image src="/Logo.svg" alt="Codigo Logo" width={32} height={32} className="h-8 w-8" />
                                <span className="text-xl font-bold tracking-tight text-white">CODIGO</span>
                            </div>
                        </Link>
                        <p className="text-sm text-gray-500 leading-relaxed mb-6">
                            Our platform empowers developers of all levels to master code, tackle challenges and innovate on the future.
                        </p>
                        <div className="flex gap-4">
                            <SocialLink href="#" icon={<Twitter className="h-4 w-4" />} />
                            <SocialLink href="#" icon={<Instagram className="h-4 w-4" />} />
                            <SocialLink href="#" icon={<Linkedin className="h-4 w-4" />} />
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-bold text-white mb-6">Product</h4>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li><Link href="#" className="hover:text-blue-400">Features</Link></li>
                            <li><Link href="#" className="hover:text-blue-400">Integrations</Link></li>
                            <li><Link href="#" className="hover:text-blue-400">Pricing</Link></li>
                            <li><Link href="#" className="hover:text-blue-400">Changelog</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-6">Resources</h4>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li><Link href="#" className="hover:text-blue-400">Documentation</Link></li>
                            <li><Link href="#" className="hover:text-blue-400">API Reference</Link></li>
                            <li><Link href="#" className="hover:text-blue-400">Community</Link></li>
                            <li><Link href="#" className="hover:text-blue-400">Guides</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-6">Company</h4>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li><Link href="#" className="hover:text-blue-400">About Us</Link></li>
                            <li><Link href="#" className="hover:text-blue-400">Careers</Link></li>
                            <li><Link href="#" className="hover:text-blue-400">Legal</Link></li>
                            <li><Link href="#" className="hover:text-blue-400">Contact</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-16 border-t border-white/10 pt-8 flex flex-col items-center justify-between gap-4 md:flex-row">
                    <p className="text-xs text-gray-600">
                        © 2026 CodiGo Inc. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-xs text-gray-600">
                        <Link href="#" className="hover:text-white">Privacy Policy</Link>
                        <Link href="#" className="hover:text-white">Terms of Service</Link>
                        <Link href="#" className="hover:text-white">Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

const SocialLink = ({ href, icon }: { href: string; icon: React.ReactNode }) => (
    <Link href={href} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-gray-400 transition-colors hover:bg-blue-600 hover:text-white">
        {icon}
    </Link>
);
