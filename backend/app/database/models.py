from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, JSON
from sqlalchemy.sql import func
from .database import Base

class MemoryModel(Base):
    __tablename__ = "memories"
    
    id = Column(Integer, primary_key=True, index=True)
    content = Column(String, nullable=False)
    category = Column(String, index=True) # user_preference, fact, lesson, correction
    source = Column(String) # user, agent, document, tool
    importance = Column(Float, default=0.5)
    confidence = Column(Float, default=1.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

class ExperienceModel(Base):
    __tablename__ = "experiences"
    
    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(String, index=True)
    task = Column(String)
    plan = Column(JSON)
    tools_used = Column(JSON)
    response = Column(String)
    evaluation_score = Column(Float)
    mistakes = Column(JSON)
    lesson = Column(String)
    success = Column(Boolean)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
class DocumentModel(Base):
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String)
    content_type = Column(String)
    file_path = Column(String)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
