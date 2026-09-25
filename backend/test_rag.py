import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.llm.ollama_provider import OllamaProvider
from app.memory.vector_store import VectorStore
from app.learning.document_ingestion import DocumentIngester
from app.tools.document_search import DocumentSearchTool

def test_rag():
    print("Testing RAG & Document Ingestion...")
    provider = OllamaProvider()
    vs = VectorStore(llm_provider=provider, persist_directory="../data/chroma_rag_test", collection_name="rag_test")
    
    # Create a dummy markdown file
    with open("dummy.md", "w") as f:
        f.write("# Dummy Doc\nThis is a dummy document talking about quantum entanglement.")
        
    ingester = DocumentIngester(vector_store=vs)
    chunks = ingester.ingest_file("dummy.md", "dummy.md")
    print(f"Ingested {chunks} chunks.")
    
    search_tool = DocumentSearchTool(vector_store=vs)
    res = search_tool.execute("quantum")
    print(f"Search result: {res}")
    
    assert "dummy.md" in res
    assert "quantum entanglement" in res
    
    os.remove("dummy.md")
    print("RAG test passed!")

if __name__ == "__main__":
    try:
        test_rag()
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"RAG test failed: {e}")
