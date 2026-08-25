"""
Stage 2c: Replay / Audio Integrity Detection (LFCC + GMM)
-------------------------------------------------------------
GOAL: given a chunk of audio, estimate whether it is a REPLAYED /
RE-RECORDED clip (someone playing a recording of a real human voice near
the microphone, e.g. through a speaker) - as opposed to a genuine LIVE
voice.

WHY THIS IS DIFFERENT FROM STAGE 2b (synthetic_voice_detection.py):
That module asks "is this voice AI-generated?" This module asks a
different question: "is this a real human voice that has been played back
through a recording, rather than spoken live?" A scammer could play a
recorded snippet of someone's real family member's real voice near the
phone mic - that would NOT be flagged as synthetic (it's not AI-generated
speech at all), but it WOULD be flagged here, because replaying audio through
a speaker and re-recording it leaves detectable artifacts: added room echo,
speaker/mic frequency response quirks, and subtle distortion that live
speech doesn't have.

HOW IT WORKS (concept):
We use LFCC (Linear Frequency Cepstral Coefficients) - similar in spirit to
the MFCCs used in many speech tasks, but using evenly-spaced frequency bands
instead of the mel scale. LFCC is the standard front-end used in ASVspoof's
"Physical Access" (replay attack) baseline systems, because it's better than
MFCC at preserving the kind of high-frequency detail that replay artifacts
show up in.

We then use two GMMs (Gaussian Mixture Models - a classical, lightweight
statistical model, not a deep neural network):
    - one GMM learns what BONAFIDE (live, genuine) LFCC patterns look like
    - one GMM learns what REPLAY LFCC patterns look like
For a new clip, we score it against both and see which one it resembles
more. This is much cheaper to train than a deep model (no GPU needed) and
is a reasonable baseline to get working quickly, matching the approach used
by the official ASVspoof Physical Access baseline system.

LIMITATION (be upfront about this): this is a classical/lightweight
approach, not a deep neural network like AASIST. It should be treated as a
first working baseline, not a final answer - it can be swapped for a
pretrained deep model (e.g. RawNet2 trained on ASVspoof's PA/replay track)
later without changing this file's interface, only what's inside
_get_model() and detect_replay().

WINDOW SIZE NOTE:
Unlike AASIST-L, LFCC+GMM has no fixed required input length - it can score
audio of any length. To keep Stage 5 (Risk Fusion) simple, this module
follows the SAME ~4-second window convention as synthetic_voice_detection.py,
so both detectors can share the same accumulated audio buffer rather than
needing two different buffer sizes.
"""

import os
import pickle
from typing import Dict, List, Optional
import numpy as np
import torch
import librosa

# Absolute path to ml-pipeline root (parent of stages/)
_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

WINDOW_SAMPLES = 64600  # ~4.04 sec at 16kHz - matches synthetic_voice_detection.py's window,
                          # so Stage 5 can reuse the same audio buffer for both

_MODEL_PATH = os.path.join(_ROOT, "pretrained_models", "replay_lfcc_gmm.pkl")

_model = None  # loaded once, reused across calls (same lazy-loading pattern as other stages)


def _get_model():
    """
    Lazily loads the trained LFCC-GMM model (two GMMs: bonafide + replay)
    from a local pickle file. You must train and save this file yourself
    first - see train_replay_model() at the bottom of this file. This is
    different from Stage 2b/2a, which download a pretrained checkpoint
    automatically - no ready-made pretrained checkpoint exists for this
    lightweight approach, so it has to be trained on your own small labeled
    dataset first.
    """
    global _model
    if _model is None:
        if not os.path.exists(_MODEL_PATH):
            raise FileNotFoundError(
                f"No trained replay-detection model found at {_MODEL_PATH}.\n"
                "Run train_replay_model() first (see bottom of this file) with "
                "a small set of bonafide (live) and replay (recorded/replayed) "
                "audio files to create it."
            )
        with open(_MODEL_PATH, "rb") as f:
            _model = pickle.load(f)
    return _model


