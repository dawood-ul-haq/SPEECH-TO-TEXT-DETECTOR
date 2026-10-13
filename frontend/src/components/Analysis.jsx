import { Activity, AtSign, BarChart3, Hash, Lightbulb, MessageCircle } from "lucide-react";

const STATISTICS = [
  { key: "word_count", label: "Words", icon: BarChart3, tint: "bg-[#eef5e9] text-[#58825c]" },
  { key: "sentence_count", label: "Sentences", icon: MessageCircle, tint: "bg-[#eff0fa] text-[#7475ad]" },
  { key: "character_count", label: "Characters", icon: Hash, tint: "bg-[#fbf2e5] text-[#b0874e]" },
];

export default function Analysis({ analysis }) {
  if (!analysis) return null;
  const sentiment = analysis.sentiment || {};
  const sentimentLabel = sentiment.label || "neutral";
  const tones = [
    { key: "positive", label: "Positive", color: "bg-[#6cac7a]", text: "text-[#528761]" },
    { key: "neutral", label: "Neutral", color: "bg-[#d7b66f]", text: "text-[#a1844d]" },
    { key: "negative", label: "Negative", color: "bg-[#d77f71]", text: "text-[#b4695e]" },
  ];

  return (
    <section className="fade-in space-y-4">
      <div className="flex items-end justify-between gap-3 px-1">
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[1.5px] text-[#809284]">A little more context</p>
          <h2 className="font-['Manrope'] text-[21px] font-extrabold tracking-[-0.6px] text-[#24352b]">Language insights</h2>
        </div>
        <span className="mb-1 hidden items-center gap-1 text-[11px] font-medium text-[#8b978e] sm:flex"><Activity size={13} /> Instant NLP analysis</span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {STATISTICS.map(({ key, label, icon: Icon, tint }) => (
          <article key={key} className="surface rounded-[20px] border border-[#e7ece5] bg-white p-4 shadow-[0_8px_25px_rgba(29,51,43,0.04)] sm:p-5">
            <div className={`mb-4 flex h-9 w-9 items-center justify-center rounded-xl ${tint}`}><Icon size={17} /></div>
            <p className="font-['Manrope'] text-[26px] font-extrabold tracking-[-1px] text-[#26382e]">{(analysis[key] ?? 0).toLocaleString()}</p>
            <p className="muted mt-0.5 text-[11px] font-medium text-[#849087]">{label}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="surface rounded-[22px] border border-[#e7ece5] bg-white p-5 shadow-[0_8px_25px_rgba(29,51,43,0.04)] sm:p-6">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f5f1e7] text-[#9d8050]"><MessageCircle size={17} /></span>
            <div>
              <h3 className="text-[14px] font-bold text-[#2e4034]">Overall tone</h3>
              <p className="text-[10px] capitalize text-[#8a968d]">{sentimentLabel} sentiment</p>
            </div>
            <span className={`ml-auto rounded-full px-3 py-1 text-[10px] font-bold capitalize ${sentimentLabel === "positive" ? "bg-[#edf6e9] text-[#568565]" : sentimentLabel === "negative" ? "bg-[#fff0ed] text-[#b8695c]" : "bg-[#f7f3e9] text-[#9a8050]"}`}>
              {sentimentLabel}
            </span>
          </div>
          <div className="space-y-3">
            {tones.map((tone) => (
              <div key={tone.key}>
                <div className="mb-1.5 flex justify-between text-[10px] font-semibold">
                  <span className={tone.text}>{tone.label}</span>
                  <span className="text-[#8d998f]">{sentiment[tone.key] ?? 0}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[#f0f2ee]">
                  <div className={`h-full rounded-full transition-all duration-700 ${tone.color}`} style={{ width: `${Math.min(100, sentiment[tone.key] ?? 0)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="surface rounded-[22px] border border-[#e7ece5] bg-white p-5 shadow-[0_8px_25px_rgba(29,51,43,0.04)] sm:p-6">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf4e8] text-[#568063]"><Lightbulb size={17} /></span>
            <div>
              <h3 className="text-[14px] font-bold text-[#2e4034]">Key themes</h3>
              <p className="text-[10px] text-[#8a968d]">Words that stand out</p>
            </div>
          </div>
          {analysis.keywords?.length ? (
            <div className="flex flex-wrap gap-2">
              {analysis.keywords.map((keyword) => (
                <span key={keyword.text} className="inline-flex items-center gap-1.5 rounded-full border border-[#e4ece0] bg-[#f5f8f2] px-3 py-1.5 text-[11px] font-semibold capitalize text-[#52735b]">
                  {keyword.text}<span className="text-[9px] font-medium text-[#9aa99b]">{keyword.count}</span>
                </span>
              ))}
            </div>
          ) : <p className="rounded-xl bg-[#f7f9f5] px-4 py-3 text-[12px] text-[#8b968c]">No key themes were found in this transcript.</p>}
        </article>
      </div>

      <article className="surface rounded-[22px] border border-[#e7ece5] bg-white p-5 shadow-[0_8px_25px_rgba(29,51,43,0.04)] sm:p-6">
        <div className="mb-4 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f0eef8] text-[#7671a6]"><AtSign size={17} /></span>
          <div>
            <h3 className="text-[14px] font-bold text-[#2e4034]">People, places &amp; more</h3>
            <p className="text-[10px] text-[#8a968d]">Named entities found in your audio</p>
          </div>
          <span className="ml-auto rounded-full bg-[#f4f2f9] px-2.5 py-1 text-[10px] font-semibold text-[#79749e]">{analysis.named_entities?.length || 0} found</span>
        </div>
        {analysis.named_entities?.length ? (
          <div className="flex flex-wrap gap-2">
            {analysis.named_entities.map((entity, index) => (
              <span key={`${entity.text}-${index}`} className="inline-flex items-center gap-2 rounded-xl border border-[#ebe8f3] bg-[#faf9fc] px-3 py-2 text-[11px] font-semibold text-[#514d70]">
                {entity.text}<span className="rounded-md bg-[#efedf6] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#827ea4]">{entity.type.replaceAll("_", " ")}</span>
              </span>
            ))}
          </div>
        ) : <p className="rounded-xl bg-[#f8f7fb] px-4 py-3 text-[12px] text-[#8b899c]">No named entities were detected in this transcript.</p>}
      </article>
    </section>
  );
}
