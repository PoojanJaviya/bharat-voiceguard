"""
Stage 1 end-to-end demo: file -> standardized waveform -> VAD -> chunks.
Run this to see the full flow and understand what data is passed at each step.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from stages.audio_io import load_audio_file
from stages.vad import detect_speech_segments
from stages.chunker import chunk_waveform

AUDIO_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "ml-pipeline", "test_call.wav")

print("=" * 60)
print("STEP 1: Load + standardize audio")
print("=" * 60)
waveform = load_audio_file(AUDIO_PATH)
print(f"Waveform shape: {waveform.shape}  (i.e. {len(waveform)} samples)")
print(f"Duration: {len(waveform) / 16000:.2f} seconds")
print(f"Value range: [{waveform.min():.3f}, {waveform.max():.3f}]  (should be within [-1, 1])")

print()
print("=" * 60)
print("STEP 2: Voice Activity Detection")
print("=" * 60)
segments = detect_speech_segments(waveform)
if not segments:
    print("No speech segments detected.")
else:
    for i, seg in enumerate(segments):
        print(f"  Segment {i+1}: {seg['start']:.2f}s -> {seg['end']:.2f}s  "
              f"(duration {seg['end']-seg['start']:.2f}s)")

print()
print("=" * 60)
print("STEP 3: Sliding window chunking (1.5s windows, 0.5s step)")
print("=" * 60)
chunks = chunk_waveform(waveform, window_sec=1.5, step_sec=0.5)
print(f"Total chunks produced: {len(chunks)}")
for i, c in enumerate(chunks):
    print(f"  Chunk {i+1}: {c['start_time']:.2f}s -> {c['end_time']:.2f}s  "
          f"| audio tensor shape: {tuple(c['audio'].shape)}")

print()
print("Each chunk above is exactly what gets handed to Stage 2 next:")
print("speaker verification, synthetic voice detection, and ASR.")
