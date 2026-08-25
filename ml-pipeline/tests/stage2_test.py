import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from stages.audio_io import load_audio_file
from stages.speaker_verification import get_embedding, compare_embeddings

me1 = get_embedding(load_audio_file("jiang.wav"))
me2 = get_embedding(load_audio_file("jiang2.wav"))
other = get_embedding(load_audio_file("raj.wav"))

print("me vs me:", compare_embeddings(me1, me2))       # expect high, e.g. 0.6-0.9+
print("me vs other:", compare_embeddings(me1, other))  # expect noticeably lower
