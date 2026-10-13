import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import {
  AudioLines,
  Check,
  CircleStop,
  FileAudio2,
  Mic2,
  RotateCcw,
  Sparkles,
  Upload,
  X,
} from "lucide-react";

const ACCEPTED_AUDIO = ".wav,.mp3,.m4a,.mp4,.mpeg,.mpga,.webm,.ogg,.flac";

function formatSize(bytes) {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainder = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

const AudioRecorder = forwardRef(function AudioRecorder(
  { file, onFileChange, onTranscribe, isProcessing, processingMessage },
  ref,
) {
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const inputRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [fileUrl, setFileUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isRecording) return undefined;
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [isRecording]);

  useEffect(() => {
    if (!file) {
      setFileUrl("");
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setFileUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  const startRecording = async () => {
    setError("");
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setError("Audio recording is not supported in this browser. Try uploading a file instead.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        if (blob.size > 0) {
          const extension = blob.type.includes("ogg") ? "ogg" : "webm";
          onFileChange(new File([blob], `speech-recording-${Date.now()}.${extension}`, { type: blob.type }));
        } else {
          setError("No audio was captured. Please try recording again.");
        }
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      };
      recorder.start();
      setElapsed(0);
      setIsRecording(true);
    } catch {
      setError("Microphone access was unavailable. Check your browser permissions and try again.");
    }
  };

  useImperativeHandle(ref, () => ({
    startRecording,
    openFilePicker: () => inputRef.current?.click(),
  }));

  const stopRecording = () => {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const chooseFile = (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    if (!selectedFile.type.startsWith("audio/") && !ACCEPTED_AUDIO.split(",").some((type) => type.startsWith(".") && selectedFile.name.toLowerCase().endsWith(type))) {
      setError("Choose a supported audio file to continue.");
      event.target.value = "";
      return;
    }
    if (selectedFile.size > 50 * 1024 * 1024) {
      setError("Audio files must be smaller than 50 MB.");
      event.target.value = "";
      return;
    }
    setError("");
    onFileChange(selectedFile);
    event.target.value = "";
  };

  const clearFile = () => {
    onFileChange(null);
    setError("");
  };

  return (
    <section id="audio-workspace" className="surface scroll-mt-28 rounded-[26px] border border-[#e7ece5] bg-white p-5 shadow-soft sm:p-7">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[1.5px] text-[#77907e]">Your workspace</p>
          <h2 className="font-['Manrope'] text-[21px] font-extrabold tracking-[-0.65px] text-[#203128]">Add your audio</h2>
        </div>
        <span className="rounded-full bg-[#f1f5ed] px-3 py-1.5 text-[11px] font-semibold text-[#617469]">Up to 50 MB</span>
      </div>

      <div className={`relative overflow-hidden rounded-[22px] border px-5 py-8 text-center transition sm:px-8 ${isRecording ? "border-[#f0b8aa] bg-[#fff8f5]" : "border-[#e7eee5] bg-[#f8faf6]"}`}>
        <div className={`relative mx-auto mb-4 flex h-[76px] w-[76px] items-center justify-center rounded-full ${isRecording ? "bg-[#ffebe6] text-[#d77863]" : "bg-[#eaf3e7] text-[#377254]"}`}>
          {isRecording && <span className="absolute inset-0 animate-ping rounded-full bg-[#f5c0b4]/40" />}
          {isRecording ? <Mic2 className="relative" size={28} /> : <AudioLines size={29} />}
        </div>
        <p className="mb-1 text-[15px] font-bold text-[#29382f]">{isRecording ? "Recording in progress" : "Record a thought, or bring your own audio"}</p>
        <p className="muted mb-5 text-[12px] leading-5 text-[#829087]">
          {isRecording ? "Speak naturally. Your recording stays on this device until you analyze it." : "A clear recording helps us create a more accurate transcript."}
        </p>

        {isRecording ? (
          <div className="mb-4 flex items-center justify-center gap-2 text-[13px] font-semibold text-[#c16d5a]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#dc7e69]" />
            {formatTime(elapsed)}
          </div>
        ) : null}

        <div className="flex flex-wrap justify-center gap-2.5">
          {isRecording ? (
            <button onClick={stopRecording} className="inline-flex h-11 items-center gap-2 rounded-full bg-[#173c32] px-5 text-[13px] font-bold text-white transition hover:bg-[#225142]">
              <CircleStop size={16} /> Stop recording
            </button>
          ) : (
            <button disabled={isProcessing} onClick={startRecording} className="inline-flex h-11 items-center gap-2 rounded-full bg-[#173c32] px-5 text-[13px] font-bold text-white transition hover:bg-[#225142] disabled:cursor-not-allowed disabled:opacity-50">
              <Mic2 size={16} /> Start recording
            </button>
          )}
          <input ref={inputRef} type="file" accept={ACCEPTED_AUDIO} className="hidden" onChange={chooseFile} />
          <button disabled={isProcessing || isRecording} onClick={() => inputRef.current?.click()} className="inline-flex h-11 items-center gap-2 rounded-full border border-[#dce6dc] bg-white px-5 text-[13px] font-bold text-[#40574a] transition hover:bg-[#f2f7ef] disabled:cursor-not-allowed disabled:opacity-50">
            <Upload size={16} /> Upload audio
          </button>
        </div>
        <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-[#96a198]">
          <span className="h-px w-8 bg-[#e0e8df]" /> WAV · MP3 · M4A · WEBM · OGG <span className="h-px w-8 bg-[#e0e8df]" />
        </div>
        {error && <p role="alert" className="mx-auto mt-4 max-w-lg rounded-xl bg-[#fff0ed] px-4 py-2.5 text-left text-[12px] font-medium text-[#a44e40]">{error}</p>}
      </div>

      {file && (
        <div className="mt-4 rounded-[18px] border border-[#e6ece5] bg-white p-4 fade-in sm:p-5">
          <div className="mb-3 flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eff5eb] text-[#548064]"><FileAudio2 size={19} /></span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-bold text-[#29382f]">{file.name}</p>
              <p className="mt-0.5 text-[11px] text-[#8a968d]">{formatSize(file.size)} · Ready to analyze</p>
            </div>
            <button onClick={clearFile} disabled={isProcessing} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#849087] transition hover:bg-[#f3f5f2] hover:text-[#a44e40]" aria-label="Remove selected audio"><X size={16} /></button>
          </div>
          {fileUrl && <audio controls src={fileUrl} className="mb-4" />}
          <button
            onClick={() => onTranscribe(file)}
            disabled={isProcessing}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#c8f36a] px-5 text-[13px] font-extrabold text-[#21372a] transition hover:bg-[#bce95b] disabled:cursor-wait disabled:opacity-70"
          >
            {isProcessing ? <><RotateCcw className="animate-spin" size={16} />{processingMessage || "Processing audio..."}</> : <><Sparkles size={16} /> Transcribe &amp; analyze <Check size={15} className="ml-0.5" /></>}
          </button>
        </div>
      )}
    </section>
  );
});

export default AudioRecorder;
