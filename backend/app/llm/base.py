from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional

class BaseLLMProvider(ABC):
    """Abstract base class for LLM providers."""

    @abstractmethod
    def generate(self, prompt: str, system_prompt: Optional[str] = None, **kwargs) -> str:
        """Generate text from a prompt."""
        pass

    @abstractmethod
    def generate_structured(self, prompt: str, response_schema: type, system_prompt: Optional[str] = None, **kwargs) -> Any:
        """Generate a structured response adhering to a given Pydantic schema."""
        pass

    @abstractmethod
    def embed(self, text: str) -> List[float]:
        """Generate embeddings for text."""
        pass
