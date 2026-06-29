import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";

import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "Codigo - Code Smarter Not Harder",
  description: "AI-powered competitive coding platform",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${geist.variable}`} suppressHydrationWarning>
        <body className="bg-[var(--color-clay-bg)] text-[var(--color-clay-text)] antialiased relative overflow-x-hidden min-h-screen" suppressHydrationWarning>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {/* Background Decorative Blobs for Glassmorphism */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-violet-400/30 blur-[120px] -z-10 pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-400/20 blur-[140px] -z-10 pointer-events-none" />
            <div className="fixed top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-rose-400/20 blur-[100px] -z-10 pointer-events-none" />
            
            <TRPCReactProvider>{children}</TRPCReactProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
