"""
Stage 4: Scam Intent / NLP Analysis
-------------------------------------------------
GOAL: given the TEXT transcript from Stage 3 (streaming_asr.py), estimate
whether what was SAID contains scam-related intent - money requests, OTP
requests, impersonation claims, urgency/pressure tactics, threats, or
KYC/bank-related claims. This is the stage that reads MEANING, as opposed
to Stage 2b/2c which analyze the raw audio signal itself.

WHY THIS MATTERS ON ITS OWN (per your architecture doc):
A call can use a completely real, unmodified human voice (passes Stage 2b
and 2c both as "bonafide") and still be a scam - e.g. a human scammer, not
an AI clone, directly asking for an OTP or claiming to be from the bank.
This stage is what catches THAT case - it's the only stage that can, since
none of the audio-signal stages would flag it.

HOW IT WORKS (concept) - ZERO-SHOT CLASSIFICATION:
Unlike Stage 2c (replay detection), which needed you to train a model from
scratch on your own labeled data, this stage uses a technique called
ZERO-SHOT classification - meaning it uses an already-pretrained model
without needing ANY of your own training data or a training step at all.

Specifically, we use a multilingual NLI (Natural Language Inference) model
- a model trained to judge whether a piece of text logically "entails" a
given statement. Zero-shot classification repurposes this: instead of
"does this sentence entail this other sentence," we ask "does this
transcript entail the statement 'this text is about urgently requesting
money'" for each candidate scam category. The model returns a probability
per category - no training needed, works directly out of the box on
Hindi/Gujarati/English/code-switched text since the base model was trained
on 100 languages including Hindi and Gujarati.

This directly matches your architecture doc's candidate technology
("XLM-RoBERTa or similar multilingual classifier") - the specific
checkpoint here (joeddav/xlm-roberta-large-xnli) is a version of
XLM-RoBERTa fine-tuned for exactly this zero-shot NLI use case.

LIMITATION (be upfront about this): zero-shot is a strong, fast way to get
a working prototype with zero labeled data, but it's less accurate than a
model specifically fine-tuned on real scam-call transcripts would be.
Treat this as a solid baseline signal for Stage 5's risk fusion, not a
guaranteed-accurate classifier - the same "prototype baseline, not final
answer" caveat as replay_detection.py's LFCC-GMM approach.
"""

from typing import Dict, List, Optional

MODEL_NAME = "MoritzLaurer/mDeBERTa-v3-base-mnli-xnli"  # multilingual (100+ languages incl.
                                                          # Hindi, Gujarati, English), zero-shot
                                                          # capable, ~280M params - much lighter
                                                          # than xlm-roberta-large (~560M) while
                                                          # still being trained for the same
                                                          # zero-shot NLI task. Swapped in for
                                                          # CPU-only speed, per your call.

# The scam-related categories we check for, per your architecture doc's
# list: money requests, OTP requests, impersonation, urgency, threats,
# KYC/bank claims. Phrased as short natural-language labels since the
# zero-shot model works by comparing the transcript against these labels.
SCAM_CATEGORIES = [
    "urgently requesting money or a bank transfer",
    "asking for an OTP or verification code",
    "claiming to be a bank, government, or police official",
    "creating urgency or pressure to act immediately",
    "threatening the listener",
    "asking for KYC, account, or personal banking details",
]

_classifier = None  # loaded once, reused across calls (same lazy-loading pattern as other stages)


def _get_classifier():
    """
    Lazily loads the zero-shot classification pipeline. First call
    downloads the pretrained checkpoint from HuggingFace (similar to how
    speaker_verification.py's ECAPA-TDNN model downloads on first use) and
    caches it locally. Subsequent calls reuse the already-loaded model.

    NOTE: mDeBERTa-v3-base is noticeably lighter than the xlm-roberta-large
    variant (~280M vs ~560M params) while still being trained for the same
    zero-shot NLI task and still covering Hindi/Gujarati/English - a better
    fit for your CPU-only laptop.
    """
    global _classifier
    if _classifier is None:
        from transformers import pipeline
        _classifier = pipeline("zero-shot-classification", model=MODEL_NAME, device=-1)
        # device=-1 = CPU, matching streaming_asr.py's device="cpu" choice
    return _classifier


def detect_scam_intent(text: str, threshold: float = 0.5) -> Dict:
    """
    Main entry point Stage 5 (Risk Fusion) will call.

    Input:
        text: transcript text, e.g. the "text" field from
              streaming_asr.py's transcribe_chunk() output. Empty or
              near-empty text (e.g. a silent chunk) is handled explicitly
              below rather than sent to the model.
        threshold: score above which a category counts as "flagged" -
                   0.5 is a reasonable starting point; may need tuning
                   once you see real results, same as speaker_verification's
                   tunable similarity threshold.

    Returns:
        {
            "available": bool,          # False if text was empty - mirrors
                                          # verify_speaker()'s "no signal
                                          # available" handling in
                                          # speaker_verification.py
            "category_scores": {str: float, ...},  # every category, 0-1
            "flagged_categories": [str, ...],        # categories above threshold
            "is_likely_scam_intent": bool,            # True if ANY category flagged
            "top_category": Optional[str],            # highest-scoring category
            "top_score": Optional[float],
        }
    """
    if not text or not text.strip():
        # No text to analyze (e.g. silence, or ASR produced nothing) - this
        # must NOT be silently treated as "safe"/"no scam intent" by Stage 5;
        # it's simply an unavailable signal, same handling philosophy as
        # verify_speaker() when no enrolled voice exists.
        return {
            "available": False,
            "category_scores": {},
            "flagged_categories": [],
            "is_likely_scam_intent": None,
            "top_category": None,
            "top_score": None,
        }

    classifier = _get_classifier()

    result = classifier(text, candidate_labels=SCAM_CATEGORIES, multi_label=True)
    # multi_label=True: a transcript can match MULTIPLE categories at once
    # (e.g. both "urgency" and "OTP request" in the same sentence) - scores
    # don't need to sum to 1 like they would in single-label mode.

    category_scores = dict(zip(result["labels"], result["scores"]))
    flagged = [cat for cat, score in category_scores.items() if score >= threshold]

    top_category = result["labels"][0]
    top_score = result["scores"][0]

    return {
        "available": True,
        "category_scores": category_scores,
        "flagged_categories": flagged,
        "is_likely_scam_intent": len(flagged) > 0,
        "top_category": top_category,
        "top_score": top_score,
    }


def detect_scam_intent_from_asr_result(asr_result: Dict, threshold: float = 0.5) -> Dict:
    """
    Convenience wrapper that takes streaming_asr.py's transcribe_chunk()
    output directly, so Stage 5 can chain the two stages without manually
    pulling out the "text" field each time.
    """
    return detect_scam_intent(asr_result.get("text", ""), threshold=threshold)
