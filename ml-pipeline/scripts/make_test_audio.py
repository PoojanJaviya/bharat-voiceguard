"""
Generates a fake "call" for testing: a few tone bursts (standing in for
speech) separated by silence, at 16kHz mono. This is ONLY for verifying the
pipeline's plumbing works - it is not real speech, so VAD accuracy on this
file doesn't tell you anything about real-world accuracy. Swap this out for
an actual recording (e.g. record yourself on your laptop mic) as soon as you can.
"""
import os
import numpy as np
import soundfile as sf

SAMPLE_RATE = 16000

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(SCRIPT_DIR)


def make_tone_burst(duration_sec, freq=180):
    """A tone with some amplitude variation, roughly mimicking speech's energy envelope."""
    t = np.linspace(0, duration_sec, int(SAMPLE_RATE * duration_sec), endpoint=False)
    envelope = 0.5 + 0.5 * np.sin(2 * np.pi * 3 * t)  # wobble so it's not a flat pure tone
    tone = 0.3 * envelope * np.sin(2 * np.pi * freq * t)
    return tone.astype(np.float32)


def make_silence(duration_sec):
    return np.zeros(int(SAMPLE_RATE * duration_sec), dtype=np.float32)


if __name__ == "__main__":
    audio = np.concatenate([
        make_silence(0.5),
        make_tone_burst(2.0, freq=150),   # "utterance 1"
        make_silence(0.8),
        make_tone_burst(1.2, freq=200),   # "utterance 2"
        make_silence(0.5),
        make_tone_burst(3.0, freq=170),   # "utterance 3"
        make_silence(0.3),
    ])
    # small noise floor so it's not perfectly digital-silent
    audio += np.random.normal(0, 0.002, audio.shape).astype(np.float32)

    out_path = os.path.join(ROOT_DIR, "test_call.wav")
    sf.write(out_path, audio, SAMPLE_RATE)
    print(f"Wrote {out_path} — {len(audio)/SAMPLE_RATE:.2f} seconds")
