from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database.db import get_db
from app.models.user import User
from app.models.word import Word
from app.models.favorite import Favorite
from app.services.auth_service import get_current_user
from app.services.dictionary_service import format_word_result

router = APIRouter(prefix="/api", tags=["Favorites"])


class AddFavoriteRequest(BaseModel):
    word_id: int


@router.get("/favorites")
def get_favorites(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    favorites = (
        db.query(Favorite)
        .filter(Favorite.user_id == current_user.id)
        .order_by(Favorite.created_at.desc())
        .all()
    )

    result = []
    for fav in favorites:
        word = db.query(Word).filter(Word.id == fav.word_id).first()
        if word:
            word_data = format_word_result(word)
            word_data["favorite_id"] = fav.id
            word_data["favorited_at"] = fav.created_at.isoformat() if fav.created_at else None
            result.append(word_data)

    return {"favorites": result, "total": len(result)}


@router.post("/favorite")
def add_favorite(
    req: AddFavoriteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Check word exists
    word = db.query(Word).filter(Word.id == req.word_id).first()
    if not word:
        raise HTTPException(status_code=404, detail="Word not found")

    # Check not already favorited
    existing = (
        db.query(Favorite)
        .filter(Favorite.user_id == current_user.id, Favorite.word_id == req.word_id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Word already in favorites")

    fav = Favorite(user_id=current_user.id, word_id=req.word_id)
    db.add(fav)
    db.commit()
    db.refresh(fav)

    return {"message": "Word added to favorites", "favorite_id": fav.id}


@router.delete("/favorite/{favorite_id}")
def remove_favorite(
    favorite_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    fav = (
        db.query(Favorite)
        .filter(Favorite.id == favorite_id, Favorite.user_id == current_user.id)
        .first()
    )
    if not fav:
        raise HTTPException(status_code=404, detail="Favorite not found")

    db.delete(fav)
    db.commit()
    return {"message": "Word removed from favorites"}
