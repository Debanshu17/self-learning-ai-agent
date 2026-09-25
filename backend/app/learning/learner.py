import logging
from typing import Optional
from pydantic import BaseModel
from app.schemas.agent import AgentState
from app.llm.base import BaseLLMProvider
from app.memory.vector_store import VectorStore
from app.database.repositories import MemoryRepository

logger = logging.getLogger(__name__)

class LessonExtractionResult(BaseModel):
    mistake: Optional[str] = None
    lesson: Optional[str] = None
    is_important: bool = False

class LearningEngine:
    def __init__(self, llm_provider: BaseLLMProvider, vector_store: VectorStore, db_repo: MemoryRepository):
        self.llm = llm_provider
        self.vs = vector_store
        self.db = db_repo
        
    def process_experience(self, state: AgentState, user_feedback: Optional[str] = None) -> None:
        """Extracts lessons from an agent's state or user feedback and stores them."""
        logger.info(f"Processing experience for task: {state.task_id}")
        
        system_prompt = (
            "You are a meta-learning module for an AI agent. Analyze the interaction. "
            "Identify if a mistake was made, or if there is a generalizable lesson to learn. "
            "A lesson must be a general principle, e.g., 'When explaining recursion, explicitly define the base case.' "
            "Return valid JSON. If no lesson is needed, set is_important to false."
        )
        
        eval_issues = ""
        if state.evaluation and not state.evaluation.passed:
            eval_issues = f"Evaluator feedback: {state.evaluation.problems}. Suggested fix: {state.evaluation.suggested_improvement}."
            
        feedback_text = f"User Feedback: {user_feedback}" if user_feedback else "No direct user feedback."
        
        prompt = (
            f"User Goal: {state.user_input}\n"
            f"Final Response: {state.final_response}\n"
            f"{eval_issues}\n"
            f"{feedback_text}\n\n"
            "Extract any mistake and formulate a general lesson."
        )
        
        try:
            result = self.llm.generate_structured(
                prompt=prompt,
                response_schema=LessonExtractionResult,
                system_prompt=system_prompt
            )
            
            if result.is_important and result.lesson:
                logger.info(f"Learned new lesson: {result.lesson}")
                # Store in SQLite (Long-term)
                self.db.add_memory(
                    content=result.lesson,
                    category="lesson",
                    source="learning_engine",
                    importance=0.9
                )
                
                # Store in Chroma (Semantic)
                self.vs.add_texts(
                    texts=[result.lesson],
                    metadatas=[{"type": "lesson", "source": "learning_engine", "task_id": state.task_id}]
                )
                state.lessons.append(result.lesson)
                
        except Exception as e:
            logger.error(f"Learning Engine failed: {e}")
