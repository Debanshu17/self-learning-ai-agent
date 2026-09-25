import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.memory.vector_store import VectorStore
from app.llm.ollama_provider import OllamaProvider

def test_vector_store():
    print("Testing VectorStore...")
    provider = OllamaProvider()
    vs = VectorStore(llm_provider=provider, persist_directory="../data/chroma_test", collection_name="test")
    
    docs = [
        "The capital of France is Paris.",
        "The capital of Japan is Tokyo.",
        "Python is a programming language."
    ]
    metas = [{"source": "wiki"}, {"source": "wiki"}, {"source": "tech"}]
    
    print("Adding texts...")
    vs.add_texts(docs, metas)
    
    print("Searching...")
    results = vs.similarity_search("What is France's capital?")
    print(f"Top result: {results[0]['content']}")
    
    assert len(results) > 0
    print("VectorStore test passed!")

if __name__ == "__main__":
    try:
        test_vector_store()
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"VectorStore test failed: {e}")
