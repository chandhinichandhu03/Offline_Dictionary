from sqlalchemy.orm import Session
from app.models.sentence_dataset import SentenceDataset
from app.services.grammar_service import analyze_sentence_grammar
from app.services.tense_service import detect_tense, get_tense_explanation
from typing import Optional


def analyze_sentence(db: Session, sentence: str) -> dict:
    """Full sentence analysis: meaning, grammar breakdown, tense detection."""
    sentence = sentence.strip()
    if not sentence:
        return {"error": "Empty sentence provided"}

    # Detect tense
    tense_result = detect_tense(sentence)

    # Grammar breakdown (SVO)
    grammar = analyze_sentence_grammar(sentence)

    # Get meaning from ML model or dataset
    meaning = get_sentence_meaning(db, sentence)

    return {
        "sentence": sentence,
        "meaning": meaning,
        "grammar": {
            "subject": grammar.get("subject"),
            "verb": grammar.get("verb"),
            "object": grammar.get("object"),
            "word_count": grammar.get("word_count"),
        },
        "breakdown": {
            "subject": grammar.get("subject"),
            "verb": grammar.get("verb"),
            "object": grammar.get("object"),
            "auxiliary": grammar.get("auxiliary"),
            "main_verb": grammar.get("main_verb"),
            "word_count": grammar.get("word_count"),
        },
        "tense": tense_result["tense"],
        "tense_details": {
            "name": tense_result["tense"],
            "confidence": tense_result["confidence"],
            "explanation": get_tense_explanation(tense_result["tense"]),
        },
    }


def get_sentence_meaning(db: Session, sentence: str) -> str:
    """Try to find a meaning from the sentence dataset, falling back to ML model."""
    # First try exact match in database
    result = (
        db.query(SentenceDataset)
        .filter(SentenceDataset.sentence.ilike(f"%{sentence}%"))
        .first()
    )
    if result:
        return result.meaning

    # Try ML-based similarity matching
    try:
        from app.ml.sentence_model import get_similar_meaning
        meaning = get_similar_meaning(sentence)
        if meaning:
            return meaning
    except Exception:
        pass

    # Fallback: construct a basic meaning
    return f"The sentence describes: {sentence.lower().rstrip('.')}"
