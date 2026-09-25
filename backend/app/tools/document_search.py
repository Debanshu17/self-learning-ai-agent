from typing import Any
from pydantic import BaseModel
from .base import BaseTool

class DocumentSearchInput(BaseModel):
    query: str
    n_results: int = 3

class DocumentSearchTool(BaseTool):
    name = "document_search"
    description = "Searches uploaded documents for the given query."
    input_schema = DocumentSearchInput
    
    def __init__(self, vector_store=None):
        self.vs = vector_store
    
    def execute(self, query: str, n_results: int = 3, **kwargs) -> Any:
        if not self.vs:
            return "Error: VectorStore not initialized."
            
        results = self.vs.similarity_search(query, n_results=n_results)
        if not results:
            return "No relevant documents found."
            
        formatted = []
        for r in results:
            meta = r.get("metadata", {})
            source = meta.get("source", "unknown")
            formatted.append(f"Source: {source}\nContent: {r['content']}")
            
        return "\n\n---\n\n".join(formatted)
