from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database.db import get_db
from app.models.user import User
from app.services.auth_service import get_current_user
from app.services.sentence_service import analyze_sentence
from app.ml.tense_model import predict_tense
from app.ml.sentence_model import get_similar_sentences

router = APIRouter(prefix="/api", tags=["Sentence Analysis"])


class AnalyzeSentenceRequest(BaseModel):
    sentence: str


@router.post("/analyze-sentence")
def analyze_sentence_endpoint(
    req: AnalyzeSentenceRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sentence = req.sentence.strip()
    if not sentence:
        raise HTTPException(status_code=400, detail="Sentence is required")

    # Full analysis (meaning + grammar + tense)
    analysis = analyze_sentence(db, sentence)

    # ML tense prediction
    ml_tense = predict_tense(sentence)
    if ml_tense:
        ml_tense["predicted_tense"] = ml_tense.get("prediction")

    # Similar sentences
    similar = get_similar_sentences(sentence, top_k=3)

    return {
        "analysis": analysis,
        "ml_tense_prediction": ml_tense,
        "similar_sentences": similar,
    }
