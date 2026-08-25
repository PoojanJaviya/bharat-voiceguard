"""
Stage 2b demo: Synthetic Voice Detection.

Run from ml-pipeline/:
    python scripts/demo_synthetic_voice_detection.py

No internet needed - the AASIST-L weights are bundled in
aasist_lib/AASIST-L.pth (MIT licensed, from github.com/clovaai/aasist).
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from stages.audio_io import load_audio_file
from stages.synthetic_voice_detection import detect_synthetic_voice, detect_synthetic_voice_multi_window

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUDIO_PATH = os.path.join(REPO_ROOT, "ml-pipeline/testing_audio_files", "elvis_presley_ai.wav")

waveform = load_audio_file(AUDIO_PATH)
print(f"Loaded: {AUDIO_PATH}")
print(f"Duration: {len(waveform)/16000:.2f}s")

result = detect_synthetic_voice(waveform)
print()
print(f"Bonafide score:        {result['bonafide_score']:.4f}  (closer to 1.0 = more likely real)")
print(f"Likely synthetic?:     {result['is_likely_synthetic']}")
print(f"Audio actually used:   {result['input_duration_sec']:.2f}s (model always uses ~4.04s)")

waveform = load_audio_file("testing_audio_files/ai_gen_voice1.wav")
result = detect_synthetic_voice_multi_window(waveform)
print(result)
