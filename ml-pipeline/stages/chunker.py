"""
Stage 1c: Sliding Window Chunking
------------------------------------
The architecture doc specifies "1-2 sec sliding window." Here's why that
specific design exists, and what it means in code.

The problem: speaker verification, synthetic-voice detection, and ASR models
all expect a FIXED-size chunk of audio (e.g. exactly 1.5 seconds), not an
arbitrary-length speech segment. A sentence might be 4 seconds long, or 0.3
seconds long. So after VAD tells us "speech happened between 0.5s and 5.0s",
we need to slice that range into fixed-size windows.

"Sliding" means the windows can overlap - e.g. a 1.5s window that moves
forward in 0.5s steps, not 1.5s steps. Overlap matters because:
1. It avoids cutting a key word (like "OTP" or "transfer") exactly in half
   at a window boundary, which would break both ASR and intent detection.
2. It lets the risk score update smoothly/near-continuously instead of in
   sudden 1.5s jumps.

Trade-off: more overlap = smoother detection but more compute (each 0.5s of
audio gets processed 3x if step=0.5s and window=1.5s). For a hackathon demo,
this trade-off is fine to leave at default settings - just know it exists.
"""

from typing import List, Dict
import torch

from .vad import detect_speech_segments


def chunk_waveform(
    waveform: torch.Tensor,
    sample_rate: int = 16000,
    window_sec: float = 1.5,
    step_sec: float = 0.5,
) -> List[Dict]:
    """
    Slice a full waveform into fixed-size overlapping windows, but ONLY
    within regions where VAD detected speech (no point processing silence).

    Returns a list of dicts:
        {
            "start_time": float (seconds, position in original audio),
            "end_time": float,
            "audio": torch.Tensor (exactly window_sec * sample_rate samples)
        }
    This list is what gets handed to Stage 2 (speaker verification, synthetic
    voice detection, ASR) - each dict is one unit of work.
    """
    speech_segments = detect_speech_segments(waveform, sample_rate)

    window_samples = int(window_sec * sample_rate)
    step_samples = int(step_sec * sample_rate)

    chunks = []

    for segment in speech_segments:
        seg_start_sample = int(segment["start"] * sample_rate)
        seg_end_sample = int(segment["end"] * sample_rate)

        pos = seg_start_sample
        while pos < seg_end_sample:
            end_pos = pos + window_samples

            # For the last chunk in a segment, pad with zeros (silence) if the
            # remaining audio is shorter than window_sec, so every chunk fed
            # to downstream models is the SAME fixed length (models require this).
            if end_pos > len(waveform):
                chunk_audio = torch.zeros(window_samples)
                available = waveform[pos:len(waveform)]
                chunk_audio[: len(available)] = available
            else:
                chunk_audio = waveform[pos:end_pos]

            chunks.append({
                "start_time": pos / sample_rate,
                "end_time": min(end_pos, len(waveform)) / sample_rate,
                "audio": chunk_audio,
            })

            pos += step_samples

    return chunks


class StreamingChunker:
    """
    A real call doesn't hand you a full waveform up front - audio arrives in
    small live pieces. This class simulates/handles that: you keep feeding it
    small pieces via `push()`, and whenever enough audio has accumulated to
    form a full window, it yields that window immediately.

    This is the version your teammates' WebRTC layer will actually call,
    piece by piece, as the call happens live.
    """

    def __init__(self, sample_rate: int = 16000, window_sec: float = 1.5, step_sec: float = 0.5):
        self.sample_rate = sample_rate
        self.window_samples = int(window_sec * sample_rate)
        self.step_samples = int(step_sec * sample_rate)
        self._buffer = torch.zeros(0)
        self._elapsed_samples = 0  # total samples ever pushed, for timestamping

    def push(self, audio_piece: torch.Tensor) -> List[Dict]:
        """
        Feed in a new piece of live audio. Returns a list of any complete
        windows that are now ready (usually 0 or 1, occasionally more if a
        big piece was pushed at once).
        """
        self._buffer = torch.cat([self._buffer, audio_piece])
        ready_chunks = []

        while len(self._buffer) >= self.window_samples:
            window = self._buffer[: self.window_samples]
            start_time = self._elapsed_samples / self.sample_rate
            end_time = (self._elapsed_samples + self.window_samples) / self.sample_rate

            ready_chunks.append({
                "start_time": start_time,
                "end_time": end_time,
                "audio": window,
            })

            # Slide forward by step_samples, keep the rest buffered for next window's overlap
            self._buffer = self._buffer[self.step_samples:]
            self._elapsed_samples += self.step_samples

        return ready_chunks
