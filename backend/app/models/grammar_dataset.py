from sqlalchemy import Column, Integer, String, Text
from app.database.db import Base


class GrammarDataset(Base):
    __tablename__ = "grammar_dataset"

    id = Column(Integer, primary_key=True, index=True)
    word = Column(String(100), index=True, nullable=False)
    pos = Column(String(50), nullable=False)
    tense_form = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
