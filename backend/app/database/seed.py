import csv
import os
from sqlalchemy.orm import Session
from app.database.db import engine, Base, SessionLocal
from app.models.user import User
from app.models.word import Word
from app.models.sentence_dataset import SentenceDataset
from app.models.grammar_dataset import GrammarDataset
from app.config import DATASETS_DIR
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_tables():
    """Create all database tables."""
    Base.metadata.create_all(bind=engine)


def seed_admin_user(db: Session):
    """Create default admin user if not exists."""
    existing = db.query(User).filter(User.email == "admin@lexilearn.com").first()
    if existing:
        return
    admin = User(
        full_name="Admin User",
        email="admin@lexilearn.com",
        username="admin",
        hashed_password=pwd_context.hash("Admin@123"),
        is_admin=True,
    )
    db.add(admin)
    db.commit()
    print("[SEED] Admin user created: admin@lexilearn.com / Admin@123")


def seed_words(db: Session):
    """Import words from CSV dataset."""
    if db.query(Word).count() > 0:
        return
    csv_path = os.path.join(DATASETS_DIR, "words.csv")
    if not os.path.exists(csv_path):
        print(f"[SEED] words.csv not found at {csv_path}")
        return
    count = 0
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
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
    print(f"[SEED] Imported {count} words from words.csv")


def seed_sentences(db: Session):
    """Import sentences from CSV dataset."""
    if db.query(SentenceDataset).count() > 0:
        return
    csv_path = os.path.join(DATASETS_DIR, "sentences.csv")
    if not os.path.exists(csv_path):
        print(f"[SEED] sentences.csv not found at {csv_path}")
        return
    count = 0
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            sentence = SentenceDataset(
                sentence=row.get("sentence", "").strip(),
                meaning=row.get("meaning", "").strip(),
                tense=row.get("tense", "").strip(),
            )
            db.add(sentence)
            count += 1
    db.commit()
    print(f"[SEED] Imported {count} sentences from sentences.csv")


def seed_grammar(db: Session):
    """Import grammar data from CSV dataset."""
    if db.query(GrammarDataset).count() > 0:
        return
    csv_path = os.path.join(DATASETS_DIR, "grammar.csv")
    if not os.path.exists(csv_path):
        print(f"[SEED] grammar.csv not found at {csv_path}")
        return
    count = 0
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            entry = GrammarDataset(
                word=row.get("word", "").strip().lower(),
                pos=row.get("pos", "").strip(),
                tense_form=row.get("tense_form", "").strip(),
                description=row.get("description", "").strip(),
            )
            db.add(entry)
            count += 1
    db.commit()
    print(f"[SEED] Imported {count} grammar entries from grammar.csv")


def seed_all():
    """Run all seed functions."""
    create_tables()
    db = SessionLocal()
    try:
        seed_admin_user(db)
        seed_words(db)
        seed_sentences(db)
        seed_grammar(db)
        print("[SEED] Database seeding complete!")
    finally:
        db.close()


if __name__ == "__main__":
    seed_all()
