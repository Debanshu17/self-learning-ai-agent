import httpx
import json
import logging
from typing import Any, Dict, List, Optional
from pydantic import BaseModel
from .base import BaseLLMProvider
from app.core.config import settings

logger = logging.getLogger(__name__)

class OllamaProvider(BaseLLMProvider):
    """LLM Provider implementation for local Ollama."""

    def __init__(self, base_url: str = settings.OLLAMA_BASE_URL, model: str = settings.OLLAMA_MODEL):
        self.base_url = base_url
        self.model = model
        self.client = httpx.Client(timeout=60.0)

    def generate(self, prompt: str, system_prompt: Optional[str] = None, **kwargs) -> str:
        url = f"{self.base_url}/api/generate"
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
        }
        if system_prompt:
            payload["system"] = system_prompt
        
        # Merge any extra kwargs (like temperature)
        if kwargs:
            payload["options"] = kwargs

        try:
            response = self.client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            return data.get("response", "")
        except httpx.HTTPError as e:
            logger.error(f"HTTP error occurred while contacting Ollama: {e}")
            raise
        except Exception as e:
            logger.error(f"An error occurred: {e}")
            raise

    def generate_structured(self, prompt: str, response_schema: type[BaseModel], system_prompt: Optional[str] = None, **kwargs) -> Any:
        """
        Attempts to generate structured output matching the provided Pydantic schema.
        We instruct the model to return JSON and parse it.
        """
        schema_json = response_schema.model_json_schema()
        
        # Append instructions for structured output
        instruction = f"\n\nYou must respond ONLY with a valid JSON object that matches the following JSON Schema:\n{json.dumps(schema_json, indent=2)}\n\nDo not include any markdown formatting, explanations, or extra text. Output purely the JSON object."
        
        full_prompt = prompt + instruction
        
        url = f"{self.base_url}/api/generate"
        payload = {
            "model": self.model,
            "prompt": full_prompt,
            "stream": False,
            "format": "json" # Ollama supports format=json
        }
        if system_prompt:
            payload["system"] = system_prompt
            
        if kwargs:
            payload["options"] = kwargs

        try:
            response = self.client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            response_text = data.get("response", "")
            
            # Parse and validate with Pydantic
            parsed_data = json.loads(response_text)
            return response_schema.model_validate(parsed_data)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {e}\nResponse text: {response_text}")
            raise ValueError("LLM did not return valid JSON") from e
        except Exception as e:
            logger.error(f"Error generating structured response: {e}")
            raise

    def embed(self, text: str) -> List[float]:
        """Generate embeddings using Ollama (can be configured to use a different embedding model later)."""
        url = f"{self.base_url}/api/embed"
        payload = {
            "model": self.model,
            "input": text
        }
        try:
            response = self.client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            # The new API returns a list of embeddings under 'embeddings'
            embeddings = data.get("embeddings", [])
            return embeddings[0] if embeddings else []
        except Exception as e:
            logger.error(f"Error generating embeddings: {e}")
            raise
