import csv
import io
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database.db import get_db
from app.models.user import User
from app.models.word import Word
from app.services.auth_service import get_admin_user
from app.services.dictionary_service import get_all_words, get_word_count

router = APIRouter(prefix="/api/admin", tags=["Admin"])


class WordCreateRequest(BaseModel):
    word: str
    meaning: str
    pos: str = ""
    synonyms: str = ""
    antonyms: str = ""
    example: str = ""
    phonetic: str = ""
    frequency: int = 0


class WordUpdateRequest(BaseModel):
    word: str | None = None
    meaning: str | None = None
    pos: str | None = None
    synonyms: str | None = None
    antonyms: str | None = None
    example: str | None = None
    phonetic: str | None = None
    frequency: int | None = None


@router.get("/words")
def list_words(
    skip: int = 0,
    limit: int = 50,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    words = get_all_words(db, skip, limit)
    total = get_word_count(db)
    return {
        "words": [
            {
                "id": w.id,
                "word": w.word,
                "meaning": w.meaning,
                "pos": w.pos,
                "synonyms": w.synonyms,
                "antonyms": w.antonyms,
                "example": w.example,
                "phonetic": w.phonetic,
                "frequency": w.frequency,
            }
            for w in words
        ],
        "total": total,
        "skip": skip,
        "limit": limit,
    }


@router.post("/words")
def add_word(
    req: WordCreateRequest,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    word = Word(
        word=req.word.strip().lower(),
        meaning=req.meaning.strip(),
        pos=req.pos.strip(),
        synonyms=req.synonyms.strip(),
        antonyms=req.antonyms.strip(),
        example=req.example.strip(),
        phonetic=req.phonetic.strip(),
        frequency=req.frequency,
    )
    db.add(word)
    db.commit()
    db.refresh(word)
    return {"message": "Word added", "word_id": word.id}


@router.put("/words/{word_id}")
def update_word(
    word_id: int,
    req: WordUpdateRequest,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    word = db.query(Word).filter(Word.id == word_id).first()
    if not word:
        raise HTTPException(status_code=404, detail="Word not found")

    if req.word is not None:
        word.word = req.word.strip().lower()
    if req.meaning is not None:
        word.meaning = req.meaning.strip()
    if req.pos is not None:
        word.pos = req.pos.strip()
    if req.synonyms is not None:
        word.synonyms = req.synonyms.strip()
    if req.antonyms is not None:
        word.antonyms = req.antonyms.strip()
    if req.example is not None:
        word.example = req.example.strip()
    if req.phonetic is not None:
        word.phonetic = req.phonetic.strip()
    if req.frequency is not None:
        word.frequency = req.frequency

    db.commit()
    return {"message": "Word updated"}


@router.delete("/words/{word_id}")
def delete_word(
    word_id: int,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    word = db.query(Word).filter(Word.id == word_id).first()
    if not word:
        raise HTTPException(status_code=404, detail="Word not found")

    db.delete(word)
    db.commit()
    return {"message": "Word deleted"}


@router.post("/import-csv")
async def import_csv(
    file: UploadFile = File(...),
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="File must be a CSV")

    content = await file.read()
    text = content.decode("utf-8")
    reader = csv.DictReader(io.StringIO(text))

    count = 0
    for row in reader:
        word = Word(
            word=row.get("word", "").strip().lower(),
            meaning=row.get("meaning", "").strip(),
            pos=row.get("pos", "").strip(),
            synonyms=row.get("synonyms", "").strip(),
            antonyms=row.get("antonyms", "").strip(),
            example=row.get("example", "").strip(),
            phonetic=row.get("phonetic", "").strip(),
            frequency=int(row.get("frequency", 0) or 0),
        )
        db.add(word)
        count += 1

    db.commit()
    return {"message": f"Imported {count} words from CSV"}


@router.get("/export-csv")
def export_csv(
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    words = db.query(Word).order_by(Word.word).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["word", "meaning", "pos", "synonyms", "antonyms", "example", "phonetic", "frequency"])

    for w in words:
        writer.writerow([w.word, w.meaning, w.pos, w.synonyms, w.antonyms, w.example, w.phonetic, w.frequency])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=words_export.csv"},
    )
