#!/bin/bash
# cleanup_old_files.sh
# Run this from ml-pipeline/ to remove the old root-level Python files
# that have been moved to stages/, scripts/, and tests/

echo "Removing old root-level stage modules (now in stages/)..."
rm -f audio_io.py vad.py chunker.py speaker_verification.py
rm -f synthetic_voice_detection.py replay_detection.py
rm -f streaming_asr.py scam_intent_detection.py risk_fusion.py

echo "Removing old demo scripts (now in scripts/)..."
rm -f demo_risk_fusion.py demo_scam_intent.py demo_speaker_verification.py
rm -f demo_stage1.py demo_streaming_asr.py demo_synthetic_voice_detection.py
rm -f make_test_audio.py train_replay_from_folders.py

echo "Removing old test scripts (now in tests/)..."
rm -f stage2_test.py test_streaming.py

echo "Removing old __pycache__..."
rm -rf __pycache__

echo "Done! New structure:"
echo "  stages/    - core pipeline modules"
echo "  scripts/   - demo & training scripts"
echo "  tests/     - test scripts"
echo "  app.py     - FastAPI endpoint"
