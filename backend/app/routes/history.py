from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.user import User
from app.models.search_history import SearchHistory
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api", tags=["Search History"])


@router.get("/history")
def get_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    history = (
        db.query(SearchHistory)
        .filter(SearchHistory.user_id == current_user.id)
        .order_by(SearchHistory.searched_at.desc())
        .limit(100)
        .all()
    )

    return {
        "history": [
            {
                "id": h.id,
                "word": h.word,
                "searched_at": h.searched_at.isoformat() if h.searched_at else None,
            }
            for h in history
        ],
        "total": len(history),
    }


@router.delete("/history")
def clear_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db.query(SearchHistory).filter(SearchHistory.user_id == current_user.id).delete()
    db.commit()
    return {"message": "Search history cleared"}


@router.delete("/history/{history_id}")
def delete_history_item(
    history_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = (
        db.query(SearchHistory)
        .filter(SearchHistory.id == history_id, SearchHistory.user_id == current_user.id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="History item not found")

    db.delete(item)
    db.commit()
    return {"message": "History item deleted"}
