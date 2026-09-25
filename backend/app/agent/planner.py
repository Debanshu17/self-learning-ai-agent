import logging
from typing import List, Optional
from pydantic import BaseModel
from app.llm.base import BaseLLMProvider
from app.schemas.agent import PlanStep, AgentState

logger = logging.getLogger(__name__)

class PlannerResult(BaseModel):
    needs_plan: bool
    reason: str
    steps: List[PlanStep] = []

class Planner:
    def __init__(self, llm_provider: BaseLLMProvider):
        self.llm = llm_provider
        
    def create_plan(self, state: AgentState) -> AgentState:
        """Determines if a plan is needed and generates one if so."""
        logger.info("Planner analyzing task...")
        
        system_prompt = (
            "You are an expert AI task planner. Analyze the user's request. "
            "If the request is simple (like greeting, simple factual question, or basic math), set 'needs_plan' to false. "
            "If the request is complex (multi-step operations, coding, research, comparisons), set 'needs_plan' to true, "
            "and break it down into a logical sequence of steps. "
            "Return valid JSON matching the schema."
        )
        
        prompt = f"User Request: {state.user_input}"
        
        try:
            result = self.llm.generate_structured(
                prompt=prompt,
                response_schema=PlannerResult,
                system_prompt=system_prompt
            )
            
            logger.info(f"Planner decision: needs_plan={result.needs_plan} ({result.reason})")
            
            if result.needs_plan and result.steps:
                state.plan = result.steps
                state.goal = result.reason
            else:
                state.plan = []
                
        except Exception as e:
            logger.error(f"Planner failed: {e}")
            # Fallback to no plan on error to let the agent try to answer directly
            state.plan = []
            
        return state
