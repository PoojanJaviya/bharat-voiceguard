"""
Stage 1a: Audio Input
----------------------
Every stage downstream (VAD, speaker verification, synthetic voice detection,
ASR) expects audio in ONE consistent format:

    - mono (1 channel, not stereo)
    - 16,000 Hz sample rate (this is the standard for almost all speech ML models)
    - float32 values between -1.0 and 1.0

Why this matters: if you feed a stereo, 44.1kHz mp3 straight into a speech
model, it will either crash or silently give garbage results, because the
model was trained expecting a specific "shape" of input. This module's only
job is to make sure ANY input audio gets converted into that standard shape
before anything else touches it.

In production (a live call), this "audio" would be a continuous stream coming
from WebRTC. For now, we treat it as if it arrives in small blocks (chunks of
raw bytes/samples), because that's exactly how a live stream behaves anyway -
you never have "the whole call" ahead of time.
"""

import numpy as np
import soundfile as sf
import torch
import torchaudio

TARGET_SAMPLE_RATE = 16000  # standard for speech models (Whisper, Silero, ECAPA-TDNN, AASIST all expect this)


def load_audio_file(path: str) -> torch.Tensor:
    """
    Load an audio file from disk and convert it into the standard format:
    mono, 16kHz, float32 torch tensor of shape (num_samples,).

    This simulates "audio capture" for now. Later, your teammates' WebRTC
    layer will hand you raw PCM bytes instead of a file path - see
    `bytes_to_tensor()` below for that case.
    """
    # soundfile handles the file decoding (wav/flac/ogg reliably; for mp3 you'd
    # want ffmpeg-backed loading, but wav is what your WebRTC/mic demo will produce)
    samples, sample_rate = sf.read(path, dtype="float32", always_2d=True)  # shape: (num_samples, channels)
    waveform = torch.from_numpy(samples).T  # shape: (channels, num_samples)

    # Convert stereo -> mono by averaging channels
    if waveform.shape[0] > 1:
        waveform = waveform.mean(dim=0, keepdim=True)

    # Resample to 16kHz if the file isn't already at that rate
    if sample_rate != TARGET_SAMPLE_RATE:
        resampler = torchaudio.transforms.Resample(orig_freq=sample_rate, new_freq=TARGET_SAMPLE_RATE)
        waveform = resampler(waveform)

    return waveform.squeeze(0)  # shape: (num_samples,)


def bytes_to_tensor(raw_bytes: bytes, source_sample_rate: int, source_channels: int = 1) -> torch.Tensor:
    """
    Convert raw PCM audio bytes (e.g. from a WebRTC/mic stream) into the same
    standard format as load_audio_file(). This is the function your real
    pipeline will call once teammates wire up the live audio stream, since a
    live call gives you byte chunks, not a .wav file.

    Assumes 16-bit PCM samples (the most common raw audio format).
    """
    samples = np.frombuffer(raw_bytes, dtype=np.int16).astype(np.float32) / 32768.0  # int16 -> float32 [-1, 1]

    if source_channels > 1:
        samples = samples.reshape(-1, source_channels).mean(axis=1)

    waveform = torch.from_numpy(samples)

    if source_sample_rate != TARGET_SAMPLE_RATE:
        waveform = torchaudio.functional.resample(waveform, source_sample_rate, TARGET_SAMPLE_RATE)

    return waveform


def save_audio_file(path: str, waveform: torch.Tensor, sample_rate: int = TARGET_SAMPLE_RATE):
    """Utility for debugging: dump a waveform tensor back to a .wav file so you can listen to it."""
    sf.write(path, waveform.numpy(), sample_rate)