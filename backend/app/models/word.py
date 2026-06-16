from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from app.database.db import Base


class Word(Base):
    __tablename__ = "words"

    id = Column(Integer, primary_key=True, index=True)
    word = Column(String(100), index=True, nullable=False)
    meaning = Column(Text, nullable=False)
    pos = Column(String(50), nullable=True)  # part of speech
    synonyms = Column(Text, nullable=True)   # semicolon-separated
    antonyms = Column(Text, nullable=True)   # semicolon-separated
    example = Column(Text, nullable=True)
    phonetic = Column(String(200), nullable=True)
    frequency = Column(Integer, default=0)   # usage frequency rank

    favorites = relationship("Favorite", back_populates="word", cascade="all, delete-orphan")
