import { useEffect, useState } from "react";
import { ArrowUpRight, CalendarDays, Clock3, FileAudio2, LoaderCircle, Search, Trash2 } from "lucide-react";

function sentimentStyle(label) {
  if (label === "positive") return "bg-[#edf6e9] text-[#568565]";
  if (label === "negative") return "bg-[#fff0ed] text-[#b8695c]";
  return "bg-[#f7f3e9] text-[#9a8050]";
}

export default function History({ items, loading, error, onView, onDelete }) {
  const [query, setQuery] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    if (!confirmDelete) return undefined;
    const timer = window.setTimeout(() => setConfirmDelete(null), 3500);
    return () => window.clearTimeout(timer);
  }, [confirmDelete]);

  const filteredItems = items.filter((item) => (
    `${item.audio_filename} ${item.transcript}`.toLowerCase().includes(query.toLowerCase())
  ));

  return (
    <main className="mx-auto max-w-7xl px-5 pb-20 pt-12 sm:px-8 sm:pt-16">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[1.7px] text-[#77907e]">Your library</p>
          <h1 className="font-['Manrope'] text-[34px] font-extrabold tracking-[-1.8px] text-[#213329] sm:text-[42px]">Analysis history</h1>
          <p className="muted mt-2 max-w-xl text-[14px] leading-6 text-[#77847b]">Every conversation, thought, and idea you’ve turned into something more.</p>
        </div>
        <div className="flex h-11 min-w-[245px] items-center gap-2.5 rounded-full border border-[#e4eae2] bg-white px-4">
          <Search className="text-[#91a095]" size={16} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your history" className="w-full bg-transparent text-[12px] text-[#35473b] outline-none placeholder:text-[#a0aaa2]" />
        </div>
      </div>

      {loading ? (
        <div className="surface flex min-h-56 flex-col items-center justify-center rounded-[24px] border border-[#e7ece5] bg-white">
          <LoaderCircle className="mb-3 animate-spin text-[#649075]" size={24} />
          <p className="text-[13px] font-semibold text-[#53665a]">Loading your history...</p>
        </div>
      ) : error ? (
        <div role="alert" className="rounded-2xl border border-[#f1d5ce] bg-[#fff7f5] p-5 text-[13px] text-[#a44e40]">{error}</div>
      ) : filteredItems.length ? (
        <div className="grid gap-3">
          {filteredItems.map((item) => (
            <article key={item.id} className="surface group grid gap-4 rounded-[22px] border border-[#e7ece5] bg-white p-4 transition hover:border-[#d2dfce] hover:shadow-[0_12px_30px_rgba(29,51,43,0.06)] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-5">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#edf4e8] text-[#5a8165]"><FileAudio2 size={15} /></span>
                  <h2 className="max-w-[70%] truncate text-[13px] font-bold text-[#2f4035]">{item.audio_filename}</h2>
                  <span className={`rounded-full px-2.5 py-1 text-[9px] font-bold capitalize ${sentimentStyle(item.sentiment?.label)}`}>{item.sentiment?.label || "neutral"}</span>
                </div>
                <p className="mb-3 line-clamp-2 pl-10 text-[12px] leading-5 text-[#78847b]">{item.transcript}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pl-10 text-[10px] text-[#97a198]">
                  <span className="inline-flex items-center gap-1"><CalendarDays size={12} />{item.created_at ? new Date(item.created_at).toLocaleDateString(undefined, { dateStyle: "medium" }) : "Recently"}</span>
                  <span className="inline-flex items-center gap-1"><Clock3 size={12} />{item.word_count} words</span>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                {confirmDelete === item.id ? (
                  <>
                    <span className="text-[10px] font-semibold text-[#9b6158]">Delete this result?</span>
                    <button onClick={() => { onDelete(item.id); setConfirmDelete(null); }} className="rounded-full bg-[#a95649] px-3 py-2 text-[10px] font-bold text-white">Confirm</button>
                    <button onClick={() => setConfirmDelete(null)} className="rounded-full px-3 py-2 text-[10px] font-semibold text-[#77847b] hover:bg-[#f2f5f0]">Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => onView(item.id)} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#eef5e9] px-4 text-[11px] font-bold text-[#42694e] transition hover:bg-[#e2eedc]">
                      View <ArrowUpRight size={13} />
                    </button>
                    <button onClick={() => setConfirmDelete(item.id)} className="flex h-9 w-9 items-center justify-center rounded-full text-[#98a29a] transition hover:bg-[#fff0ed] hover:text-[#b8695c]" aria-label={`Delete ${item.audio_filename}`}><Trash2 size={15} /></button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="surface flex min-h-72 flex-col items-center justify-center rounded-[24px] border border-dashed border-[#dfe7dd] bg-white px-6 text-center">
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#eff5eb] text-[#6c8c73]"><FileAudio2 size={24} /></span>
          <h2 className="font-['Manrope'] text-[17px] font-extrabold text-[#34463a]">{query ? "No matching analyses" : "Your next big idea starts here"}</h2>
          <p className="muted mt-2 max-w-sm text-[12px] leading-5 text-[#859188]">{query ? "Try another keyword or filename." : "Once you transcribe some audio, your results will be waiting here."}</p>
        </div>
      )}
    </main>
  );
}
