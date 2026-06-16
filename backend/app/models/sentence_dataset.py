from sqlalchemy import Column, Integer, String, Text
from app.database.db import Base


class SentenceDataset(Base):
    __tablename__ = "sentence_dataset"

    id = Column(Integer, primary_key=True, index=True)
    sentence = Column(Text, nullable=False)
    meaning = Column(Text, nullable=False)
    tense = Column(String(100), nullable=True)
