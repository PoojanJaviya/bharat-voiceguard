"""
train_replay_from_folders.py
-------------------------------------------------
One-time setup script - trains replay_detection.py's model using your
self-recorded bonafide/ and recorded/ folders (testing_audio_files/), no
external dataset needed.

USAGE:
    cd ml-pipeline
    python scripts/train_replay_from_folders.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import glob
from stages.replay_detection import train_replay_model

# --------------------------------------------------------------------------- #
# CONFIG - update these if your folder structure differs
# --------------------------------------------------------------------------- #

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BONAFIDE_DIR = os.path.join(ROOT_DIR, "testing_audio_files", "bonafide")
REPLAY_DIR = os.path.join(ROOT_DIR, "testing_audio_files", "recorded")


def main():
    bonafide_files = sorted(glob.glob(os.path.join(BONAFIDE_DIR, "*.wav")))
    replay_files = sorted(glob.glob(os.path.join(REPLAY_DIR, "*.wav")))

    if not bonafide_files:
        raise FileNotFoundError(f"No .wav files found in {BONAFIDE_DIR}")
    if not replay_files:
        raise FileNotFoundError(f"No .wav files found in {REPLAY_DIR}")

    print(f"Found {len(bonafide_files)} bonafide files and {len(replay_files)} replay files.")
    print("Training replay detection model...")

    train_replay_model(bonafide_files=bonafide_files, replay_files=replay_files)

    print("Done. detect_replay() in stages/replay_detection.py is now ready to use.")


if __name__ == "__main__":
    main()
