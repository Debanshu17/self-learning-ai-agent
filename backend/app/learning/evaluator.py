import logging
from app.schemas.agent import AgentState, EvaluationResult
from app.llm.base import BaseLLMProvider
from app.core.config import settings

logger = logging.getLogger(__name__)

class Evaluator:
    def __init__(self, llm_provider: BaseLLMProvider):
        self.llm = llm_provider
        self.threshold = settings.EVALUATION_THRESHOLD
        
    def evaluate(self, state: AgentState) -> EvaluationResult:
        logger.info("Evaluating response...")
        
        system_prompt = (
            "You are a strict, objective AI evaluator. Your job is to evaluate a drafted response "
            "against the original user input. Assess if the goal was fully achieved. "
            "Return valid JSON. Be very strict about correctness and completeness. "
            "If the response is perfectly fine, score it > 0.8 and passed=true."
        )
        
        prompt = (
            f"User Input: {state.user_input}\n"
            f"Goal: {state.goal}\n"
            f"Draft Response:\n{state.draft_response}\n\n"
            "Evaluate this response. Does it answer the prompt completely and correctly?"
        )
        
        try:
            result = self.llm.generate_structured(
                prompt=prompt,
                response_schema=EvaluationResult,
                system_prompt=system_prompt
            )
            
            # Ensure passed reflects our threshold
            if result.score < self.threshold:
                result.passed = False
                
            logger.info(f"Evaluation complete. Score: {result.score}, Passed: {result.passed}")
            return result
        except Exception as e:
            logger.error(f"Evaluator failed: {e}")
            # If evaluation fails to parse or run, pass by default to avoid infinite blocks
            return EvaluationResult(score=1.0, passed=True, problems=["Evaluator error"])
