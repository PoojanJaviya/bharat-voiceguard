"""
Stage 2a: Speaker Verification (ECAPA-TDNN)
----------------------------------------------
GOAL: given a chunk of live audio, answer "does this voice match a trusted,
pre-enrolled voice (if one exists)?"

HOW IT WORKS (concept):
A pretrained model called ECAPA-TDNN was trained on thousands of speakers
(VoxCeleb dataset) to solve one task: turn any voice clip into a fixed-length
vector of numbers (an "embedding" - here, 192 numbers) that captures HOW
someone sounds (pitch, timbre, resonance, speaking style) - not WHAT they
said. This is completely separate from ASR/transcription.

The key property that makes this useful: embeddings from the SAME speaker,
even in different clips, end up close together in this 192-dimensional
space. Embeddings from DIFFERENT speakers end up far apart. "Close" and
"far" are measured with cosine similarity, a number between -1 and 1:
    1.0  = identical direction (same speaker, high confidence)
    0.0  = unrelated
   -1.0  = opposite (never really happens for real voices)

In practice, same-speaker cosine similarity on real speech usually lands
around 0.6-0.9+, and different-speaker similarity usually lands below 0.4-0.5.
The exact threshold needs tuning on real data - config.py holds this value
so it's tunable without touching logic here.

WORKFLOW IN THIS PIPELINE:
1. ENROLLMENT (happens once, ahead of time): user records their trusted
   contact's voice (e.g. "Mom") -> we compute and store that embedding.
2. VERIFICATION (happens live, per chunk): compute the live caller's chunk
   embedding -> compare to the stored trusted embedding -> similarity score.

If no enrolled voice exists for this caller, this component simply can't
contribute a signal - that's expected and handled by Risk Fusion later
(this is why the architecture doc says "trusted voice, where available").
"""

from typing import Optional, Dict
import torch
import torch.nn.functional as F

_model = None  # loaded once, reused across calls (loading is slow)


def _get_model():
    """
    Lazily loads the pretrained ECAPA-TDNN model from SpeechBrain's
    HuggingFace-hosted checkpoint. First call downloads ~80MB of weights
    and caches them locally in `pretrained_models/ecapa/` - subsequent
    calls load instantly from that local cache.

    NOTE: this download requires normal internet access to huggingface.co.
    """
    global _model
    if _model is None:
        from speechbrain.inference.speaker import EncoderClassifier
        _model = EncoderClassifier.from_hparams(
            source="speechbrain/spkrec-ecapa-voxceleb",
            savedir="pretrained_models/ecapa",
        )
    return _model


def get_embedding(waveform: torch.Tensor) -> torch.Tensor:
    """
    Convert a mono 16kHz waveform chunk into its speaker embedding.
    Input: waveform tensor of shape (num_samples,)
    Output: embedding tensor of shape (192,)
    """
    model = _get_model()
    # SpeechBrain expects a batch dimension: (batch, samples)
    batched = waveform.unsqueeze(0)
    with torch.no_grad():
        embedding = model.encode_batch(batched)
    return embedding.squeeze()  # -> shape (192,)


def compare_embeddings(embedding_a: torch.Tensor, embedding_b: torch.Tensor) -> float:
    """
    Cosine similarity between two embeddings. Returns a float in [-1, 1]
    (in practice usually [0, 1] for real voice embeddings).
    """
    similarity = F.cosine_similarity(embedding_a.unsqueeze(0), embedding_b.unsqueeze(0))
    return similarity.item()


def verify_speaker(
    live_chunk_waveform: torch.Tensor,
    enrolled_embedding: Optional[torch.Tensor],
    threshold: float = 0.5,
) -> Dict:
    """
    Main entry point Stage 5 (Risk Fusion) will call.

    If enrolled_embedding is None (no trusted voice on file for this
    contact), we return a result that clearly says "no signal available" -
    this must NOT be silently treated as "verified" or "suspicious" by
    Risk Fusion; it's simply an unavailable signal.
    """
    if enrolled_embedding is None:
        return {
            "available": False,
            "similarity": None,
            "is_match": None,
        }

    live_embedding = get_embedding(live_chunk_waveform)
    similarity = compare_embeddings(live_embedding, enrolled_embedding)

    return {
        "available": True,
        "similarity": similarity,
        "is_match": similarity >= threshold,
    }