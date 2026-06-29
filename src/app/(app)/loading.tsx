export default function AppLoading() {
  return (
    <div className="flex h-[80vh] w-full flex-col items-center justify-center">
      <div className="clay-card flex flex-col items-center justify-center p-12">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="absolute h-full w-full animate-spin rounded-full border-4 border-transparent border-t-violet-500 border-r-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.5)]"></div>
          <div className="absolute h-10 w-10 animate-spin rounded-full border-4 border-transparent border-b-fuchsia-500 border-l-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.5)]" style={{ animationDirection: "reverse", animationDuration: "1s" }}></div>
        </div>
        <p className="mt-8 text-sm font-extrabold tracking-widest text-[var(--color-clay-text)] animate-pulse uppercase">
          Loading Data...
        </p>
      </div>
    </div>
  );
}
