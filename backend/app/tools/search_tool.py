from typing import Any
from pydantic import BaseModel
from ddgs import DDGS
from .base import BaseTool

class SearchToolInput(BaseModel):
    query: str
    max_results: int = 3

class SearchTool(BaseTool):
    name = "web_search"
    description = "Searches the web using DuckDuckGo."
    input_schema = SearchToolInput
    
    def execute(self, query: str, max_results: int = 3, **kwargs) -> Any:
        try:
            with DDGS() as ddgs:
                results = list(ddgs.text(query, max_results=max_results))
                
            if not results:
                return "No results found."
                
            formatted = []
            for r in results:
                formatted.append(f"Title: {r.get('title')}\nURL: {r.get('href')}\nSnippet: {r.get('body')}")
                
            return "\n\n".join(formatted)
        except Exception as e:
            return f"Web search failed: {e}"
