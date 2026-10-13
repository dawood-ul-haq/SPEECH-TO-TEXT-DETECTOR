import { useState } from "react";
import { Check, Clipboard, Download, FileText, Globe2 } from "lucide-react";

export default function Transcript({ result }) {
  const [copied, setCopied] = useState(false);
  if (!result) return null;

  const copyTranscript = async () => {
    try {
      await navigator.clipboard.writeText(result.transcript);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const downloadTranscript = () => {
    const blob = new Blob([result.transcript], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(result.audio_filename || "transcript").replace(/\.[^.]+$/, "")}-transcript.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="surface fade-in rounded-[26px] border border-[#e7ece5] bg-white p-5 shadow-soft sm:p-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf4e8] text-[#47795a]"><FileText size={19} /></span>
          <div>
            <h2 className="font-['Manrope'] text-[18px] font-extrabold tracking-[-0.4px] text-[#26382e]">Your transcript</h2>
            <p className="muted mt-0.5 text-[11px] text-[#849087]">Speech recognized and ready to explore</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-[#eff7ec] px-2.5 py-1.5 text-[10px] font-bold capitalize text-[#4f805e]"><Globe2 size={12} /> {result.language || "unknown"}</span>
          <span className="hidden items-center gap-1 rounded-full border border-[#e7ece5] px-2.5 py-1.5 text-[10px] font-semibold text-[#78857c] sm:flex"><Check size={12} /> Complete</span>
        </div>
      </div>
      <div className="rounded-[18px] bg-[#f7f9f5] p-5 sm:p-6">
        <p className="whitespace-pre-wrap text-[14px] leading-[1.9] text-[#34483a] sm:text-[15px]">{result.transcript}</p>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <span className={`text-[11px] ${result.saved === false ? "font-semibold text-[#a16f35]" : "text-[#94a097]"}`}>
          {result.saved === false
            ? "Not saved — check MongoDB settings to add this to history."
            : "Saved to your local analysis history"}
        </span>
        <div className="flex gap-2">
          <button onClick={copyTranscript} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#e2e9e1] px-3.5 text-[11px] font-semibold text-[#5d6d61] transition hover:bg-[#f4f7f2]">
            {copied ? <Check size={13} /> : <Clipboard size={13} />}{copied ? "Copied" : "Copy"}
          </button>
          <button onClick={downloadTranscript} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#e2e9e1] px-3.5 text-[11px] font-semibold text-[#5d6d61] transition hover:bg-[#f4f7f2]">
            <Download size={13} /> Download
          </button>
        </div>
      </div>
    </section>
  );
}
