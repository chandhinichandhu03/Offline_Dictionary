import random
from sqlalchemy.orm import Session
from app.models.word import Word
from app.models.quiz_result import QuizResult
from typing import List


def generate_vocabulary_quiz(db: Session, count: int = 10) -> List[dict]:
    """Generate a vocabulary quiz with multiple choice questions."""
    all_words = db.query(Word).filter(Word.meaning.isnot(None)).all()
    if len(all_words) < 4:
        return []

    quiz_words = random.sample(all_words, min(count, len(all_words)))
    questions = []

    for word in quiz_words:
        # Create wrong options from other words
        other_words = [w for w in all_words if w.id != word.id]
        wrong_options = random.sample(other_words, min(3, len(other_words)))

        options = [word.meaning] + [w.meaning for w in wrong_options]
        random.shuffle(options)

        questions.append({
            "id": word.id,
            "word": word.word.capitalize(),
            "options": options,
            "correct_answer": word.meaning,
            "pos": word.pos,
        })

    return questions


def generate_synonym_quiz(db: Session, count: int = 10) -> List[dict]:
    """Generate a synonym matching quiz."""
    words_with_synonyms = (
        db.query(Word)
        .filter(Word.synonyms.isnot(None), Word.synonyms != "", Word.synonyms != "none")
        .all()
    )
    if len(words_with_synonyms) < 4:
        return []

    quiz_words = random.sample(words_with_synonyms, min(count, len(words_with_synonyms)))
    questions = []

    for word in quiz_words:
        synonyms = [s.strip() for s in word.synonyms.split(";") if s.strip()]
        if not synonyms:
            continue
        correct = synonyms[0]

        # Get wrong options from other words' synonyms
        other_words = [w for w in words_with_synonyms if w.id != word.id and w.synonyms]
        wrong_syns = []
        for w in random.sample(other_words, min(5, len(other_words))):
            ws = [s.strip() for s in w.synonyms.split(";") if s.strip()]
            if ws:
                wrong_syns.append(ws[0])
            if len(wrong_syns) >= 3:
                break

        if len(wrong_syns) < 3:
            continue

        options = [correct] + wrong_syns[:3]
        random.shuffle(options)

        questions.append({
            "id": word.id,
            "word": word.word.capitalize(),
            "question_type": "synonym",
            "options": options,
            "correct_answer": correct,
        })

    return questions


def save_quiz_result(db: Session, user_id: int, score: int, total: int, quiz_type: str = "vocabulary") -> QuizResult:
    """Save a quiz result to the database."""
    result = QuizResult(
        user_id=user_id,
        score=score,
        total=total,
        quiz_type=quiz_type,
    )
    db.add(result)
    db.commit()
    db.refresh(result)
    return result


def get_user_quiz_results(db: Session, user_id: int, limit: int = 20) -> List[QuizResult]:
    """Get quiz results for a user."""
    return (
        db.query(QuizResult)
        .filter(QuizResult.user_id == user_id)
        .order_by(QuizResult.taken_at.desc())
        .limit(limit)
        .all()
    )


def get_flashcard_word(db: Session) -> dict:
    """Get a random word for flashcard practice."""
    count = db.query(Word).count()
    if count == 0:
        return None
    offset = random.randint(0, count - 1)
    word = db.query(Word).offset(offset).first()
    if not word:
        return None
    return {
        "id": word.id,
        "word": word.word.capitalize(),
        "meaning": word.meaning,
        "pos": word.pos,
        "example": word.example,
        "synonyms": [s.strip() for s in word.synonyms.split(";") if s.strip()] if word.synonyms else [],
        "phonetic": word.phonetic,
    }
