from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.db import get_db
from app.models.user import User
from app.models.favorite import Favorite
from app.models.search_history import SearchHistory
from app.models.quiz_result import QuizResult
from app.models.word import Word
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api", tags=["Dashboard"])


@router.get("/dashboard")
def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Total searches
    total_searches = (
        db.query(SearchHistory)
        .filter(SearchHistory.user_id == current_user.id)
        .count()
    )

    # Favorite words count
    favorite_count = (
        db.query(Favorite)
        .filter(Favorite.user_id == current_user.id)
        .count()
    )

    # Quiz results
    quiz_results = (
        db.query(QuizResult)
        .filter(QuizResult.user_id == current_user.id)
        .order_by(QuizResult.taken_at.desc())
        .limit(10)
        .all()
    )

    total_quiz_score = sum(q.score for q in quiz_results) if quiz_results else 0
    total_quiz_questions = sum(q.total for q in quiz_results) if quiz_results else 0
    avg_score = round((total_quiz_score / total_quiz_questions * 100), 1) if total_quiz_questions > 0 else 0

    # Recently viewed words
    recent_searches = (
        db.query(SearchHistory)
        .filter(SearchHistory.user_id == current_user.id)
        .order_by(SearchHistory.searched_at.desc())
        .limit(10)
        .all()
    )

    # Total words in dictionary
    total_words = db.query(Word).count()

    # Learning progress (unique words searched / total words)
    unique_searches = (
        db.query(func.count(func.distinct(SearchHistory.word)))
        .filter(SearchHistory.user_id == current_user.id)
        .scalar()
    )
    learning_progress = round((unique_searches / total_words * 100), 1) if total_words > 0 else 0

    return {
        "total_searches": total_searches,
        "favorite_count": favorite_count,
        "quiz_score": avg_score,
        "total_quizzes_taken": len(quiz_results),
        "learning_progress": learning_progress,
        "unique_words_searched": unique_searches,
        "total_words_available": total_words,
        "recent_searches": [
            {
                "word": h.word,
                "searched_at": h.searched_at.isoformat() if h.searched_at else None,
            }
            for h in recent_searches
        ],
        "recent_quiz_results": [
            {
                "score": q.score,
                "total": q.total,
                "quiz_type": q.quiz_type,
                "taken_at": q.taken_at.isoformat() if q.taken_at else None,
            }
            for q in quiz_results
        ],
    }
