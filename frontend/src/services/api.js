import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    || (import.meta.env.DEV ? "http://localhost:5000/api" : "/api"),
  timeout: 180_000,
});

function getErrorMessage(error, fallback) {
  if (!error.response) {
    return "Cannot reach the SpeechAI backend. Start Flask from the backend folder, then try again.";
  }
  return error.response.data?.error || fallback;
}

export async function transcribeAudio(file) {
  const formData = new FormData();
  formData.append("file", file);
  try {
    const response = await api.post("/transcribe", formData);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to process this audio. Please try again."));
  }
}

export async function analyzeTranscript(transcript, audioFilename, language = "unknown") {
  try {
    const response = await api.post("/analyze", {
      transcript,
      audio_filename: audioFilename,
      language,
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to analyze this transcript. Please try again."));
  }
}

export async function getHistory() {
  try {
    const response = await api.get("/history");
    return response.data.history;
  } catch (error) {
    throw new Error(getErrorMessage(error, "History is temporarily unavailable."));
  }
}

export async function getHistoryItem(id) {
  try {
    const response = await api.get(`/history/${encodeURIComponent(id)}`);
    return response.data.result;
  } catch (error) {
    throw new Error(getErrorMessage(error, "This analysis is temporarily unavailable."));
  }
}

export async function deleteHistoryItem(id) {
  try {
    await api.delete(`/history/${encodeURIComponent(id)}`);
  } catch (error) {
    throw new Error(getErrorMessage(error, "This analysis could not be deleted. Please try again."));
  }
}
