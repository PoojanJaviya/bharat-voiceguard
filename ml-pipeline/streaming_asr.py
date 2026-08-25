"""
Stage 3: Streaming ASR (Speech-to-Text)
-------------------------------------------------
GOAL: given a chunk of audio, convert it into TEXT - the transcript of what
was said. This text is what Stage 4 (Scam Intent / NLP Analysis) will
scan for money requests, OTP requests, urgency, threats, impersonation
language, etc. Without this stage, none of the semantic/NLP analysis in
your architecture doc is possible - it all depends on having text first.

We use faster-whisper, a reimplementation of OpenAI's Whisper model built
on CTranslate2 - it's meaningfully faster and lighter on CPU than the
original Whisper implementation, which matters a lot since you're running
this on a laptop CPU with no GPU (per your architecture doc, "Whisper /
faster-whisper" was already the planned choice).

MODEL SIZE TRADEOFF (CPU-only, matters more here than for your other
stages, since Whisper models are heavier than AASIST-L or ECAPA-TDNN):
    tiny   - fastest, least accurate, ~75MB
    base   - good balance for a CPU prototype demo, ~145MB   <- default here
    small  - noticeably slower on CPU, better accuracy, ~500MB
    medium/large - not realistic for real-time on a laptop CPU
We default to "base" as a reasonable prototype tradeoff. If transcription
quality on Hindi/Gujarati/code-switched speech looks poor in testing, try
"small" and see if the slower speed is still acceptable for your demo.

WINDOW SIZE NOTE - this stage is DIFFERENT from Stage 2b/2c:
Unlike AASIST-L or the replay detector, ASR does NOT want a fixed ~4s
window shared with those stages. Whisper transcribes better when given
audio with clear utterance boundaries (natural pauses), and very short
windows tend to cut words in half at the edges, producing garbled partial
words. Because of this, streaming_asr.py accepts audio of ANY length you
give it (whatever your Stage 5 buffering logic decides is a good chunk -
e.g. accumulate 3-6 seconds of speech, or accumulate until a pause is
detected via Stage 1's VAD). This is a deliberate difference from Stage
2b/2c's fixed-window approach, not an inconsistency - each stage uses
whatever window size actually suits the question it's answering, exactly
like the architecture doc's reasoning for why Stage 1 and Stage 2b/2c use
different window sizes.

LANGUAGE NOTE:
Your MVP scope is Hindi, Gujarati, and English/code-switching. Whisper
supports both Hindi and Gujarati, but code-switching (mixing languages
mid-sentence, common in real Indian speech) is a known hard case for
Whisper - transcription quality may be inconsistent here. We default to
NOT forcing a language (auto-detect per chunk), since forcing one language
would likely produce worse results on code-switched audio. This is flagged
as a real limitation to test with real sample audio, not something this
module can fully solve alone.
"""

import os
from typing import Dict, List, Optional
import torch

MODEL_SIZE = "base"  # tradeoff explained above - change to "tiny" for more speed,
                       # "small" for more accuracy, if needed after testing

_model = None  # loaded once, reused across calls (same lazy-loading pattern as other stages)


def _get_model():
    """
    Lazily loads the faster-whisper model. First call downloads and caches
    the model weights locally (similar to how speaker_verification.py's
    ECAPA-TDNN model downloads and caches on first use). Subsequent calls
    reuse the already-loaded model in memory.

    compute_type="int8" quantizes the model to 8-bit integers instead of
    32-bit floats - this roughly halves memory use and speeds up CPU
    inference, at a small (usually acceptable for a prototype) cost to
    accuracy. This matters a lot here since you're CPU-only.
    """
    global _model
    if _model is None:
        from faster_whisper import WhisperModel
        _model = WhisperModel(MODEL_SIZE, device="cpu", compute_type="int8")
    return _model


def transcribe_chunk(
    waveform: torch.Tensor,
    sr: int = 16000,
    language: Optional[str] = None,
) -> Dict:
    """
    Main entry point Stage 5 (Risk Fusion) / Stage 4 (Scam Intent) will call.

    Input:
        waveform: mono 16kHz audio, ANY length (see window size note above -
                  unlike Stage 2b/2c, don't force this to a fixed 4s window;
                  give it a natural utterance-sized chunk instead, e.g. 3-6s
                  or VAD-delimited speech).
        language: optional ISO code ("hi", "gu", "en") to force a specific
                  language. Leave as None (default) to let Whisper
                  auto-detect per chunk - safer default for code-switched
                  speech, per the language note above.

    Returns:
        {
            "text": str,                # the transcribed text
            "detected_language": str,   # language Whisper guessed (or forced language)
            "language_probability": float,  # how confident Whisper is in that guess
            "segments": [                # word/phrase-level timing, useful later
                {"start": float, "end": float, "text": str}, ...
            ],
            "input_duration_sec": float,
        }
    """
    model = _get_model()

    audio_np = waveform.numpy() if isinstance(waveform, torch.Tensor) else waveform
    duration_sec = len(audio_np) / sr

    segments_iter, info = model.transcribe(
        audio_np,
        language=language,   # None = auto-detect
        beam_size=5,          # standard default; lower (e.g. 1) = faster but less accurate,
                                # worth trying if CPU speed becomes a problem during the demo
        vad_filter=True,     # skips silent stretches within the chunk - helps avoid
                                # hallucinated text on near-silent audio
    )

    segments: List[Dict] = []
    full_text_parts: List[str] = []
    for seg in segments_iter:
        segments.append({"start": seg.start, "end": seg.end, "text": seg.text.strip()})
        full_text_parts.append(seg.text.strip())

    return {
        "text": " ".join(full_text_parts).strip(),
        "detected_language": info.language,
        "language_probability": info.language_probability,
        "segments": segments,
        "input_duration_sec": duration_sec,
    }


def transcribe_file(path: str, language: Optional[str] = None) -> Dict:
    """
    Convenience wrapper for testing directly on a .wav file, matching how
    you've been testing your other stages against files in
    testing_audio_files/ - avoids having to manually load + convert to a
    tensor every time during quick manual testing.
    """
    import librosa
    audio_np, _ = librosa.load(path, sr=16000, mono=True)
    waveform = torch.from_numpy(audio_np)
    return transcribe_chunk(waveform, language=language)


if __name__ == "__main__":
    print(
        "streaming_asr.py loaded.\n"
        "Quick test example:\n"
        "  from streaming_asr import transcribe_file\n"
        "  result = transcribe_file('testing_audio_files/raj.wav')\n"
        "  print(result['text'])\n"
        "\n"
        "First run will download the faster-whisper 'base' model - needs "
        "internet access once, then it's cached locally."
    )