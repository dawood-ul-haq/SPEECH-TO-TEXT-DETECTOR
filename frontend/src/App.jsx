import { useEffect, useRef, useState } from "react";
import { ArrowDown, AudioLines, Check, ChevronRight, CircleHelp, Headphones, LoaderCircle, LockKeyhole, Sparkles } from "lucide-react";
import Analysis from "./components/Analysis";
import AudioRecorder from "./components/AudioRecorder";
import History from "./components/History";
import Navbar from "./components/Navbar";
import Transcript from "./components/Transcript";
import { deleteHistoryItem, getHistory, getHistoryItem, transcribeAudio } from "./services/api";

function normalizeHistoryItem(item) {
  return {
    ...item,
    saved: true,
    analysis: {
      word_count: item.word_count,
      sentence_count: item.sentence_count,
      character_count: item.character_count,
      keywords: item.keywords,
      named_entities: item.named_entities,
      sentiment: item.sentiment,
    },
  };
}

export default function App() {
  const recorderRef = useRef(null);
  const [page, setPage] = useState("dashboard");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("Transcribing audio...");
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [toast, setToast] = useState("");
  const [darkMode, setDarkMode] = useState(() => window.localStorage.getItem("speechai-theme") === "dark");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    window.localStorage.setItem("speechai-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 3600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const loadHistory = async () => {
    setHistoryLoading(true);
    setHistoryError("");
    try {
      setHistory(await getHistory());
    } catch (error) {
      setHistoryError(error.message);
    } finally {
      setHistoryLoading(false);
    }
  };

  const navigate = (nextPage) => {
    setPage(nextPage);
    if (nextPage === "history") loadHistory();
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const processAudio = async (audioFile) => {
    setProcessing(true);
    setResult(null);
    setProcessingMessage("Transcribing audio...");
    const phaseTimer = window.setTimeout(() => setProcessingMessage("Analyzing text..."), 1800);
    const saveTimer = window.setTimeout(() => setProcessingMessage("Saving results..."), 3800);
    try {
      const response = await transcribeAudio(audioFile);
      setResult(response);
      setFile(null);
      setToast(response.saved === false
        ? "Transcript ready, but not saved. Check MongoDB settings to save to history."
        : "Your transcript and insights are ready.");
      if (response.saved !== false) loadHistory();
      window.setTimeout(() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    } catch (error) {
      setToast(error.message || "Unable to process this audio. Please try again.");
    } finally {
      window.clearTimeout(phaseTimer);
      window.clearTimeout(saveTimer);
      setProcessing(false);
    }
  };

  const openHistoryItem = async (id) => {
    try {
      const item = await getHistoryItem(id);
      setResult(normalizeHistoryItem(item));
      setFile(null);
      setPage("dashboard");
      window.setTimeout(() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    } catch (error) {
      setToast(error.message);
    }
  };

  const removeHistoryItem = async (id) => {
    try {
      await deleteHistoryItem(id);
      setHistory((items) => items.filter((item) => item.id !== id));
      setToast("Analysis removed from your history.");
    } catch (error) {
      setToast(error.message);
    }
  };

  const focusRecorder = () => {
    document.getElementById("audio-workspace")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const startRecording = () => {
    focusRecorder();
    recorderRef.current?.startRecording();
  };

  const openAudioPicker = () => {
    focusRecorder();
    recorderRef.current?.openFilePicker();
  };

  return (
    <div className="min-h-screen bg-[#f6f8f4] text-[#19241f] transition-colors">
      <Navbar page={page} onNavigate={navigate} darkMode={darkMode} onToggleTheme={() => setDarkMode((value) => !value)} />

      {page === "history" ? (
        <History items={history} loading={historyLoading} error={historyError} onView={openHistoryItem} onDelete={removeHistoryItem} />
      ) : (
        <main className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
          <section className="hero-bg relative mt-7 overflow-hidden rounded-[30px] bg-[#eaf1e5] px-6 py-10 sm:mt-9 sm:px-10 sm:py-12 lg:px-14 lg:py-[58px]">
            <div className="pointer-events-none absolute -right-14 -top-36 h-[390px] w-[390px] rounded-full border border-[#cbd9c6]/70" />
            <div className="pointer-events-none absolute -right-2 -top-24 h-[290px] w-[290px] rounded-full border border-[#cbd9c6]/70" />
            <div className="pointer-events-none absolute -right-24 bottom-[-215px] h-[350px] w-[350px] rounded-full bg-[#dce9d6]/65" />
            <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_0.74fr]">
              <div className="max-w-[680px]">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d1dfcc] bg-white/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[1.1px] text-[#52745a]">
                  <Sparkles size={12} /> Voice intelligence, made simple
                </div>
                <h1 className="font-['Manrope'] text-[38px] font-extrabold leading-[1.08] tracking-[-2.2px] text-[#1d3327] sm:text-[50px] lg:text-[57px]">
                  Turn Your Voice Into <span className="text-[#598264]">Meaningful Text</span>
                </h1>
                <p className="mt-4 max-w-lg text-[14px] leading-6 text-[#627669] sm:text-[15px]">
                  Transcribe your speech and instantly discover insights using NLP. Your ideas, understood in a whole new way.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <button onClick={startRecording} className="inline-flex h-12 items-center gap-2 rounded-full bg-[#173c32] px-5 text-[12px] font-bold text-white shadow-[0_8px_22px_rgba(23,60,50,0.18)] transition hover:-translate-y-0.5 hover:bg-[#225142]">
                    <AudioLines size={16} /> Start recording <ChevronRight size={15} />
                  </button>
                  <button onClick={openAudioPicker} className="inline-flex h-12 items-center gap-2 rounded-full border border-[#cddbc9] bg-white/80 px-5 text-[12px] font-bold text-[#3d5b47] transition hover:bg-white">
                    Upload audio <ArrowDown size={14} />
                  </button>
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] font-medium text-[#718476]">
                  <span className="inline-flex items-center gap-1.5"><LockKeyhole size={12} /> Private by design</span>
                  <span className="inline-flex items-center gap-1.5"><Check size={12} /> Powered by local AI</span>
                </div>
              </div>

              <div className="relative mx-auto hidden w-full max-w-[360px] lg:block">
                <div className="absolute -left-7 top-10 h-10 w-10 rounded-2xl border border-white/70 bg-white/70 shadow-sm" />
                <div className="relative overflow-hidden rounded-[26px] border border-white/80 bg-white/80 p-5 shadow-[0_24px_70px_rgba(49,79,57,0.12)] backdrop-blur">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#173c32] text-[#c8f36a]"><Headphones size={17} /></span>
                      <div><p className="text-[11px] font-bold text-[#34473a]">A clearer picture</p><p className="text-[9px] text-[#91a095]">Your audio, at a glance</p></div>
                    </div>
                    <span className="rounded-full bg-[#eff6eb] px-2 py-1 text-[9px] font-bold text-[#5e8667]">READY</span>
                  </div>
                  <div className="my-7 flex h-[76px] items-center justify-center gap-[5px]">
                    {[16, 28, 39, 24, 48, 34, 54, 30, 44, 61, 38, 50, 26, 41, 58, 32, 46, 22, 38, 52, 29, 42, 18].map((height, index) => (
                      <span key={index} className={`w-[5px] rounded-full ${index < 11 ? "bg-[#8cb595]" : "bg-[#dfe9dc]"}`} style={{ height }} />
                    ))}
                  </div>
                  <div className="rounded-2xl bg-[#f7f9f5] p-3.5">
                    <div className="mb-2 flex justify-between text-[9px] font-semibold text-[#75847a]"><span>Language insights</span><span>Just now</span></div>
                    <p className="text-[11px] leading-5 text-[#5c6d60]">One thoughtful conversation can reveal more than just the words...</p>
                    <div className="mt-3 flex gap-1.5"><span className="rounded-full bg-[#e8f1e4] px-2 py-1 text-[8px] font-bold text-[#65826a]">clear</span><span className="rounded-full bg-[#f2efdf] px-2 py-1 text-[8px] font-bold text-[#a08c58]">ideas</span><span className="rounded-full bg-[#eef0f8] px-2 py-1 text-[8px] font-bold text-[#7b80a7]">insight</span></div>
                  </div>
                </div>
                <div className="absolute -bottom-5 -right-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#c8f36a] text-[#31533c] shadow-md"><AudioLines size={21} /></div>
              </div>
            </div>
          </section>

          <div className="mx-auto mt-8 grid max-w-5xl gap-7">
            <AudioRecorder ref={recorderRef} file={file} onFileChange={setFile} onTranscribe={processAudio} isProcessing={processing} processingMessage={processingMessage} />

            {processing && (
              <div className="surface flex items-center gap-3 rounded-2xl border border-[#dce9d7] bg-white px-5 py-4 text-[12px] font-semibold text-[#55735b] fade-in" role="status">
                <LoaderCircle className="animate-spin" size={17} /> <span><strong>Processing audio...</strong> {processingMessage} This can take a little while for longer recordings.</span>
              </div>
            )}

            {result && (
              <div id="results" className="scroll-mt-24 space-y-5">
                <Transcript result={result} />
                <Analysis analysis={result.analysis} />
              </div>
            )}
          </div>

          <section id="about" className="mx-auto mt-16 max-w-5xl scroll-mt-28 border-t border-[#e6ebe4] pt-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex max-w-xl gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eaf2e6] text-[#66836a]"><CircleHelp size={17} /></span>
                <div><h2 className="text-[12px] font-bold text-[#465a4b]">About SpeechAI</h2><p className="mt-1 text-[11px] leading-5 text-[#89968c]">A private, local-first speech workspace. SpeechAI turns audio into a transcript, then surfaces useful language insights without sending your recordings to a hosted AI service.</p></div>
              </div>
              <button onClick={() => navigate("history")} className="text-[11px] font-bold text-[#58785f] transition hover:text-[#315b3c]">Explore your history <ChevronRight className="ml-1 inline" size={13} /></button>
            </div>
          </section>
        </main>
      )}

      {toast && (
        <div role="status" className="fixed bottom-5 left-1/2 z-50 flex max-w-[calc(100%-2rem)] -translate-x-1/2 items-center gap-2 rounded-full bg-[#173c32] px-5 py-3 text-[12px] font-semibold text-white shadow-xl fade-in">
          <Check size={15} className="shrink-0 text-[#c8f36a]" />{toast}
        </div>
      )}
    </div>
  );
}
