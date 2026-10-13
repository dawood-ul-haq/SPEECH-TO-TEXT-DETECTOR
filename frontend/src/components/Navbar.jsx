import { AudioLines, ChevronDown, Moon, Sun } from "lucide-react";

export default function Navbar({ page, onNavigate, darkMode, onToggleTheme }) {
  const showAbout = () => {
    if (page !== "dashboard") {
      onNavigate("dashboard");
      window.setTimeout(() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" }), 80);
      return;
    }
    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="nav-bg sticky top-0 z-30 border-b border-[#e7ece5] bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-5 sm:h-[76px] sm:px-8">
        <button
          className="flex items-center gap-3"
          onClick={() => onNavigate("dashboard")}
          aria-label="SpeechAI dashboard"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#173c32] text-[#c8f36a] shadow-sm">
            <AudioLines size={21} strokeWidth={2.2} />
          </span>
          <span className="text-left">
            <span className="block font-['Manrope'] text-[17px] font-extrabold tracking-[-0.6px]">speech<span className="text-[#438060]">ai</span></span>
            <span className="muted -mt-0.5 block text-[10px] font-semibold uppercase tracking-[1.55px] text-[#849188]">Voice, understood</span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          <button
            onClick={() => onNavigate("dashboard")}
            className={`rounded-full px-4 py-2 text-[13px] font-semibold transition ${page === "dashboard" ? "bg-[#edf3eb] text-[#1e4939]" : "muted text-[#68756c] hover:bg-[#f3f6f1]"}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onNavigate("history")}
            className={`rounded-full px-4 py-2 text-[13px] font-semibold transition ${page === "history" ? "bg-[#edf3eb] text-[#1e4939]" : "muted text-[#68756c] hover:bg-[#f3f6f1]"}`}
          >
            History
          </button>
          <button
            onClick={showAbout}
            className="muted rounded-full px-4 py-2 text-[13px] font-semibold text-[#68756c] transition hover:bg-[#f3f6f1]"
          >
            About <ChevronDown className="ml-1 inline" size={13} />
          </button>
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-[#e5ebe3] bg-white px-3 py-1.5 text-[11px] font-medium text-[#748077] sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[#69b487]" /> Local &amp; private
          </span>
          <button
            onClick={onToggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e5ebe3] text-[#546259] transition hover:bg-[#f1f5ef]"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </div>
      <nav className="flex items-center justify-center gap-2 border-t border-[#e7ece5] px-4 py-2 md:hidden" aria-label="Mobile navigation">
        <button onClick={() => onNavigate("dashboard")} className={`rounded-full px-4 py-1.5 text-[11px] font-semibold ${page === "dashboard" ? "bg-[#edf3eb] text-[#1e4939]" : "text-[#68756c]"}`}>Dashboard</button>
        <button onClick={() => onNavigate("history")} className={`rounded-full px-4 py-1.5 text-[11px] font-semibold ${page === "history" ? "bg-[#edf3eb] text-[#1e4939]" : "text-[#68756c]"}`}>History</button>
        <button onClick={showAbout} className="rounded-full px-4 py-1.5 text-[11px] font-semibold text-[#68756c]">About</button>
      </nav>
    </header>
  );
}
