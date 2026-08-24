"""
Stage 1b: Voice Activity Detection (VAD)
------------------------------------------
VAD answers one question per moment of audio: "is someone speaking right now,
or is this silence/noise/background hum?"

Why we need it: a phone call has long stretches of silence, breathing, dead
air. Running expensive models (synthetic voice detection, ASR) on silence
wastes compute and can even produce false "scam" signals from noise. So VAD
is a cheap first filter that only lets speech-containing audio through.

We use Silero VAD - a small, pretrained neural network (~1-2MB) that is
already trained to do exactly this. You do NOT need to train anything here;
you're just calling a ready-made model, same as calling a library function.

Output: a list of (start_time, end_time) ranges, in seconds, where speech was
detected. Example: [{"start": 0.5, "end": 2.3}, {"start": 3.1, "end": 5.0}]
"""

from typing import List, Dict
import torch
from silero_vad import load_silero_vad, get_speech_timestamps

_model = None  # loaded once and reused (loading a model is slow, don't reload per call)


def _get_model():
    global _model
    if _model is None:
        _model = load_silero_vad()
    return _model


def detect_speech_segments(
    waveform: torch.Tensor,
    sample_rate: int = 16000,
    min_speech_duration_ms: int = 250,
    min_silence_duration_ms: int = 200,
) -> List[Dict[str, float]]:
    """
    Given a mono 16kHz waveform tensor, return a list of speech segments.

    Parameters you can tune (this matters for your demo):
    - min_speech_duration_ms: ignore speech blips shorter than this (avoids
      false triggers from coughs, clicks, etc.)
    - min_silence_duration_ms: how much silence is needed before we consider
      a speech segment "ended" (avoids chopping one sentence into pieces
      because of a natural pause)

    Returns segments as {"start": seconds, "end": seconds}.
    """
    model = _get_model()

    timestamps = get_speech_timestamps(
        waveform,
        model,
        sampling_rate=sample_rate,
        min_speech_duration_ms=min_speech_duration_ms,
        min_silence_duration_ms=min_silence_duration_ms,
        return_seconds=True,
    )
    return timestamps


def is_speech_present(waveform: torch.Tensor, sample_rate: int = 16000) -> bool:
    """Quick boolean check - useful for a live stream where you just need to
    know 'should I bother processing this chunk at all?'"""
    segments = detect_speech_segments(waveform, sample_rate)
    return len(segments) > 0