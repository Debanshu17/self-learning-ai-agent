import sys
import os

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.llm.ollama_provider import OllamaProvider
from pydantic import BaseModel

class CapitalResponse(BaseModel):
    capital: str
    country: str

def test_basic_generation():
    print("Testing basic generation...")
    provider = OllamaProvider()
    response = provider.generate("What is the capital of France? Reply in a single sentence.")
    print(f"Response: {response}")
    assert "Paris" in response
    print("Basic generation passed.\n")

def test_structured_generation():
    print("Testing structured generation...")
    provider = OllamaProvider()
    
    response = provider.generate_structured(
        prompt="What is the capital of Japan?",
        response_schema=CapitalResponse
    )
    print(f"Response: {response}")
    assert response.capital == "Tokyo"
    assert response.country == "Japan"
    print("Structured generation passed.\n")

if __name__ == "__main__":
    try:
        test_basic_generation()
        test_structured_generation()
        print("All Phase 1 LLM tests passed successfully!")
    except Exception as e:
        print(f"Test failed: {e}")
