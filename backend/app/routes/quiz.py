from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database.db import get_db
from app.models.user import User
from app.services.auth_service import get_current_user
from app.services.quiz_service import (
    generate_vocabulary_quiz,
    generate_synonym_quiz,
    save_quiz_result,
    get_user_quiz_results,
    get_flashcard_word,
)

router = APIRouter(prefix="/api", tags=["Quiz & Practice"])


class SubmitQuizRequest(BaseModel):
    score: int
    total: int
    quiz_type: str = "vocabulary"


@router.get("/quiz/words")
def get_vocabulary_quiz(
    count: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    questions = generate_vocabulary_quiz(db, count)
    if not questions:
        raise HTTPException(status_code=404, detail="Not enough words for quiz")
    return {"questions": questions, "total": len(questions)}


@router.get("/quiz/synonyms")
def get_synonym_quiz(
    count: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    questions = generate_synonym_quiz(db, count)
    if not questions:
        raise HTTPException(status_code=404, detail="Not enough words for synonym quiz")
    return {"questions": questions, "total": len(questions)}


@router.post("/quiz/submit")
def submit_quiz(
    req: SubmitQuizRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    result = save_quiz_result(db, current_user.id, req.score, req.total, req.quiz_type)
    return {
        "message": "Quiz result saved",
        "result": {
            "id": result.id,
            "score": result.score,
            "total": result.total,
            "percentage": round(result.score / result.total * 100, 1) if result.total > 0 else 0,
            "quiz_type": result.quiz_type,
        },
    }


@router.get("/quiz/results")
def get_quiz_results(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    results = get_user_quiz_results(db, current_user.id)
    return {
        "results": [
            {
                "id": r.id,
                "score": r.score,
                "total": r.total,
                "percentage": round(r.score / r.total * 100, 1) if r.total > 0 else 0,
                "quiz_type": r.quiz_type,
                "taken_at": r.taken_at.isoformat() if r.taken_at else None,
            }
            for r in results
        ],
    }


@router.get("/quiz/flashcard")
def get_flashcard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    card = get_flashcard_word(db)
    if not card:
        raise HTTPException(status_code=404, detail="No words available")
    return card
