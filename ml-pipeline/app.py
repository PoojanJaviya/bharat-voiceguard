"""
BharatVoiceGuard — FastAPI Application
========================================
Two modes of operation:

1. BATCH:  POST /analyze  — upload a full audio file, get one risk assessment
2. LIVE:   WS   /stream   — send continuous PCM audio chunks over WebSocket,
                             receive real-time risk updates as the call progresses

The live-stream endpoint is how the React/Android client will interact during
an actual phone call:

    [Phone Call] → WebRTC (client captures audio)
                 → WebSocket (sends PCM chunks to this server)
                 → ML Pipeline (all 5 stages)
                 → WebSocket (sends risk JSON back to client)

Usage:
    cd ml-pipeline
    uvicorn app:app --host 0.0.0.0 --port 8000 --reload
"""

import os
import json
import tempfile
import traceback
from typing import List, Optional

import torch
from fastapi import FastAPI, File, UploadFile, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ---------------------------------------------------------------------------
# Stage imports — all from the stages/ package
# ---------------------------------------------------------------------------
from stages.audio_io import load_audio_file, bytes_to_tensor
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


def _build_response_dict(
    fusion_result: dict,
    synthetic_result: dict,
    replay_result: dict,
    speaker_result: dict,
    scam_intent_result: dict,
    transcript: str,
) -> dict:
    """Build the unified risk-assessment dict from all stage outputs."""
    risk_level = _map_risk_state(fusion_result["risk_state"])

    intent_tags: List[str] = []
    if scam_intent_result.get("available"):
        for cat in scam_intent_result.get("flagged_categories", []):
            tag = _INTENT_MAP.get(cat, cat.upper().replace(" ", "_"))
            intent_tags.append(tag)

    reasons = _build_reasons(
        synthetic_result, replay_result, speaker_result, scam_intent_result
    )
    recommendation = _build_recommendation(risk_level)

    return {
        "risk_level": risk_level,
        "risk_score": int(round(fusion_result["risk_score"])),
        "voice_authenticity": round(synthetic_result["bonafide_score"], 2),
        "speaker_match": (
            round(speaker_result["similarity"], 2)
            if speaker_result.get("similarity") is not None
            else None
        ),
        "transcript": transcript,
        "intent": intent_tags,
        "reasons": reasons,
        "recommendation": recommendation,
    }


def _run_full_pipeline(waveform: torch.Tensor, enrolled_embedding=None) -> dict:
    """Run all 5 pipeline stages on a waveform and return the response dict."""
    speaker_result = verify_speaker(waveform, enrolled_embedding=enrolled_embedding)
    synthetic_result = detect_synthetic_voice(waveform)
    replay_result = detect_replay(waveform)
    asr_result = transcribe_chunk(waveform)
    scam_intent_result = detect_scam_intent_from_asr_result(asr_result)

    fusion_result = fuse_risk(
        speaker_result=speaker_result,
        synthetic_voice_result=synthetic_result,
        replay_result=replay_result,
        scam_intent_result=scam_intent_result,
    )

    return _build_response_dict(
        fusion_result=fusion_result,
        synthetic_result=synthetic_result,
        replay_result=replay_result,
        speaker_result=speaker_result,
        scam_intent_result=scam_intent_result,
        transcript=asr_result.get("text", ""),
    )


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/")
async def root():
    return {
        "service": "BharatVoiceGuard API",
        "version": "1.0.0",
        "endpoints": {
            "/analyze": "POST — upload an audio file for batch voice fraud analysis",
            "/stream": "WS — live audio stream for real-time risk assessment",
            "/health": "GET — service health check",
            "/docs": "GET — interactive API documentation",
        },
    }


@app.get("/health")
async def health():
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# BATCH endpoint — POST /analyze
# ---------------------------------------------------------------------------

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
    suffix = os.path.splitext(audio.filename or "audio.wav")[1] or ".wav"
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    try:
        contents = await audio.read()
        tmp.write(contents)
        tmp.flush()
        tmp.close()

        waveform = load_audio_file(tmp.name)
        result = _run_full_pipeline(waveform)
        return AnalysisResponse(**result)

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
    finally:
        try:
            os.unlink(tmp.name)
        except OSError:
            pass


# ---------------------------------------------------------------------------
# LIVE STREAM endpoint — WS /stream
# ---------------------------------------------------------------------------
#
# Protocol:
#   1. Client connects to  ws://host:8000/stream
#   2. Client can optionally send a JSON config message first:
#        {"sample_rate": 16000, "channels": 1, "enrolled_voice": null}
#      If skipped, defaults are used (16kHz, mono, no enrolled voice).
#   3. Client sends raw PCM audio as binary WebSocket frames.
#      Format: 16-bit signed integers (int16), mono, at the configured
#      sample rate. This is what WebRTC's MediaRecorder / AudioWorklet
#      typically outputs.
#   4. Server accumulates audio. Every ANALYSIS_WINDOW_SEC seconds of
#      audio, it runs the full pipeline and sends back a JSON risk
#      assessment — same format as POST /analyze.
#   5. Connection stays open until the client disconnects (call ends).
#
# The client keeps receiving updated risk assessments as the call
# progresses, with the transcript building up over time.
# ---------------------------------------------------------------------------

ANALYSIS_WINDOW_SEC = 4.0    # run analysis every ~4s of new audio
                              # (matches AASIST-L's 64600-sample requirement)
ANALYSIS_WINDOW_SAMPLES = int(ANALYSIS_WINDOW_SEC * 16000)


