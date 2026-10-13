from functools import lru_cache

from faster_whisper import WhisperModel


@lru_cache(maxsize=1)
def _load_model(model_name):
    return WhisperModel(model_name, device="cpu", compute_type="int8")


def transcribe_audio(audio_path, model_name):
    model = _load_model(model_name)
    segments, information = model.transcribe(
        str(audio_path),
        beam_size=5,
        vad_filter=True,
    )
    transcript = " ".join(segment.text.strip() for segment in segments).strip()
    return transcript, information.language or "unknown"
