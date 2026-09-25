import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    LLM_PROVIDER: str = "ollama"
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.2"

    DATABASE_URL: str = "sqlite:///../data/agent.db"

    EVALUATION_THRESHOLD: float = 0.75
    MAX_AGENT_STEPS: int = 8
    MAX_TOOL_CALLS: int = 5
    MAX_EVALUATION_RETRIES: int = 0

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
