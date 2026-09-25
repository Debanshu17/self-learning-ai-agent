from app.schemas.agent import AgentState
from app.llm.base import BaseLLMProvider
from app.agent.planner import Planner
from app.learning.evaluator import Evaluator
from app.learning.learner import LearningEngine
from app.memory.vector_store import VectorStore
from app.database.repositories import MemoryRepository
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class AgentOrchestrator:
    """Core loop orchestrating the agent's behavior."""
    
    def __init__(self, llm_provider: BaseLLMProvider, vector_store: VectorStore, db_repo: MemoryRepository):
        self.llm = llm_provider
        self.vs = vector_store
        self.db = db_repo
        self.planner = Planner(llm_provider)
        self.evaluator = Evaluator(llm_provider)
        self.learner = LearningEngine(llm_provider, vector_store, db_repo)

    def run(self, user_input: str) -> AgentState:
        """Run the main agent loop for a given user input."""
        logger.info(f"Starting agent task for input: {user_input}")
        
        state = AgentState(user_input=user_input)
        
        try:
            # Phase 6 & 9: Retrieve relevant memories/lessons
            retrieved = self.vs.similarity_search(user_input, n_results=3, filter_metadata={"type": "lesson"})
            if retrieved:
                lessons = [r['content'] for r in retrieved]
                state.retrieved_memories = lessons
                logger.info(f"Retrieved lessons: {lessons}")
                
            state.status = "planning"
            
            # Phase 3: Planner
            state = self.planner.create_plan(state)
            
            state.status = "executing"
            retries = 0
            
            while retries <= settings.MAX_EVALUATION_RETRIES:
                context_str = ""
                if state.retrieved_memories:
                    context_str = "Keep these past lessons in mind:\n- " + "\n- ".join(state.retrieved_memories) + "\n\n"
                    
                if state.plan and retries == 0:
                    plan_str = "\n".join([f"{s.step_number}. {s.description}" for s in state.plan])
                    prompt = f"{context_str}User asks: {user_input}\nHere is the plan to follow:\n{plan_str}\n\nPlease execute this plan and provide a comprehensive final response."
                elif retries > 0 and state.evaluation:
                    prompt = (
                        f"{context_str}Your previous response failed evaluation.\n"
                        f"Problems identified: {state.evaluation.problems}\n"
                        f"Missing info: {state.evaluation.missing_information}\n"
                        f"Improvement needed: {state.evaluation.suggested_improvement}\n\n"
                        f"Please rewrite your response to address these issues."
                    )
                else:
                    prompt = f"{context_str}User asks: {user_input}\nPlease provide a helpful response."
                    
                # Phase 4 (Stubbed Executor loop - currently just single shot generation)
                response_text = self.llm.generate(
                    prompt=prompt,
                    system_prompt="You are a helpful AI assistant."
                )
                
                state.draft_response = response_text
                state.status = "evaluating"
                
                # Phase 8: Evaluator
                eval_result = self.evaluator.evaluate(state)
                state.evaluation = eval_result
                
                if eval_result.passed:
                    logger.info("Evaluation passed.")
                    break
                else:
                    logger.warning(f"Evaluation failed. Retrying... ({retries + 1}/{settings.MAX_EVALUATION_RETRIES})")
                    retries += 1
                    
            state.final_response = state.draft_response
            
            # Phase 9: Learning Engine
            state.status = "learning"
            self.learner.process_experience(state)
            
            state.status = "completed"
            
        except Exception as e:
            logger.error(f"Task failed: {e}")
            state.error_info = str(e)
            state.status = "error"
            
        return state
