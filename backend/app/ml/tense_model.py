"""Tense Classification Model using Scikit-Learn.

Uses Naive Bayes and Logistic Regression with TF-IDF features
plus hand-crafted features to classify sentence tense.
"""

import os
import pickle
import re
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.preprocessing import LabelEncoder
from scipy.sparse import hstack, csr_matrix
from app.config import ML_MODELS_DIR

MODEL_PATH = os.path.join(ML_MODELS_DIR, "tense_model.pkl")

_model = None


def extract_hand_features(sentence: str) -> list:
    """Extract hand-crafted features for tense classification."""
    s = sentence.lower()
    return [
        1 if re.search(r'\b(am|is|are)\b', s) else 0,
        1 if re.search(r'\b(was|were)\b', s) else 0,
        1 if re.search(r'\b(will|shall)\b', s) else 0,
        1 if re.search(r'\b(has|have)\b', s) else 0,
        1 if re.search(r'\bhad\b', s) else 0,
        1 if re.search(r'\bbeen\b', s) else 0,
        1 if re.search(r'\w+ing\b', s) else 0,
        1 if re.search(r'\w+ed\b', s) else 0,
        1 if re.search(r'\b(every|always|usually|often|daily)\b', s) else 0,
        1 if re.search(r'\b(yesterday|ago|last)\b', s) else 0,
        1 if re.search(r'\b(tomorrow|next|soon)\b', s) else 0,
        1 if re.search(r'\b(since|for)\b', s) else 0,
        1 if re.search(r'\b(already|just|yet|ever|never)\b', s) else 0,
        1 if re.search(r'\b(before|after|by the time)\b', s) else 0,
        1 if re.search(r'\b(right now|currently|at the moment)\b', s) else 0,
    ]


def train_model(sentences_data: list):
    """Train tense classification model.

    Args:
        sentences_data: List of dicts with 'sentence' and 'tense' keys
    """
    global _model

    if not sentences_data:
        print("[ML] No training data for tense model")
        return

    sentences = [item["sentence"] for item in sentences_data]
    labels = [item["tense"] for item in sentences_data]

    # TF-IDF features
    tfidf = TfidfVectorizer(max_features=500, ngram_range=(1, 2))
    X_tfidf = tfidf.fit_transform(sentences)

    # Hand-crafted features
    hand_feats = np.array([extract_hand_features(s) for s in sentences])
    X_hand = csr_matrix(hand_feats)

    # Combine features
    X = hstack([X_tfidf, X_hand])

    # Encode labels
    le = LabelEncoder()
    y = le.fit_transform(labels)

    # Train Logistic Regression
    lr = LogisticRegression(max_iter=1000, random_state=42)
    lr.fit(X, y)

    # Train Naive Bayes (needs non-negative features, TF-IDF + hand features are non-negative)
    nb = MultinomialNB(alpha=0.1)
    nb.fit(X, y)

    _model = {
        "tfidf": tfidf,
        "logistic_regression": lr,
        "naive_bayes": nb,
        "label_encoder": le,
    }

    with open(MODEL_PATH, "wb") as f:
        pickle.dump(_model, f)
    print(f"[ML] Tense model trained and saved ({len(sentences_data)} samples, {len(le.classes_)} classes)")


def load_model():
    """Load trained model from disk."""
    global _model
    if os.path.exists(MODEL_PATH):
        with open(MODEL_PATH, "rb") as f:
            _model = pickle.load(f)
        print("[ML] Tense model loaded from disk")
        return True
    return False


def predict_tense(sentence: str) -> dict:
    """Predict the tense of a sentence."""
    global _model

    if _model is None:
        if not load_model():
            return {
                "sentence": sentence,
                "prediction": "Unknown",
                "confidence": 0.0,
                "method": "model_not_available",
            }

    tfidf = _model["tfidf"]
    le = _model["label_encoder"]

    X_tfidf = tfidf.transform([sentence])
    hand_feats = csr_matrix(np.array([extract_hand_features(sentence)]))
    X = hstack([X_tfidf, hand_feats])

    # Get predictions from both models
    lr_probs = _model["logistic_regression"].predict_proba(X)[0]
    nb_probs = _model["naive_bayes"].predict_proba(X)[0]

    # Ensemble: weighted average (LR usually better)
    avg_probs = 0.6 * lr_probs + 0.4 * nb_probs
    predicted_idx = np.argmax(avg_probs)
    confidence = float(avg_probs[predicted_idx])

    return {
        "sentence": sentence,
        "prediction": le.inverse_transform([predicted_idx])[0],
        "predicted_tense": le.inverse_transform([predicted_idx])[0],
        "confidence": round(confidence, 4),
        "method": "ensemble_lr_nb",
        "all_predictions": {
            le.inverse_transform([i])[0]: round(float(avg_probs[i]), 4)
            for i in range(len(avg_probs))
            if avg_probs[i] > 0.02
        },
    }
