"""
Stage 2b: Synthetic Voice Detection (AASIST-L)
-------------------------------------------------
GOAL: given a chunk of audio, estimate whether the voice is REAL (a human
speaking) or SYNTHETIC (AI text-to-speech, voice conversion, or a voice
clone).

We use AASIST-L, the lightweight variant of AASIST (Audio Anti-Spoofing
using Integrated Spectro-Temporal Graph Attention Networks), from the
official pretrained checkpoint (github.com/clovaai/aasist, MIT licensed).
AASIST-L has only ~85,000 parameters (tiny compared to most deep learning
models) and was trained on ASVspoof 2019 to reach 0.99% EER (Equal Error
Rate) - meaning on its benchmark test set, it's wrong only about 1% of the
time. Real-world calls will be noisier than the clean benchmark audio, so
expect real-world accuracy to be lower than that number - it's a ceiling,
not a guarantee.

IMPORTANT ARCHITECTURAL NOTE - fixed input length mismatch:
AASIST-L expects EXACTLY 64,600 audio samples per input, which at 16kHz is
~4.04 seconds. This is different from Stage 1's 1.5-second chunking window.
This isn't a bug to "fix" - the two stages are allowed to use different
window sizes, because they answer different questions on different
timescales:
    - Speaker verification / ASR: works fine on short 1-1.5s windows
      because "who is speaking" and "what word was said" are decidable
      quickly.
    - Synthetic voice detection: needs more audio context (~4s) because
      spotting spectral/temporal artifacts of AI generation requires
      seeing patterns over a longer stretch, not just an instant.

So this module independently handles turning WHATEVER length of audio it's
given into the required 64,600-sample input - by padding with silence if
shorter, or by trimming if longer. Practically, this means Stage 5 (Risk
Fusion) will call this on a wider audio window than the 1.5s chunks used
for ASR/speaker verification - e.g. accumulate the last ~4 seconds of
speech before calling this. We'll wire that up when we build the full
pipeline.py.
"""

import os
import sys
from typing import Dict
import torch

# Absolute path to ml-pipeline root (parent of stages/)
_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Add ml-pipeline root to sys.path so that `aasist_lib` is importable
if _ROOT not in sys.path:
    sys.path.insert(0, _ROOT)

from aasist_lib.AASIST import Model as AASISTModel

REQUIRED_SAMPLES = 64600  # what AASIST-L was trained on: ~4.04 sec at 16kHz

_MODEL_CONFIG = {
    "architecture": "AASIST",
    "nb_samp": 64600,
    "first_conv": 128,
    "filts": [70, [1, 32], [32, 32], [32, 24], [24, 24]],
    "gat_dims": [24, 32],
    "pool_ratios": [0.4, 0.5, 0.7, 0.5],
    "temperatures": [2.0, 2.0, 100.0, 100.0],
}

_WEIGHTS_PATH = os.path.join(_ROOT, "aasist_lib", "AASIST-L.pth")

_model = None


def _get_model():
    global _model
    if _model is None:
        _model = AASISTModel(_MODEL_CONFIG)
        state_dict = torch.load(_WEIGHTS_PATH, map_location="cpu")
        _model.load_state_dict(state_dict)
        _model.eval()  # inference mode: disables dropout etc.
    return _model


def _fit_to_required_length(waveform: torch.Tensor) -> torch.Tensor:
    """
    AASIST-L requires exactly 64,600 samples. Pad short audio with silence,
    or trim long audio, so this always works regardless of chunk size fed in.
    """
    length = waveform.shape[0]
    if length == REQUIRED_SAMPLES:
        return waveform
    elif length < REQUIRED_SAMPLES:
        padding = torch.zeros(REQUIRED_SAMPLES - length)
        return torch.cat([waveform, padding])
    else:
        return waveform[:REQUIRED_SAMPLES]


def detect_synthetic_voice(waveform: torch.Tensor) -> Dict:
    """
    Main entry point. Takes a mono 16kHz waveform of ANY length and returns
    a bonafide (real) vs spoof (synthetic) assessment.

    Returns:
        {
            "bonafide_score": float,  # higher = more likely REAL human voice
            "is_likely_synthetic": bool,
            "input_duration_sec": float,  # how much real audio was used
                                            # (vs. padding) - useful to know
                                            # since a mostly-padded input is
                                            # less reliable
        }
    """
    model = _get_model()

    original_length = waveform.shape[0]
    fitted = _fit_to_required_length(waveform)

    with torch.no_grad():
        _, logits = model(fitted.unsqueeze(0))  # add batch dimension
        # index 1 = bonafide (per AASIST's training convention), index 0 = spoof.
        # Softmax turns raw logits into a comparable/interpretable score.
        probabilities = torch.softmax(logits, dim=1)
        bonafide_score = probabilities[0, 1].item()

    return {
        "bonafide_score": bonafide_score,
        "is_likely_synthetic": bonafide_score < 0.5,
        "input_duration_sec": min(original_length, REQUIRED_SAMPLES) / 16000,
    }


def detect_synthetic_voice_multi_window(waveform: torch.Tensor, stride_sec: float = 4.0) -> Dict:
    """
    Instead of only scoring the FIRST 4.04 seconds of a clip (which may be
    intro/silence/non-representative audio), this slides through the whole
    clip in ~4-second windows, scores each one independently, and reports
    both the average and the worst-case (most-suspicious) window.

    This matters for longer test clips (or eventually, longer call segments)
    where a single window at a fixed position can give a misleading result.

    Returns:
        {
            "window_scores": [float, ...],      # bonafide_score per window
            "mean_bonafide_score": float,
            "min_bonafide_score": float,          # most-suspicious window
            "num_windows": int,
        }
    """
    stride_samples = int(stride_sec * 16000)
    total_samples = waveform.shape[0]

    window_scores = []
    pos = 0
    while pos < total_samples:
        window = waveform[pos: pos + REQUIRED_SAMPLES]
        # skip near-empty trailing windows (e.g. last 0.3s of a clip) - not
        # enough real audio to give a meaningful score
        if window.shape[0] >= 16000:  # at least 1 real second present
            result = detect_synthetic_voice(window)
            window_scores.append(result["bonafide_score"])
        pos += stride_samples

    if not window_scores:
        # clip shorter than 1 second - fall back to single-window behavior
        result = detect_synthetic_voice(waveform)
        window_scores = [result["bonafide_score"]]

    return {
        "window_scores": window_scores,
        "mean_bonafide_score": sum(window_scores) / len(window_scores),
        "min_bonafide_score": min(window_scores),
        "num_windows": len(window_scores),
    }
