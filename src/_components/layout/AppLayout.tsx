"use client";

import { useState, useEffect } from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import {
  Bell,
  BookOpen,
  Clock3,
  Gauge,
  LogOut,
  Settings,
  Sword,
  PanelLeftClose,
  PanelLeftOpen,
  Trophy,
  UserCircle2,
  Key,
  Palette,
  Keyboard,
  Cpu,
  Monitor,
  Flag
} from "lucide-react";
import { useTheme } from "next-themes";

const sidebarNavItems = [
  { title: "Dashboard", href: "/dashboard", icon: Gauge },
  { title: "Practice", href: "/practice", icon: BookOpen },
  { title: "Arena Duel", href: "/arena", icon: Sword },
  { title: "Contest", href: "/contest", icon: Clock3 },
  { title: "CTF Hub", href: "/ctf", icon: Flag },
  { title: "Leaderboard", href: "/leaderboard", icon: Trophy },
] as const;

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const displayName = user ? user.username || [user.firstName, user.lastName].filter(Boolean).join(" ") || "Coder" : "Coder";
  const avatarUrl = user?.imageUrl;
  
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();

  const syncProfileMutation = api.user.syncProfile.useMutation();

  useEffect(() => {
    if (user) {
      syncProfileMutation.mutate({
        name: user.username || [user.firstName, user.lastName].filter(Boolean).join(" ") || "Coder",
        image: user.imageUrl,
      });
    }
  }, [user?.id]); // Only re-run if the user ID changes

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const isCodingPage = pathname?.startsWith('/arena/') || pathname?.startsWith('/practice/solve/') || (pathname?.startsWith('/contest/') && pathname !== '/contest' && pathname !== '/contest/admin');
  const [activeSettingsTab, setActiveSettingsTab] = useState<"appearance" | "editor" | "ai">("appearance");
  const [apiKey, setApiKey] = useState("");
  const [aiModel, setAiModel] = useState("gemini-2.0-flash");
  
  const { theme, setTheme, systemTheme } = useTheme();
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
      const savedKey = localStorage.getItem("codigo_gemini_key");
      if (savedKey) setApiKey(savedKey);
      
      const savedModel = localStorage.getItem("codigo_gemini_model");
      if (savedModel) setAiModel(savedModel);
  }, []);

  const handleSaveKey = () => {
      localStorage.setItem("codigo_gemini_key", apiKey);
      localStorage.setItem("codigo_gemini_model", aiModel);
      setIsSettingsOpen(false);
      window.dispatchEvent(new Event("api_key_updated"));
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);
      await signOut();
      router.replace("/sign-in");
      router.refresh();
    } catch {
      window.location.assign("/sign-in");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="font-sans min-h-screen">
      <div className="mx-auto flex max-w-370">
        <aside
          className={`sticky top-0 hidden h-screen shrink-0 transition-[width] duration-300 xl:block pt-4 pl-4 pb-4 ${isSidebarCollapsed ? "w-20" : "w-56"}`}
        >
          <div className="clay-panel flex h-full flex-col">
            <div className={`border-b border-gray-300/10 py-6 ${isSidebarCollapsed ? "px-4" : "px-6"}`}>
              <Link href="/dashboard" className={`flex items-center ${isSidebarCollapsed ? "justify-center" : "gap-4"}`}>
                <span className={`relative overflow-hidden rounded-full clay-btn flex shrink-0 ${isSidebarCollapsed ? "h-8 w-8" : "h-10 w-10"}`}>
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={`${displayName} profile picture`}
                      fill
                      sizes={isSidebarCollapsed ? "32px" : "40px"}
                      className="object-cover rounded-full"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-base font-bold text-gray-400">
                      {displayName.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                </span>
                {!isSidebarCollapsed ? (
                  <span className="max-w-32 truncate text-lg font-bold tracking-tight text-[var(--color-clay-text)]">{displayName}</span>
                ) : null}
              </Link>
            </div>

            <nav className={`flex-1 py-6 ${isSidebarCollapsed ? "px-3" : "px-5"}`}>
              <ul className="space-y-4">
                {sidebarNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

                  return (
                    <li key={item.title}>
                      <Link
                         href={item.href}
                         title={item.title}
                         className={`flex rounded-full px-4 py-3 text-sm transition font-medium ${
                           isSidebarCollapsed ? "justify-center" : "items-center gap-4"
                         } ${
                           isActive 
                             ? "clay-btn text-violet-600 shadow-[var(--shadow-clay-btn-active)]" 
                             : "text-[var(--color-clay-text-muted)] hover:text-violet-600 hover:scale-[1.02]"
                         }`}
                      >
                        <Icon className={`h-5 w-5 shrink-0 ${isActive ? "text-violet-600" : ""}`} />
                        {!isSidebarCollapsed ? <span>{item.title}</span> : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className={`border-t border-gray-300/10 py-6 ${isSidebarCollapsed ? "px-3" : "px-5"}`}>
              <button
                type="button"
                title="Settings"
                onClick={() => setIsSettingsOpen(true)}
                className={`flex w-full rounded-full px-4 py-3 text-sm font-medium text-[var(--color-clay-text-muted)] transition hover:text-[var(--color-clay-text)] hover:scale-[1.02] ${isSidebarCollapsed ? "justify-center" : "items-center gap-4"}`}
              >
                <Settings className="h-5 w-5 shrink-0" />
                {!isSidebarCollapsed ? <span>Settings</span> : null}
              </button>
              <button
                type="button"
                title="Logout"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={`mt-3 flex w-full rounded-full px-4 py-3 text-sm font-medium text-rose-500 transition hover:text-rose-700 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70 ${isSidebarCollapsed ? "justify-center" : "items-center gap-4"}`}
              >
                <LogOut className="h-5 w-5 shrink-0" />
                {!isSidebarCollapsed ? (
                  <span>{isLoggingOut ? "Logging out..." : "Sign out"}</span>
                ) : null}
              </button>
            </div>
          </div>
        </aside>

        <section className="flex-1 px-4 py-4 md:px-8 xl:pl-8 xl:pr-8 flex flex-col min-h-screen">
          {!isCodingPage && (
            <header className="sticky top-4 z-20 flex h-16 items-center justify-between clay-pill px-6 mb-8 shrink-0">
              <button
                type="button"
                onClick={toggleSidebar}
                className="hidden clay-btn h-10 w-10 text-[var(--color-clay-text-muted)] transition xl:flex items-center justify-center"
                aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isSidebarCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
              </button>

              <div className="xl:hidden font-bold text-[var(--color-clay-text)] text-xl">Codigo</div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  className="clay-btn h-10 w-10 flex items-center justify-center text-[var(--color-clay-text-muted)]"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                </button>
              </div>
            </header>
          )}

          <main className="flex-1 w-full max-w-7xl mx-auto">
            {children}
          </main>
        </section>
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-md p-4">
              <div className="clay-card w-full max-w-3xl overflow-hidden flex flex-col md:flex-row h-[600px] max-h-[90vh]">
                  
                  {/* Settings Sidebar */}
                  <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 p-6 bg-black/20">
                      <h2 className="text-xl font-extrabold text-[var(--color-clay-text)] mb-8 flex items-center gap-3">
                          <Settings className="w-5 h-5 text-violet-500" /> Settings
                      </h2>
                      
                      <div className="space-y-2">
                          <button 
                              onClick={() => setActiveSettingsTab("appearance")} 
                              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${activeSettingsTab === "appearance" ? "bg-white/10 text-white" : "text-[var(--color-clay-text-muted)] hover:bg-white/5 hover:text-white"}`}
                          >
                              <Palette className="w-4 h-4" /> Appearance
                          </button>
                          <button 
                              onClick={() => setActiveSettingsTab("editor")} 
                              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${activeSettingsTab === "editor" ? "bg-white/10 text-white" : "text-[var(--color-clay-text-muted)] hover:bg-white/5 hover:text-white"}`}
                          >
                              <Keyboard className="w-4 h-4" /> Editor
                          </button>
                          <button 
                              onClick={() => setActiveSettingsTab("ai")} 
                              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${activeSettingsTab === "ai" ? "bg-white/10 text-white" : "text-[var(--color-clay-text-muted)] hover:bg-white/5 hover:text-white"}`}
                          >
                              <Cpu className="w-4 h-4" /> AI Sensei
                          </button>
                      </div>
                  </div>

                  {/* Settings Content */}
                  <div className="flex-1 p-8 flex flex-col h-full overflow-y-auto custom-scrollbar">
                      <div className="flex-1">
                          {activeSettingsTab === "appearance" && (
                              <div className="animate-in fade-in duration-300">
                                  <h3 className="text-2xl font-bold mb-8 text-[var(--color-clay-text)]">Appearance</h3>
                                  
                                  <div className="mb-10">
                                      <label className="block text-sm font-bold text-[var(--color-clay-text)] mb-4">
                                          Theme Preference
                                      </label>
                                      {mounted && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <button 
                                                onClick={() => setTheme("system")}
                                                className={`clay-panel flex flex-col items-center justify-center gap-3 py-6 rounded-2xl transition border-2 ${theme === "system" ? "border-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.3)]" : "border-transparent hover:border-white/10"}`}
                                            >
                                                <Monitor className={`w-6 h-6 ${theme === "system" ? "text-violet-500" : "text-gray-400"}`} />
                                                <span className={`text-sm font-bold ${theme === "system" ? "text-violet-400" : "text-gray-400"}`}>System</span>
                                            </button>
                                            
                                            <button 
                                                onClick={() => setTheme("light")}
                                                className={`clay-panel flex flex-col items-center justify-center gap-3 py-6 rounded-2xl transition border-2 ${theme === "light" ? "border-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.3)]" : "border-transparent hover:border-white/10"}`}
                                            >
                                                <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white" />
                                                <span className={`text-sm font-bold ${theme === "light" ? "text-violet-400" : "text-gray-400"}`}>Light</span>
                                            </button>

                                            <button 
                                                onClick={() => setTheme("dark")}
                                                className={`clay-panel flex flex-col items-center justify-center gap-3 py-6 rounded-2xl transition border-2 ${theme === "dark" ? "border-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.3)]" : "border-transparent hover:border-white/10"}`}
                                            >
                                                <div className="w-6 h-6 rounded-full bg-gray-900 border-2 border-gray-700" />
                                                <span className={`text-sm font-bold ${theme === "dark" ? "text-violet-400" : "text-gray-400"}`}>Dark</span>
                                            </button>
                                        </div>
                                      )}
                                  </div>
                                  
                                  <div>
                                      <label className="block text-sm font-bold text-[var(--color-clay-text)] mb-4">
                                          Accent Color
                                      </label>
                                      <div className="flex gap-4">
                                          <button className="w-10 h-10 rounded-full bg-violet-600 ring-4 ring-violet-600/30" />
                                          <button className="w-10 h-10 rounded-full bg-blue-600 hover:ring-4 ring-blue-600/30 transition" />
                                          <button className="w-10 h-10 rounded-full bg-emerald-600 hover:ring-4 ring-emerald-600/30 transition" />
                                          <button className="w-10 h-10 rounded-full bg-rose-600 hover:ring-4 ring-rose-600/30 transition" />
                                      </div>
                                  </div>
                              </div>
                          )}

                          {activeSettingsTab === "editor" && (
                              <div className="animate-in fade-in duration-300">
                                  <h3 className="text-2xl font-bold mb-8 text-[var(--color-clay-text)]">Editor Preferences</h3>
                                  
                                  <div className="space-y-8">
                                      <div>
                                          <label className="block text-sm font-bold text-[var(--color-clay-text)] mb-3">Font Size</label>
                                          <select className="w-full clay-panel px-5 py-4 text-[var(--color-clay-text)] focus:outline-none appearance-none font-medium cursor-pointer">
                                              <option>12px</option>
                                              <option>14px (Default)</option>
                                              <option>16px</option>
                                              <option>18px</option>
                                              <option>20px</option>
                                          </select>
                                      </div>

                                      <div>
                                          <label className="block text-sm font-bold text-[var(--color-clay-text)] mb-3">Tab Size</label>
                                          <select className="w-full clay-panel px-5 py-4 text-[var(--color-clay-text)] focus:outline-none appearance-none font-medium cursor-pointer">
                                              <option>2 Spaces</option>
                                              <option>4 Spaces (Default)</option>
                                              <option>8 Spaces</option>
                                          </select>
                                      </div>

                                      <div>
                                          <label className="block text-sm font-bold text-[var(--color-clay-text)] mb-3">Keybindings</label>
                                          <select className="w-full clay-panel px-5 py-4 text-[var(--color-clay-text)] focus:outline-none appearance-none font-medium cursor-pointer">
                                              <option>Standard (VS Code)</option>
                                              <option>Vim</option>
                                              <option>Emacs</option>
                                          </select>
                                      </div>
                                  </div>
                              </div>
                          )}

                          {activeSettingsTab === "ai" && (
                              <div className="animate-in fade-in duration-300">
                                  <h3 className="text-2xl font-bold mb-8 text-[var(--color-clay-text)]">AI Sensei</h3>
                                  
                                  <div className="space-y-6">
                                      <div>
                                          <label className="block text-sm font-bold text-[var(--color-clay-text)] mb-3">
                                              AI Model
                                          </label>
                                          <select 
                                              className="w-full clay-panel px-5 py-4 text-[var(--color-clay-text)] focus:outline-none appearance-none font-medium cursor-pointer"
                                              value={aiModel}
                                              onChange={(e) => setAiModel(e.target.value)}
                                          >
                                              <option value="gemini-3.5-flash">Gemini 3.5 Flash (Latest)</option>
                                              <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                                              <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash Lite</option>
                                              <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                                              <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                                          </select>
                                      </div>
                                      
                                      <div>
                                          <label className="block text-sm font-bold text-[var(--color-clay-text)] mb-3">
                                              BYOK: Gemini API Key
                                          </label>
                                          <input 
                                              type="password" 
                                              placeholder="AIzaSy..."
                                              className="w-full clay-panel px-5 py-4 text-[var(--color-clay-text)] placeholder-[var(--color-clay-text-muted)] focus:outline-none font-mono"
                                              value={apiKey}
                                              onChange={(e) => setApiKey(e.target.value)}
                                          />
                                          <p className="text-xs font-medium text-[var(--color-clay-text-muted)] mt-4 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/10">
                                              Your key is stored securely in your browser&apos;s local storage. We never transmit it to our servers. It is strictly used client-side to power the AI Sensei assistant during your practice sessions.
                                          </p>
                                      </div>
                                  </div>
                              </div>
                          )}
                      </div>

                      {/* Footer Actions */}
                      <div className="mt-8 pt-6 border-t border-white/10 flex justify-end gap-4 shrink-0">
                          <button 
                              onClick={() => setIsSettingsOpen(false)}
                              className="clay-btn px-6 py-3 text-sm font-bold text-[var(--color-clay-text)]"
                          >
                              Cancel
                          </button>
                          <button 
                              onClick={handleSaveKey}
                              className="clay-btn px-8 py-3 text-sm font-bold bg-violet-600 text-white hover:bg-violet-500 border-none shadow-[0_0_20px_rgba(139,92,246,0.4)]"
                          >
                              Save Preferences
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
