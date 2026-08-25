"""
Simulates a live call: feeds audio in small 0.2s pieces (like a WebRTC stream
would) instead of loading the whole file at once, and shows chunks appearing
as soon as they're ready.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from stages.audio_io import load_audio_file
from stages.chunker import StreamingChunker

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
waveform = load_audio_file(os.path.join(ROOT_DIR, "ml-pipeline", "test_call.wav"))

streamer = StreamingChunker(window_sec=1.5, step_sec=0.5)
piece_size = int(0.2 * 16000)  # simulate audio arriving in 0.2s pieces

total_chunks_yielded = 0
for i in range(0, len(waveform), piece_size):
    piece = waveform[i:i + piece_size]
    ready = streamer.push(piece)
    for chunk in ready:
        total_chunks_yielded += 1
        print(f"[LIVE] Chunk ready: {chunk['start_time']:.2f}s -> {chunk['end_time']:.2f}s "
              f"(would be sent to Stage 2 right now, mid-call)")

print(f"\nTotal chunks yielded during simulated live stream: {total_chunks_yielded}")
