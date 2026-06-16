from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.word import Word
from typing import List, Optional


def search_word(db: Session, query: str) -> Optional[Word]:
    """Search for an exact word match (case-insensitive).
    If not found in the database, queries WordNet and seeds the database.
    """
    query_clean = query.lower().strip()
    # 1. Search database first
    word = db.query(Word).filter(func.lower(Word.word) == query_clean).first()
    if word:
        return word
    
    # 2. Try WordNet lookup
    try:
        from nltk.corpus import wordnet
        synsets = wordnet.synsets(query_clean)
        if synsets:
            meaning = synsets[0].definition()
            
            wn_pos = synsets[0].pos()
            pos_map = {'n': 'noun', 'v': 'verb', 'a': 'adjective', 's': 'adjective', 'r': 'adverb'}
            pos = pos_map.get(wn_pos, 'noun')
            
            syns = set()
            for syn in synsets:
                for lemma in syn.lemmas():
                    name = lemma.name().replace('_', ' ')
                    if name != query_clean:
                        syns.add(name)
            synonyms_str = "; ".join(list(syns)[:10])
            
            ants = set()
            for syn in synsets:
                for lemma in syn.lemmas():
                    for ant in lemma.antonyms():
                        ants.add(ant.name().replace('_', ' '))
            antonyms_str = "; ".join(list(ants)[:10])
            
            examples = synsets[0].examples()
            example = examples[0] if examples else ""
            
            new_word = Word(
                word=query_clean,
                meaning=meaning,
                pos=pos,
                synonyms=synonyms_str,
                antonyms=antonyms_str,
                example=example,
                phonetic="",
                frequency=0
            )
            db.add(new_word)
            db.commit()
            db.refresh(new_word)
            return new_word
    except Exception as e:
        print(f"[WordNet] Error during lookup/seed for '{query_clean}': {e}")
        
    return None


def search_word_fuzzy(db: Session, query: str) -> List[Word]:
    """Search for words containing the query string."""
    return (
        db.query(Word)
        .filter(Word.word.ilike(f"%{query.strip()}%"))
        .limit(20)
        .all()
    )


def get_suggestions(db: Session, prefix: str, limit: int = 10) -> List[str]:
    """Get autocomplete suggestions based on prefix."""
    words = (
        db.query(Word.word)
        .filter(Word.word.ilike(f"{prefix.strip()}%"))
        .order_by(Word.frequency.desc())
        .limit(limit)
        .all()
    )
    return [w[0] for w in words]


def format_word_result(word: Word) -> dict:
    """Format a Word model instance into a response dictionary."""
    return {
        "id": word.id,
        "word": word.word.capitalize(),
        "meaning": word.meaning,
        "pos": word.pos.capitalize() if word.pos else "Unknown",
        "synonyms": [s.strip() for s in word.synonyms.split(";") if s.strip()] if word.synonyms else [],
        "antonyms": [a.strip() for a in word.antonyms.split(";") if a.strip()] if word.antonyms else [],
        "example": word.example or "",
        "phonetic": word.phonetic or "",
        "frequency": word.frequency,
    }


def get_all_words(db: Session, skip: int = 0, limit: int = 50) -> List[Word]:
    """Get paginated list of all words."""
    return db.query(Word).order_by(Word.word).offset(skip).limit(limit).all()


def get_word_count(db: Session) -> int:
    """Get total count of words in the database."""
    return db.query(Word).count()
