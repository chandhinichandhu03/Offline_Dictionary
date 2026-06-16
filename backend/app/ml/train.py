"""Training script for all ML models.

Reads data from the database and trains:
1. POS Prediction Model (Logistic Regression + Random Forest)
2. Tense Classification Model (Naive Bayes + Logistic Regression)
3. Sentence Meaning Retrieval Model (TF-IDF + Cosine Similarity)
"""

from sqlalchemy.orm import Session
from app.database.db import SessionLocal
from app.models.word import Word
from app.models.sentence_dataset import SentenceDataset
from app.ml import pos_model, tense_model, sentence_model


def train_all_models():
    """Train all ML models from database data."""
    db = SessionLocal()
    try:
        # 1. Train POS Model
        print("\n[TRAIN] Training POS prediction model...")
        words = db.query(Word).filter(Word.pos.isnot(None), Word.pos != "").all()
        words_data = [{"word": w.word, "pos": w.pos} for w in words]
        if words_data:
            pos_model.train_model(words_data)
        else:
            print("[TRAIN] No word data available for POS model")

        # 2. Train Tense Model
        print("\n[TRAIN] Training tense classification model...")
        sentences = db.query(SentenceDataset).filter(
            SentenceDataset.tense.isnot(None),
            SentenceDataset.tense != ""
        ).all()
        sentences_data = [{"sentence": s.sentence, "tense": s.tense} for s in sentences]
        if sentences_data:
            tense_model.train_model(sentences_data)
        else:
            print("[TRAIN] No sentence data available for tense model")

        # 3. Train Sentence Meaning Model
        print("\n[TRAIN] Training sentence meaning retrieval model...")
        all_sentences = db.query(SentenceDataset).filter(
            SentenceDataset.meaning.isnot(None),
            SentenceDataset.meaning != ""
        ).all()
        meaning_data = [{"sentence": s.sentence, "meaning": s.meaning} for s in all_sentences]
        if meaning_data:
            sentence_model.train_model(meaning_data)
        else:
            print("[TRAIN] No sentence data available for meaning model")

        print("\n[TRAIN] All models trained successfully!")

    finally:
        db.close()


def load_all_models():
    """Try to load all pre-trained models from disk."""
    loaded = {
        "pos": pos_model.load_model(),
        "tense": tense_model.load_model(),
        "sentence": sentence_model.load_model(),
    }
    not_loaded = [k for k, v in loaded.items() if not v]
    if not_loaded:
        print(f"[TRAIN] Models not found on disk: {not_loaded}. Training from scratch...")
        train_all_models()
    else:
        print("[TRAIN] All models loaded from disk successfully!")


if __name__ == "__main__":
    train_all_models()
