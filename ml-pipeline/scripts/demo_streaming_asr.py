import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from stages.streaming_asr import transcribe_file
result = transcribe_file("testing_audio_files/raj.wav")
print(result["text"])
