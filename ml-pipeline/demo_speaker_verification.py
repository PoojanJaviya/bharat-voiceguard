"""
Stage 2a demo: Speaker Verification.

Run from the repo root:
    python scripts/demo_speaker_verification.py

First run will download the pretrained ECAPA-TDNN model (~80MB) into
pretrained_models/ecapa/ - this needs normal internet access. Every run
after that loads instantly from the local cache.
"""
import os
import torch

from audio_io import load_audio_file
from speaker_verification import get_embedding, compare_embeddings, verify_speaker

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUDIO_PATH = os.path.join(REPO_ROOT, "ml-pipeline", "test_call.wav")

print("Loading test audio...")
waveform = load_audio_file(AUDIO_PATH)

print("Computing speaker embedding (this triggers the model download on first run)...")
embedding = get_embedding(waveform)
print(f"Embedding shape: {tuple(embedding.shape)}  (should be (192,))")

print()
print("--- Test 1: comparing the SAME clip's embedding to itself ---")
self_similarity = compare_embeddings(embedding, embedding)
print(f"Similarity: {self_similarity:.4f}  (should be exactly 1.0 - same audio, same embedding)")

print()
print("--- Test 2: full verify_speaker() call, simulating an 'enrolled' voice ---")
# In real use, `embedding` here would be loaded from a stored enrollment
# (e.g. a .pt file saved when the user first registered a trusted contact's voice)
result = verify_speaker(waveform, enrolled_embedding=embedding, threshold=0.5)
print(f"Result: {result}")

print()
print("--- Test 3: no enrolled voice available (e.g. unknown caller) ---")
result_no_enroll = verify_speaker(waveform, enrolled_embedding=None)
print(f"Result: {result_no_enroll}")

print()
print("NOTE: Test 1 and 2 use the SAME audio clip compared to itself, so a")
print("similarity near 1.0 is expected and doesn't prove real-world accuracy.")
print("Next real step: record two short clips of yourself + one of someone")
print("else, and compare 'self vs self' against 'self vs other'.")