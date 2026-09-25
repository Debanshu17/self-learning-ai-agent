from abc import ABC, abstractmethod
from typing import Any, Dict, Type
from pydantic import BaseModel

class BaseTool(ABC):
    name: str
    description: str
    input_schema: Type[BaseModel]
    
    @abstractmethod
    def execute(self, **kwargs) -> Any:
        pass
