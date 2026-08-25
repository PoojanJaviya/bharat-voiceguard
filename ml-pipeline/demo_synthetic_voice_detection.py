"""
Stage 2b demo: Synthetic Voice Detection.

Run from the repo root:
    python scripts/demo_synthetic_voice_detection.py

No internet needed - the AASIST-L weights are bundled in
ml_pipeline/aasist_lib/AASIST-L.pth (MIT licensed, from
github.com/clovaai/aasist).

For a REAL test (not just plumbing verification), point AUDIO_PATH at:
1. A real human speech clip (e.g. the Jiang/Raj Shamani clips from Stage 2a)
   -> expect a HIGH bonafide_score (closer to 1.0)
2. An AI-generated clip, if you have one (e.g. from any free TTS tool)
   -> expect a LOW bonafide_score (closer to 0.0)
"""
import os
from audio_io import load_audio_file
from synthetic_voice_detection import detect_synthetic_voice

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# CHANGE THIS to point at a real speech clip to get a meaningful result
AUDIO_PATH = os.path.join(REPO_ROOT, "ml-pipeline/testing_audio_files", "elvis_presley_ai.wav")

waveform = load_audio_file(AUDIO_PATH)
print(f"Loaded: {AUDIO_PATH}")
print(f"Duration: {len(waveform)/16000:.2f}s")

result = detect_synthetic_voice(waveform)
print()
print(f"Bonafide score:        {result['bonafide_score']:.4f}  (closer to 1.0 = more likely real)")
print(f"Likely synthetic?:     {result['is_likely_synthetic']}")
print(f"Audio actually used:   {result['input_duration_sec']:.2f}s (model always uses ~4.04s)")

# from audio_io import load_audio_file
from synthetic_voice_detection import detect_synthetic_voice_multi_window

waveform = load_audio_file("testing_audio_files/ai_gen_voice1.wav")
result = detect_synthetic_voice_multi_window(waveform)
print(result)