def _extract_lfcc(waveform: torch.Tensor, sr: int = 16000, n_lfcc: int = 20) -> np.ndarray:
    """
    Converts a waveform into LFCC features (see module docstring above for
    what these are and why we use them). Internally uses numpy/librosa
    since that's what the feature-extraction ecosystem expects, then hands
    a torch.Tensor back out at the boundaries of this module to match the
    rest of the pipeline's convention.
    """
    audio = waveform.numpy() if isinstance(waveform, torch.Tensor) else waveform

    n_fft = 512
    hop_length = 160
    stft = librosa.stft(audio, n_fft=n_fft, hop_length=hop_length)
    power_spec = np.abs(stft) ** 2

    # Linear-scale filterbank (equally spaced, unlike the mel scale used in MFCC)
    n_filters = 40
    freqs = np.linspace(0, sr / 2, n_fft // 2 + 1)
    filter_edges = np.linspace(0, sr / 2, n_filters + 2)
    fbank = np.zeros((n_filters, len(freqs)))
    for i in range(n_filters):
        lo, mid, hi = filter_edges[i], filter_edges[i + 1], filter_edges[i + 2]
        left = (freqs >= lo) & (freqs <= mid)
        right = (freqs > mid) & (freqs <= hi)
        if mid > lo:
            fbank[i, left] = (freqs[left] - lo) / (mid - lo)
        if hi > mid:
            fbank[i, right] = (hi - freqs[right]) / (hi - mid)

    filtered = np.dot(fbank, power_spec)
    log_filtered = np.log(filtered + 1e-10)

    from scipy.fftpack import dct
    lfcc = dct(log_filtered, type=2, axis=0, norm="ortho")[:n_lfcc]

    return lfcc.T  # shape: (n_frames, n_lfcc)


def _fit_to_window(waveform: torch.Tensor) -> torch.Tensor:
    """
    Pads with silence or trims so every input is the same ~4s window length,
    matching synthetic_voice_detection.py's _fit_to_required_length(). This
    isn't strictly required by LFCC-GMM (it can handle variable length),
    but keeping window size consistent across both detectors makes Stage 5's
    buffering logic simpler and the two detectors' outputs more comparable.
    """
    length = waveform.shape[0]
    if length == WINDOW_SAMPLES:
        return waveform
    elif length < WINDOW_SAMPLES:
        padding = torch.zeros(WINDOW_SAMPLES - length)
        return torch.cat([waveform, padding])
    else:
        return waveform[:WINDOW_SAMPLES]


def detect_replay(waveform: torch.Tensor) -> Dict:
    """
    Main entry point Stage 5 (Risk Fusion) will call.

    Input: mono 16kHz waveform, any length (will be padded/trimmed to ~4s
    internally, same as synthetic_voice_detection.py).

    Returns:
        {
            "bonafide_score": float,     # higher = more likely a LIVE, genuine voice
            "is_likely_replay": bool,
            "input_duration_sec": float,  # how much real audio was used (vs padding)
        }

    NOTE: naming deliberately mirrors detect_synthetic_voice()'s output
    shape ("bonafide_score", "is_likely_X") so Stage 5 can treat both
    detectors' results uniformly.
    """
    model = _get_model()  # dict with "gmm_bonafide" and "gmm_replay"

    original_length = waveform.shape[0]
    fitted = _fit_to_window(waveform)

    feats = _extract_lfcc(fitted)

    ll_bonafide = model["gmm_bonafide"].score(feats)  # avg log-likelihood under bonafide GMM
    ll_replay = model["gmm_replay"].score(feats)      # avg log-likelihood under replay GMM

    # Turn the difference in log-likelihoods into a 0-1 "bonafide_score"
    # (higher = more genuine-sounding), using a logistic squash - same
    # style of 0-1 normalization as the softmax probability used in
    # detect_synthetic_voice().
    diff = ll_bonafide - ll_replay
    bonafide_score = float(1 / (1 + np.exp(-diff)))

    return {
        "bonafide_score": bonafide_score,
        "is_likely_replay": bonafide_score < 0.5,
        "input_duration_sec": min(original_length, WINDOW_SAMPLES) / 16000,
    }


# --------------------------------------------------------------------------- #
# Training helper - run this ONCE up front to create the model file that
# _get_model() loads. Not called automatically, since it needs you to supply
# your own labeled audio files.
# --------------------------------------------------------------------------- #

def train_replay_model(
    bonafide_files: List[str],
    replay_files: List[str],
    n_components: int = 8,
    save_path: Optional[str] = None,
) -> None:
    """
    Trains the two GMMs (bonafide vs replay) on labeled audio files and
    saves them to disk so detect_replay() can load and use them later.

    bonafide_files: paths to genuine, live-sounding recordings
                    (e.g. your existing testing_audio_files/raw.wav,
                    jiang.wav, etc. - anything that's a normal live voice
                    clip, not played back through a speaker)
    replay_files:   paths to replayed/re-recorded audio - the easiest way
                    to generate these yourself: play a clean recording out
                    of a phone/laptop speaker and re-record it with a
                    second device's microphone.

    A small dataset (even a few dozen clips per class) is enough to get a
    working baseline for prototype purposes - this is not meant to be a
    production-grade classifier yet.
    """
    def _collect(files: List[str]) -> np.ndarray:
        all_feats = []
        for f in files:
            audio_np, _ = librosa.load(f, sr=16000, mono=True)
            waveform = torch.from_numpy(audio_np)
            fitted = _fit_to_window(waveform)
            feats = _extract_lfcc(fitted)
            all_feats.append(feats)
        return np.vstack(all_feats)

    from sklearn.mixture import GaussianMixture

    bonafide_feats = _collect(bonafide_files)
    replay_feats = _collect(replay_files)

    gmm_bonafide = GaussianMixture(
        n_components=n_components, covariance_type="diag", random_state=42
    ).fit(bonafide_feats)

    gmm_replay = GaussianMixture(
        n_components=n_components, covariance_type="diag", random_state=42
    ).fit(replay_feats)

    path = save_path or _MODEL_PATH
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as f:
        pickle.dump({"gmm_bonafide": gmm_bonafide, "gmm_replay": gmm_replay}, f)

    print(f"Trained and saved replay-detection model to {path}")
