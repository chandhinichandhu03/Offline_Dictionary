"""Sentence Meaning Retrieval using TF-IDF and Cosine Similarity.

Finds the most similar sentence from the dataset and returns its meaning.
"""

import os
import pickle
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.config import ML_MODELS_DIR

MODEL_PATH = os.path.join(ML_MODELS_DIR, "sentence_model.pkl")

_model = None


def train_model(sentences_data: list):
    """Train sentence similarity model.

    Args:
        sentences_data: List of dicts with 'sentence' and 'meaning' keys
    """
    global _model

    if not sentences_data:
        print("[ML] No training data for sentence model")
        return

    sentences = [item["sentence"] for item in sentences_data]
    meanings = [item["meaning"] for item in sentences_data]

    tfidf = TfidfVectorizer(max_features=1000, ngram_range=(1, 2), stop_words="english")
    tfidf_matrix = tfidf.fit_transform(sentences)

    _model = {
        "tfidf": tfidf,
        "tfidf_matrix": tfidf_matrix,
        "sentences": sentences,
        "meanings": meanings,
    }

    with open(MODEL_PATH, "wb") as f:
        pickle.dump(_model, f)
    print(f"[ML] Sentence model trained and saved ({len(sentences_data)} samples)")


def load_model():
    """Load trained model from disk."""
    global _model
    if os.path.exists(MODEL_PATH):
        with open(MODEL_PATH, "rb") as f:
            _model = pickle.load(f)
        print("[ML] Sentence model loaded from disk")
        return True
    return False


def get_similar_meaning(sentence: str, top_k: int = 1) -> str:
    """Find the most similar sentence and return its meaning."""
    global _model

    if _model is None:
        if not load_model():
            return None

    query_vec = _model["tfidf"].transform([sentence])
    similarities = cosine_similarity(query_vec, _model["tfidf_matrix"])[0]

    # Get top-k most similar
    top_indices = np.argsort(similarities)[-top_k:][::-1]

    if similarities[top_indices[0]] < 0.1:
        return None

    return _model["meanings"][top_indices[0]]


def get_similar_sentences(sentence: str, top_k: int = 5) -> list:
    """Find the most similar sentences with their meanings and similarity scores."""
    global _model

    if _model is None:
        if not load_model():
            return []

    query_vec = _model["tfidf"].transform([sentence])
    similarities = cosine_similarity(query_vec, _model["tfidf_matrix"])[0]

    top_indices = np.argsort(similarities)[-top_k:][::-1]

    results = []
    for idx in top_indices:
        if similarities[idx] > 0.05:
            results.append({
                "sentence": _model["sentences"][idx],
                "meaning": _model["meanings"][idx],
                "similarity": round(float(similarities[idx]) * 100, 1),
            })

    return results
