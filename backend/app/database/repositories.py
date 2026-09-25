from sqlalchemy.orm import Session
from .models import MemoryModel, ExperienceModel
from typing import List, Optional

class MemoryRepository:
    def __init__(self, db_session: Session):
        self.db = db_session
        
    def add_memory(self, content: str, category: str, source: str, importance: float = 0.5, confidence: float = 1.0) -> MemoryModel:
        memory = MemoryModel(
            content=content, 
            category=category, 
            source=source, 
            importance=importance,
            confidence=confidence
        )
        self.db.add(memory)
        self.db.commit()
        self.db.refresh(memory)
        return memory
        
    def get_memories_by_category(self, category: str, limit: int = 50) -> List[MemoryModel]:
        return self.db.query(MemoryModel).filter(MemoryModel.category == category).order_by(MemoryModel.importance.desc()).limit(limit).all()
        
    def get_recent_memories(self, limit: int = 50) -> List[MemoryModel]:
        return self.db.query(MemoryModel).order_by(MemoryModel.created_at.desc()).limit(limit).all()
