from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database.db import get_db
from app.models.user import User
from app.models.search_history import SearchHistory
from app.services.auth_service import get_current_user
from app.services.dictionary_service import (
    search_word,
    search_word_fuzzy,
    get_suggestions,
    format_word_result,
)
from app.services.grammar_service import analyze_word_grammar
from app.ml.pos_model import predict_pos
from datetime import datetime, timezone

router = APIRouter(prefix="/api", tags=["Dictionary"])


class AnalyzeWordRequest(BaseModel):
    word: str


@router.get("/search-word/{word}")
def search_word_endpoint(
    word: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Search for exact match
    result = search_word(db, word)

    if not result:
        # Try fuzzy search
        fuzzy_results = search_word_fuzzy(db, word)
        if fuzzy_results:
            # Record search history
            history = SearchHistory(
                user_id=current_user.id,
                word=word.lower(),
                searched_at=datetime.now(timezone.utc),
            )
            db.add(history)
            db.commit()

            return {
                "exact_match": False,
                "query": word,
                "suggestions": [format_word_result(w) for w in fuzzy_results],
                "message": f"No exact match for '{word}'. Here are similar words:",
            }
        raise HTTPException(status_code=404, detail=f"Word '{word}' not found")

    # Record search history
    history = SearchHistory(
        user_id=current_user.id,
        word=word.lower(),
        searched_at=datetime.now(timezone.utc),
    )
    db.add(history)
    db.commit()

    return {
        "exact_match": True,
        "result": format_word_result(result),
    }


@router.post("/analyze-word")
def analyze_word_endpoint(
    req: AnalyzeWordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    word = req.word.strip()
    if not word:
        raise HTTPException(status_code=400, detail="Word is required")

    # Grammar analysis (rule-based + dataset)
    grammar = analyze_word_grammar(db, word)

    # ML POS prediction
    ml_prediction = predict_pos(word)
    if ml_prediction:
        ml_prediction["predicted_pos"] = ml_prediction.get("prediction")

    # Search for word in dictionary
    dict_result = search_word(db, word)
    word_info = format_word_result(dict_result) if dict_result else None

    return {
        "word": word,
        "grammar_analysis": grammar,
        "ml_prediction": ml_prediction,
        "dictionary_info": word_info,
    }


@router.get("/suggestions")
def get_suggestions_endpoint(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
):
    suggestions = get_suggestions(db, q, limit=10)
    return {"query": q, "suggestions": suggestions}