@app.websocket("/stream")
async def stream_audio(ws: WebSocket):
    await ws.accept()

    # ---- Per-connection state ----
    audio_buffer = torch.zeros(0)        # accumulates all received audio
    sample_rate = 16000                  # default; can be overridden by config
    channels = 1
    enrolled_embedding = None
    transcript_parts: List[str] = []     # running transcript across the call
    last_analyzed_pos = 0                # sample index up to which we've analyzed
    analysis_count = 0

    try:
        while True:
            data = await ws.receive()

            # --- Handle text messages (config / control) ---
            if "text" in data:
                try:
                    msg = json.loads(data["text"])

                    # Config message
                    if "sample_rate" in msg:
                        sample_rate = msg.get("sample_rate", 16000)
                        channels = msg.get("channels", 1)
                        await ws.send_json({
                            "type": "config_ack",
                            "sample_rate": sample_rate,
                            "channels": channels,
                        })
                        continue

                    # Ping / keepalive
                    if msg.get("type") == "ping":
                        await ws.send_json({"type": "pong"})
                        continue

                    # End-of-call signal — run final analysis on remaining audio
                    if msg.get("type") == "end":
                        remaining = audio_buffer[last_analyzed_pos:]
                        if remaining.shape[0] >= 8000:  # at least 0.5s
                            result = _analyze_stream_window(
                                remaining, transcript_parts, enrolled_embedding
                            )
                            result["type"] = "final_result"
                            result["analysis_number"] = analysis_count + 1
                            await ws.send_json(result)
                        await ws.close()
                        break

                except json.JSONDecodeError:
                    await ws.send_json({"type": "error", "detail": "Invalid JSON"})
                continue

            # --- Handle binary messages (raw PCM audio) ---
            if "bytes" in data:
                raw_bytes = data["bytes"]
                if not raw_bytes:
                    continue

                # Convert raw PCM bytes → standardized tensor (mono, 16kHz)
                chunk_tensor = bytes_to_tensor(
                    raw_bytes,
                    source_sample_rate=sample_rate,
                    source_channels=channels,
                )
                audio_buffer = torch.cat([audio_buffer, chunk_tensor])

                # Check if we have enough NEW audio since last analysis
                new_samples = audio_buffer.shape[0] - last_analyzed_pos
                if new_samples >= ANALYSIS_WINDOW_SAMPLES:
                    analysis_count += 1

                    # Analyze the latest window of audio
                    # Use the most recent ANALYSIS_WINDOW_SAMPLES for audio
                    # analysis (synthetic/replay detection), but transcribe
                    # only the NEW audio to avoid duplicate transcript text
                    window_start = max(0, audio_buffer.shape[0] - ANALYSIS_WINDOW_SAMPLES)
                    analysis_window = audio_buffer[window_start:]
                    new_audio = audio_buffer[last_analyzed_pos:]

                    result = _analyze_stream_window(
                        analysis_window, transcript_parts,
                        enrolled_embedding, new_audio_for_asr=new_audio,
                    )
                    result["type"] = "risk_update"
                    result["analysis_number"] = analysis_count
                    result["call_duration_sec"] = round(
                        audio_buffer.shape[0] / 16000, 1
                    )

                    await ws.send_json(result)
                    last_analyzed_pos = audio_buffer.shape[0]

    except WebSocketDisconnect:
        pass  # client disconnected — normal end of call
    except Exception as e:
        traceback.print_exc()
        try:
            await ws.send_json({"type": "error", "detail": str(e)})
            await ws.close()
        except Exception:
            pass


def _analyze_stream_window(
    analysis_window: torch.Tensor,
    transcript_parts: List[str],
    enrolled_embedding=None,
    new_audio_for_asr: Optional[torch.Tensor] = None,
) -> dict:
    """
    Run the full pipeline on a window of audio during a live stream.

    - analysis_window: the audio chunk for synthetic/replay/speaker analysis
      (~4s, the most recent window)
    - new_audio_for_asr: if provided, only this portion is transcribed (to
      avoid re-transcribing already-seen audio). If None, analysis_window
      is used for ASR too.
    - transcript_parts: mutable list — new transcript text is appended so
      the full call transcript accumulates across updates.
    """
    # Stage 2a: speaker verification
    speaker_result = verify_speaker(
        analysis_window, enrolled_embedding=enrolled_embedding
    )

    # Stage 2b: synthetic voice detection
    synthetic_result = detect_synthetic_voice(analysis_window)

    # Stage 2c: replay detection
    replay_result = detect_replay(analysis_window)

    # Stage 3: ASR — transcribe only the NEW audio to build incremental transcript
    asr_input = new_audio_for_asr if new_audio_for_asr is not None else analysis_window
    asr_result = transcribe_chunk(asr_input)
    new_text = asr_result.get("text", "").strip()
    if new_text:
        transcript_parts.append(new_text)

    # Stage 4: scam intent — analyze the FULL accumulated transcript
    # (not just the latest chunk) so context builds up over the call
    full_transcript = " ".join(transcript_parts).strip()
    from stages.scam_intent_detection import detect_scam_intent
    scam_intent_result = detect_scam_intent(full_transcript)

    # Stage 5: risk fusion
    fusion_result = fuse_risk(
        speaker_result=speaker_result,
        synthetic_voice_result=synthetic_result,
        replay_result=replay_result,
        scam_intent_result=scam_intent_result,
    )

    return _build_response_dict(
        fusion_result=fusion_result,
        synthetic_result=synthetic_result,
        replay_result=replay_result,
        speaker_result=speaker_result,
        scam_intent_result=scam_intent_result,
        transcript=full_transcript,
    )
