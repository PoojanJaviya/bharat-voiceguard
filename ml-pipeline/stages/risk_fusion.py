"""
Stage 5: Risk Fusion Engine
-------------------------------------------------
GOAL: combine the outputs of all four detection stages into ONE
interpretable risk score (0-100) and a final state: LOW RISK, VERIFY, or
HIGH RISK - this is what the user actually sees, per your architecture
doc's core principle "Detect != Decide": this stage does not claim to know
whether a call is a scam. It surfaces uncertainty and risk signals so the
human can decide what to do next.

INPUTS - this stage does not run any models itself. It takes the already-
computed outputs from the four earlier stages and combines them:
    - speaker verification result   (from speaker_verification.py)
    - synthetic voice result        (from synthetic_voice_detection.py)
    - replay/integrity result       (from replay_detection.py)
    - scam intent result            (from scam_intent_detection.py)

HOW COMBINING WORKS (concept) - WEIGHTED SCORING:
Per your architecture doc (section 8), the plan for the prototype is
"Weighted scoring initially; XGBoost/LightGBM later." Weighted scoring
means: each signal contributes some amount of "risk points" to a running
total, and some signals matter more than others (their weight is bigger).
This is simple, fully explainable (you can always say exactly why a call
got its score - important for the "explains the risk" part of your product
principle), and needs no training data - unlike XGBoost, which would need
a labeled dataset of real scam/genuine calls you don't have yet.

HANDLING MISSING SIGNALS (important, matches earlier stages' philosophy):
Two of the four signals can be legitimately UNAVAILABLE, not just
"negative":
    - speaker verification: unavailable if no trusted voice is enrolled
      for this caller (see speaker_verification.py's "available": False)
    - scam intent: unavailable if there's no transcript yet (e.g. call
      just started, or a silent chunk)
A missing signal must NOT be silently treated as "safe" or "risky" - it
simply doesn't contribute to the score. This mirrors how
speaker_verification.py and scam_intent_detection.py already both
represent "no signal" explicitly with "available": False, rather than
guessing.

WEIGHTS AND THRESHOLDS ARE ILLUSTRATIVE / PROTOTYPE-STAGE:
Per your handoff doc (section 15, "Slide 3 decisions": "Mark numerical
risk thresholds as prototype/illustrative until calibrated"), the specific
numbers below are a reasonable starting point, not a tuned/validated
result - you don't have labeled real-call data yet to calibrate them
properly. Treat them as a first working version to demo and iterate on,
same spirit as the LFCC-GMM baseline in replay_detection.py.
"""

from typing import Dict, Optional

# --------------------------------------------------------------------------- #
# Weights: how many risk points each signal can contribute at its most
# suspicious. These are illustrative starting values (see note above) -
# scam intent is weighted highest since directly-stated scam language
# (e.g. "share the OTP now") is often the single strongest indicator,
# per your doc's point that a human-voiced scam call still needs to be
# caught by semantic analysis, not just audio authenticity.
# --------------------------------------------------------------------------- #

WEIGHTS = {
    "synthetic_voice": 30,
    "replay": 20,
    "speaker_mismatch": 20,
    "scam_intent": 30,
}

# Risk score thresholds -> final state. Illustrative/prototype, per the
# doc's instruction to mark these as such until calibrated on real data.
LOW_RISK_MAX = 30
VERIFY_MAX = 60
# anything above VERIFY_MAX -> HIGH RISK


