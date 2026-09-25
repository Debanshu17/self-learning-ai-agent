from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any

from app.database.database import get_db, engine, Base
from app.database.repositories import MemoryRepository
from app.llm.ollama_provider import OllamaProvider
from app.memory.vector_store import VectorStore
from app.agent.orchestrator import AgentOrchestrator
from app.learning.document_ingestion import DocumentIngester
import os
import uuid

router = APIRouter()

# Initialize core dependencies at startup
Base.metadata.create_all(bind=engine)
llm_provider = OllamaProvider()
vector_store = VectorStore(llm_provider=llm_provider)

def get_orchestrator(db=Depends(get_db)):
    repo = MemoryRepository(db)
    return AgentOrchestrator(llm_provider=llm_provider, vector_store=vector_store, db_repo=repo)

class ChatRequest(BaseModel):
    message: str

class FeedbackRequest(BaseModel):
    task_id: str
    feedback: str

# In-memory store of recent states for feedback
recent_tasks: Dict[str, Any] = {}

@router.post("/chat")
def chat(request: ChatRequest, orchestrator: AgentOrchestrator = Depends(get_orchestrator)):
    try:
        state = orchestrator.run(request.message)
        recent_tasks[state.task_id] = state
        return {
            "task_id": state.task_id,
            "response": state.final_response,
            "plan": [s.dict() for s in state.plan] if state.plan else None,
            "lessons": state.lessons
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/feedback")
def submit_feedback(request: FeedbackRequest, orchestrator: AgentOrchestrator = Depends(get_orchestrator)):
    state = recent_tasks.get(request.task_id)
    if not state:
        raise HTTPException(status_code=404, detail="Task not found or expired")
        
    orchestrator.learner.process_experience(state, user_feedback=request.feedback)
    return {"status": "Feedback processed", "lessons_learned": state.lessons}

@router.get("/history")
def get_history():
    # Return recent tasks from memory
    return {"tasks": list(recent_tasks.values())}

@router.get("/knowledge")
def get_knowledge(orchestrator: AgentOrchestrator = Depends(get_orchestrator)):
    memories = orchestrator.db.get_recent_memories(limit=20)
    return {"knowledge": [{"id": m.id, "content": m.content, "category": m.category} for m in memories]}

@router.post("/upload")
def upload_document(file: UploadFile = File(...)):
    if not file.filename.endswith(('.txt', '.md', '.pdf')):
        raise HTTPException(status_code=400, detail="Only TXT, MD, and PDF files are supported.")
        
    temp_path = f"../data/uploads/{uuid.uuid4()}_{file.filename}"
    os.makedirs(os.path.dirname(temp_path), exist_ok=True)
    
    with open(temp_path, "wb") as f:
        f.write(file.file.read())
        
    ingester = DocumentIngester(vector_store)
    try:
        chunks = ingester.ingest_file(temp_path, file.filename)
        return {"status": "Document ingested", "chunks_processed": chunks, "filename": file.filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
