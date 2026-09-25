from typing import Any
from pydantic import BaseModel
import os
from .base import BaseTool

class FileToolInput(BaseModel):
    path: str

class FileTool(BaseTool):
    name = "read_file"
    description = "Reads a local text file."
    input_schema = FileToolInput
    
    def execute(self, path: str, **kwargs) -> Any:
        if not os.path.exists(path):
            return f"Error: File {path} does not exist."
            
        try:
            with open(path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            return f"Error reading file: {e}"
