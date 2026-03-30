import type { ReactNode } from "react";

type AuthShellProps = {
  children: ReactNode;
};

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0a] px-4 py-10 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.2),transparent_42%),radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.16),transparent_40%),radial-gradient(circle_at_50%_100%,rgba(14,165,233,0.1),transparent_34%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(2,6,23,0.06),rgba(2,6,23,0.35))]" />
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center justify-center">
        {children}
      </div>
    </div>
  );
}