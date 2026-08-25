"""
BharatVoiceGuard — FastAPI Application
========================================
Single endpoint that accepts an audio file upload and runs the full
5-stage ML pipeline to produce a unified voice-fraud risk assessment.

Usage:
    cd ml-pipeline
    uvicorn app:app --host 0.0.0.0 --port 8000 --reload

Then POST an audio file:
    curl -X POST http://localhost:8000/analyze \
         -F "audio=@testing_audio_files/bonafide/bonafide_01.wav"
"""

import os
import tempfile
import traceback
from typing import List, Optional

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ---------------------------------------------------------------------------
# Stage imports — all from the stages/ package
# ---------------------------------------------------------------------------
from stages.audio_io import load_audio_file
from stages.speaker_verification import verify_speaker
from stages.synthetic_voice_detection import detect_synthetic_voice
from stages.replay_detection import detect_replay
from stages.streaming_asr import transcribe_chunk
from stages.scam_intent_detection import detect_scam_intent_from_asr_result
from stages.risk_fusion import fuse_risk

# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
app = FastAPI(
    title="BharatVoiceGuard API",
    description="AI-powered voice fraud detection and risk assessment",
    version="1.0.0",
)

# Allow CORS for the React client
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Response model
# ---------------------------------------------------------------------------
class AnalysisResponse(BaseModel):
    risk_level: str
    risk_score: int
    voice_authenticity: float
    speaker_match: Optional[float]
    transcript: str
    intent: List[str]
    reasons: List[str]
    recommendation: str


# ---------------------------------------------------------------------------
# Helpers — map raw stage outputs into the user-facing response format
# ---------------------------------------------------------------------------

# Map verbose scam category labels → short intent tags
_INTENT_MAP = {
    "urgently requesting money or a bank transfer": "MONEY_REQUEST",
    "asking for an OTP or verification code": "OTP_REQUEST",
    "claiming to be a bank, government, or police official": "IMPERSONATION",
    "creating urgency or pressure to act immediately": "URGENCY",
    "threatening the listener": "THREAT",
    "asking for KYC, account, or personal banking details": "KYC_REQUEST",
}


def _map_risk_state(state: str) -> str:
    """Map internal risk_state to the API's risk_level enum."""
    mapping = {
        "LOW RISK": "LOW_RISK",
        "VERIFY": "MEDIUM_RISK",
        "HIGH RISK": "HIGH_RISK",
    }
    return mapping.get(state, "MEDIUM_RISK")


def _build_reasons(
    synthetic_result: dict,
    replay_result: dict,
    speaker_result: dict,
    scam_intent_result: dict,
) -> List[str]:
    """Generate human-readable reason strings from all stage outputs."""
    reasons: List[str] = []

    # Synthetic voice
    if synthetic_result.get("is_likely_synthetic"):
        score = synthetic_result["bonafide_score"]
        reasons.append(
            f"Possible synthetic voice (authenticity {score:.0%})"
        )

    # Replay
    if replay_result.get("is_likely_replay"):
        reasons.append("Possible replayed/re-recorded audio detected")

    # Speaker mismatch
    if speaker_result.get("available"):
        if not speaker_result.get("is_match"):
            reasons.append(
                f"Speaker does not match enrolled voice (similarity {speaker_result['similarity']:.0%})"
            )
    else:
        reasons.append("No enrolled voice on file — speaker verification unavailable")

    # Scam intent categories
    if scam_intent_result.get("available"):
        for cat in scam_intent_result.get("flagged_categories", []):
            short = _INTENT_MAP.get(cat, cat)
            reasons.append(f"{short.replace('_', ' ').title()} detected")

    return reasons if reasons else ["No significant risk signals detected"]


def _build_recommendation(risk_level: str) -> str:
    """Return a contextual recommendation based on the final risk level."""
    if risk_level == "HIGH_RISK":
        return "Verify the caller independently. Do NOT share OTPs, passwords, or financial details."
    elif risk_level == "MEDIUM_RISK":
        return "Exercise caution. Ask the caller to verify their identity through a trusted channel."
    else:
        return "Call appears low-risk. Stay alert for any unusual requests."


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/")
async def root():
    return {
        "service": "BharatVoiceGuard API",
        "version": "1.0.0",
        "endpoints": {
            "/analyze": "POST — upload an audio file for voice fraud analysis",
            "/health": "GET — service health check",
            "/docs": "GET — interactive API documentation",
        },
    }


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_audio(audio: UploadFile = File(...)):
    """
    Accept an audio file and run the full BharatVoiceGuard pipeline:
      Stage 1  →  Audio standardization (mono, 16 kHz)
      Stage 2a →  Speaker verification
      Stage 2b →  Synthetic voice detection (AASIST-L)
      Stage 2c →  Replay / audio integrity detection
      Stage 3  →  Speech-to-text (faster-whisper)
      Stage 4  →  Scam-intent NLP analysis
      Stage 5  →  Risk fusion
    """
    # --- Save upload to a temp file so audio_io can load it ----
    suffix = os.path.splitext(audio.filename or "audio.wav")[1] or ".wav"
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    try:
        contents = await audio.read()
        tmp.write(contents)
        tmp.flush()
        tmp.close()

        # ---- Stage 1: load & standardize ----
        waveform = load_audio_file(tmp.name)

        # ---- Stage 2a: speaker verification ----
        # No enrolled voice in this prototype — pass None
        speaker_result = verify_speaker(waveform, enrolled_embedding=None)

        # ---- Stage 2b: synthetic voice detection ----
        synthetic_result = detect_synthetic_voice(waveform)

        # ---- Stage 2c: replay detection ----
        replay_result = detect_replay(waveform)

        # ---- Stage 3: ASR / transcription ----
        asr_result = transcribe_chunk(waveform)

        # ---- Stage 4: scam intent NLP ----
        scam_intent_result = detect_scam_intent_from_asr_result(asr_result)

        # ---- Stage 5: risk fusion ----
        fusion_result = fuse_risk(
            speaker_result=speaker_result,
            synthetic_voice_result=synthetic_result,
            replay_result=replay_result,
            scam_intent_result=scam_intent_result,
        )

        # ---- Build user-facing response ----
        risk_level = _map_risk_state(fusion_result["risk_state"])

        # Map flagged categories → short intent tags
        intent_tags: List[str] = []
        if scam_intent_result.get("available"):
            for cat in scam_intent_result.get("flagged_categories", []):
                tag = _INTENT_MAP.get(cat, cat.upper().replace(" ", "_"))
                intent_tags.append(tag)

        reasons = _build_reasons(
            synthetic_result, replay_result, speaker_result, scam_intent_result
        )

        recommendation = _build_recommendation(risk_level)

        return AnalysisResponse(
            risk_level=risk_level,
            risk_score=int(round(fusion_result["risk_score"])),
            voice_authenticity=round(synthetic_result["bonafide_score"], 2),
            speaker_match=(
                round(speaker_result["similarity"], 2)
                if speaker_result.get("similarity") is not None
                else None
            ),
            transcript=asr_result.get("text", ""),
            intent=intent_tags,
            reasons=reasons,
            recommendation=recommendation,
        )

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

    finally:
        # Clean up temp file
        try:
            os.unlink(tmp.name)
        except OSError:
            pass