def fuse_risk(
    speaker_result: Optional[Dict] = None,
    synthetic_voice_result: Optional[Dict] = None,
    replay_result: Optional[Dict] = None,
    scam_intent_result: Optional[Dict] = None,
) -> Dict:
    """
    Main entry point - call this with the outputs of the four earlier
    stages (any of them can be omitted/None if that stage hasn't run yet
    for this call, e.g. right at call start before any transcript exists).

    Returns:
        {
            "risk_score": float,          # 0-100, higher = more suspicious
            "risk_state": str,             # "LOW RISK" | "VERIFY" | "HIGH RISK"
            "contributing_signals": {      # which signals actually counted
                                            # toward the score, and how much
                                            # each contributed - this is what
                                            # lets the app SHOW the user why
                                            # a call got its score, per the
                                            # "explains the risk" principle
                str: float, ...
            },
            "unavailable_signals": [str, ...],  # signals that couldn't be
                                                   # computed (e.g. no
                                                   # enrolled voice, no
                                                   # transcript yet) - shown
                                                   # so the app/demo can be
                                                   # honest about what it
                                                   # doesn't know, matching
                                                   # "Detect != Decide"
        }
    """
    points = 0.0
    max_possible = 0.0
    contributing: Dict[str, float] = {}
    unavailable = []

    # ---- Synthetic voice signal ----
    if synthetic_voice_result is not None:
        max_possible += WEIGHTS["synthetic_voice"]
        # bonafide_score: higher = more human/genuine, so risk contribution
        # is the INVERSE - (1 - bonafide_score) - scaled by this signal's weight
        contribution = (1 - synthetic_voice_result["bonafide_score"]) * WEIGHTS["synthetic_voice"]
        points += contribution
        contributing["synthetic_voice"] = round(contribution, 1)
    else:
        unavailable.append("synthetic_voice")

    # ---- Replay/integrity signal ----
    if replay_result is not None:
        max_possible += WEIGHTS["replay"]
        contribution = (1 - replay_result["bonafide_score"]) * WEIGHTS["replay"]
        points += contribution
        contributing["replay"] = round(contribution, 1)
    else:
        unavailable.append("replay")

    # ---- Speaker verification signal ----
    # Only contributes if a trusted voice was actually enrolled for this
    # caller (available=True) - per speaker_verification.py's design, an
    # unavailable speaker check must not be treated as suspicious OR safe.
    if speaker_result is not None and speaker_result.get("available"):
        max_possible += WEIGHTS["speaker_mismatch"]
        similarity = speaker_result["similarity"]
        # similarity close to 1.0 = strong match = low risk contribution;
        # similarity close to 0 (or below match threshold) = high risk
        # contribution. Clamp to [0, 1] since cosine similarity can rarely
        # dip slightly negative.
        mismatch_amount = 1 - max(0.0, min(1.0, similarity))
        contribution = mismatch_amount * WEIGHTS["speaker_mismatch"]
        points += contribution
        contributing["speaker_mismatch"] = round(contribution, 1)
    else:
        unavailable.append("speaker_verification")

    # ---- Scam intent signal ----
    if scam_intent_result is not None and scam_intent_result.get("available"):
        max_possible += WEIGHTS["scam_intent"]
        # top_score: how strongly the transcript matched its single most
        # suspicious category (0-1) - used directly as the risk fraction
        # for this signal, since even ONE strongly-matched category (e.g.
        # "asking for an OTP") is meaningful regardless of the others.
        contribution = scam_intent_result["top_score"] * WEIGHTS["scam_intent"]
        points += contribution
        contributing["scam_intent"] = round(contribution, 1)
    else:
        unavailable.append("scam_intent")

    # ---- Normalize to 0-100 ----
    # If some signals are unavailable, max_possible shrinks accordingly, so
    # the score is always scaled against only the signals that actually
    # contributed - a call with only 2 of 4 signals available isn't
    # unfairly capped low just because two stages had nothing to say.
    if max_possible == 0:
        # No signals available at all (e.g. very start of a call) - can't
        # meaningfully score yet. Score of 0 with an explicit "VERIFY" state
        # rather than falsely claiming "LOW RISK" with no evidence.
        risk_score = 0.0
        risk_state = "VERIFY"
    else:
        risk_score = (points / max_possible) * 100
        if risk_score <= LOW_RISK_MAX:
            risk_state = "LOW RISK"
        elif risk_score <= VERIFY_MAX:
            risk_state = "VERIFY"
        else:
            risk_state = "HIGH RISK"

    return {
        "risk_score": round(risk_score, 1),
        "risk_state": risk_state,
        "contributing_signals": contributing,
        "unavailable_signals": unavailable,
    }
