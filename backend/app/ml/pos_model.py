"""Part-of-Speech Prediction Model using Scikit-Learn.

Uses Logistic Regression and Random Forest with character-level features
(word length, prefixes, suffixes, n-grams) to predict POS tags.
"""

import os
import pickle
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction import DictVectorizer
from sklearn.pipeline import Pipeline
from app.config import ML_MODELS_DIR

MODEL_PATH = os.path.join(ML_MODELS_DIR, "pos_model.pkl")

_model = None
_vectorizer = None
_label_encoder = None


def extract_features(word: str) -> dict:
    """Extract character-level features from a word for POS prediction."""
    word_lower = word.lower().strip()
    features = {
        "word_length": len(word_lower),
        "prefix_1": word_lower[:1] if len(word_lower) >= 1 else "",
        "prefix_2": word_lower[:2] if len(word_lower) >= 2 else "",
        "prefix_3": word_lower[:3] if len(word_lower) >= 3 else "",
        "suffix_1": word_lower[-1:] if len(word_lower) >= 1 else "",
        "suffix_2": word_lower[-2:] if len(word_lower) >= 2 else "",
        "suffix_3": word_lower[-3:] if len(word_lower) >= 3 else "",
        "suffix_4": word_lower[-4:] if len(word_lower) >= 4 else "",
        "has_hyphen": 1 if "-" in word_lower else 0,
        "is_capitalized": 1 if word[0].isupper() else 0,
        "is_all_caps": 1 if word.isupper() else 0,
        "has_digit": 1 if any(c.isdigit() for c in word) else 0,
        # Suffix-based flags
        "ends_ing": 1 if word_lower.endswith("ing") else 0,
        "ends_ed": 1 if word_lower.endswith("ed") else 0,
        "ends_ly": 1 if word_lower.endswith("ly") else 0,
        "ends_ness": 1 if word_lower.endswith("ness") else 0,
        "ends_ment": 1 if word_lower.endswith("ment") else 0,
        "ends_tion": 1 if word_lower.endswith("tion") else 0,
        "ends_ful": 1 if word_lower.endswith("ful") else 0,
        "ends_less": 1 if word_lower.endswith("less") else 0,
        "ends_ous": 1 if word_lower.endswith("ous") else 0,
        "ends_ive": 1 if word_lower.endswith("ive") else 0,
        "ends_able": 1 if word_lower.endswith("able") else 0,
        "ends_er": 1 if word_lower.endswith("er") else 0,
        "ends_est": 1 if word_lower.endswith("est") else 0,
    }
    # Character bigrams
    for i in range(len(word_lower) - 1):
        features[f"bigram_{word_lower[i:i+2]}"] = 1
    return features


def train_model(words_data: list):
    """Train POS prediction model from word data.

    Args:
        words_data: List of dicts with 'word' and 'pos' keys
    """
    global _model, _vectorizer, _label_encoder

    if not words_data:
        print("[ML] No training data for POS model")
        return

    features = [extract_features(item["word"]) for item in words_data]
    labels = [item["pos"].lower() for item in words_data]

    _vectorizer = DictVectorizer(sparse=False)
    X = _vectorizer.fit_transform(features)

    # Get unique labels
    unique_labels = sorted(set(labels))
    _label_encoder = {label: idx for idx, label in enumerate(unique_labels)}
    _label_decoder = {idx: label for label, idx in _label_encoder.items()}
    y = np.array([_label_encoder[l] for l in labels])

    # Train Logistic Regression
    lr_model = LogisticRegression(max_iter=1000, random_state=42)
    lr_model.fit(X, y)

    # Train Random Forest
    rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
    rf_model.fit(X, y)

    _model = {
        "logistic_regression": lr_model,
        "random_forest": rf_model,
        "vectorizer": _vectorizer,
        "label_encoder": _label_encoder,
        "label_decoder": _label_decoder,
    }

    # Save model
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(_model, f)
    print(f"[ML] POS model trained and saved ({len(words_data)} samples, {len(unique_labels)} classes)")


def load_model():
    """Load trained model from disk."""
    global _model, _vectorizer
    if os.path.exists(MODEL_PATH):
        with open(MODEL_PATH, "rb") as f:
            _model = pickle.load(f)
        _vectorizer = _model["vectorizer"]
        print("[ML] POS model loaded from disk")
        return True
    return False


def predict_pos(word: str) -> dict:
    """Predict the POS of a word using the ensemble model."""
    global _model, _vectorizer

    if _model is None:
        if not load_model():
            return {
                "word": word,
                "prediction": "unknown",
                "confidence": 0.0,
                "method": "model_not_available",
            }

    features = extract_features(word)
    X = _model["vectorizer"].transform([features])
    decoder = _model["label_decoder"]

    # Get predictions from both models
    lr_probs = _model["logistic_regression"].predict_proba(X)[0]
    rf_probs = _model["random_forest"].predict_proba(X)[0]

    # Ensemble: average probabilities
    avg_probs = (lr_probs + rf_probs) / 2
    predicted_idx = np.argmax(avg_probs)
    confidence = float(avg_probs[predicted_idx])

    return {
        "word": word,
        "prediction": decoder[predicted_idx].capitalize(),
        "predicted_pos": decoder[predicted_idx].capitalize(),
        "confidence": round(confidence, 4),
        "method": "ensemble_lr_rf",
        "all_predictions": {
            decoder[i]: round(float(avg_probs[i]), 4)
            for i in range(len(avg_probs))
            if avg_probs[i] > 0.01
        },
    }
