# BharatVoiceGuard

## Multilingual AI-Powered Voice Fraud Protection

BharatVoiceGuard is a privacy-first, near-real-time voice fraud
detection and risk assessment system designed to protect users from
AI-generated voice impersonation, replay attacks, and social-engineering
scams during phone conversations.

## Problem

Generative AI enables highly realistic voice cloning, allowing attackers
to impersonate family members, officials, bank representatives, and
other trusted individuals.

Traditional caller ID and voice familiarity are no longer sufficient
for reliable verification.

## Proposed Solution

BharatVoiceGuard analyzes live call audio and conversation context using
multiple AI layers:

- Speaker verification
- Synthetic/AI-generated voice detection
- Replay/audio integrity detection
- Streaming speech-to-text
- Multilingual scam-intent analysis
- Context-aware risk scoring
- User warnings and verification guidance

## Key Features

- Near-real-time voice analysis
- Hindi, Gujarati and English support in the MVP
- Voice + conversation + contextual risk analysis
- Risk score instead of a binary scam/not-scam verdict
- Privacy-first processing
- Designed for low-compute/edge deployment
- Verification-oriented user guidance

## System Architecture

<img width="1224" height="1285" alt="image" src="https://github.com/user-attachments/assets/f8cc6a52-c8bd-437e-8a5f-9885f7b60a76" />

## Technology Stack

- Python
- PyTorch
- FastAPI
- WebSocket
- Whisper / streaming ASR
- Speaker verification model
- Audio anti-spoofing model
- Multilingual NLP
- Android / Web-based prototype

## Project Status

🚧 Prototype under development.

## Team

Caffiene Crew

## Future Scope

- Expanded Indian-language support
- On-device inference
- Telecom/edge deployment
- Feature-phone/IVR integration
- Banking and payment-risk integration
