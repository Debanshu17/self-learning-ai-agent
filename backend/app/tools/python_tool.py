from typing import Any
from pydantic import BaseModel
import subprocess
import tempfile
import os
from .base import BaseTool

class PythonToolInput(BaseModel):
    code: str

class PythonTool(BaseTool):
    name = "python_execution"
    description = "Executes python code in a sandboxed subprocess and returns stdout."
    input_schema = PythonToolInput
    
    def execute(self, code: str, **kwargs) -> Any:
        try:
            with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
                f.write(code)
                temp_path = f.name
                
            # Run with a 10 second timeout
            result = subprocess.run(
                ['python', temp_path],
                capture_output=True,
                text=True,
                timeout=10
            )
            
            os.remove(temp_path)
            
            if result.returncode == 0:
                return result.stdout.strip()
            else:
                return f"Error: {result.stderr.strip()}"
                
        except subprocess.TimeoutExpired:
            return "Error: Execution timed out after 10 seconds."
        except Exception as e:
            return f"Execution error: {e}"
