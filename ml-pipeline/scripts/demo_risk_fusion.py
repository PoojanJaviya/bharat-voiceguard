import sys
import os

# Add ml-pipeline root to path so stages/ imports work
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import torch
import librosa

from stages.speaker_verification import verify_speaker, get_embedding
from stages.synthetic_voice_detection import detect_synthetic_voice
from stages.replay_detection import detect_replay
from stages.scam_intent_detection import detect_scam_intent_from_asr_result
from stages.streaming_asr import transcribe_chunk
from stages.risk_fusion import fuse_risk

# Load a real audio file into a waveform tensor (mono, 16kHz)
audio_np, sr = librosa.load("testing_audio_files/bonafide/bonafide_01.wav", sr=16000, mono=True)
chunk = torch.from_numpy(audio_np)

# If you have an enrolled voice to compare against, load and embed it too.
# Otherwise pass enrolled_embedding=None (speaker check will show "unavailable").
enrolled_embedding = None
# enrolled_embedding = get_embedding(some_other_waveform)

result = fuse_risk(
    speaker_result=verify_speaker(chunk, enrolled_embedding),
    synthetic_voice_result=detect_synthetic_voice(chunk),
    replay_result=detect_replay(chunk),
    scam_intent_result=detect_scam_intent_from_asr_result(transcribe_chunk(chunk)),
)

print(result["risk_score"], result["risk_state"])
print(result["contributing_signals"])
print(result["unavailable_signals"])
