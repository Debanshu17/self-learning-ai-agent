from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid

class Message(BaseModel):
    role: str # "user", "assistant", "system", "tool"
    content: str

class PlanStep(BaseModel):
    step_number: int
    description: str
    completed: bool = False

class EvaluationResult(BaseModel):
    score: float
    passed: bool
    problems: List[str] = []
    missing_information: List[str] = []
    suggested_improvement: str = ""

class AgentState(BaseModel):
    task_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_input: str
    goal: Optional[str] = None
    plan: List[PlanStep] = []
    current_step: int = 0
    messages: List[Message] = []
    retrieved_memories: List[str] = []
    selected_tools: List[str] = []
    tool_results: Dict[str, Any] = {}
    draft_response: Optional[str] = None
    evaluation: Optional[EvaluationResult] = None
    lessons: List[str] = []
    final_response: Optional[str] = None
    status: str = "initialized" # initialized, planning, executing, evaluating, learning, completed, error
    error_info: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
