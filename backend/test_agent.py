import sys
import os
import logging

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.llm.ollama_provider import OllamaProvider
from app.agent.orchestrator import AgentOrchestrator
from app.memory.vector_store import VectorStore
from app.database.database import Base, engine, SessionLocal
from app.database.repositories import MemoryRepository

logging.basicConfig(level=logging.INFO)

# Setup test DB
Base.metadata.create_all(bind=engine)

def get_orchestrator():
    provider = OllamaProvider()
    db = SessionLocal()
    repo = MemoryRepository(db)
    vs = VectorStore(llm_provider=provider, persist_directory="../data/chroma_test")
    return AgentOrchestrator(llm_provider=provider, vector_store=vs, db_repo=repo)

def test_basic_agent():
    print("Testing basic agent orchestrator with simple task...")
    orchestrator = get_orchestrator()
    
    state = orchestrator.run("What is 2 + 2? Answer in one word.")
    
    print(f"State status: {state.status}")
    print(f"Final response: {state.final_response}")
    print(f"Plan steps generated: {len(state.plan)}")
    
    assert state.status == "completed"
    assert len(state.plan) == 0 # Should not need a plan for this
    print("Simple task test passed!\n")

def test_complex_agent():
    print("Testing agent orchestrator with complex task...")
    orchestrator = get_orchestrator()
    
    state = orchestrator.run("Teach me Redis and compare it with PostgreSQL.")
    
    print(f"State status: {state.status}")
    print(f"Goal: {state.goal}")
    print(f"Plan steps generated: {len(state.plan)}")
    for step in state.plan:
        print(f"  {step.step_number}. {step.description}")
        
    assert state.status == "completed"
    assert len(state.plan) > 0 # Should require a plan
    print("Complex task test passed!\n")

if __name__ == "__main__":
    try:
        test_basic_agent()
        test_complex_agent()
        print("All agent tests passed!")
    except Exception as e:
        print(f"Test failed: {e}")
