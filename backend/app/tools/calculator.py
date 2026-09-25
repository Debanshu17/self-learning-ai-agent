from typing import Any
from pydantic import BaseModel
from .base import BaseTool

class CalculatorInput(BaseModel):
    expression: str

class CalculatorTool(BaseTool):
    name = "calculator"
    description = "Evaluates basic mathematical expressions. Do not use for complex code."
    input_schema = CalculatorInput
    
    def execute(self, expression: str, **kwargs) -> Any:
        # Very restricted eval for basic math only
        allowed_names = {"abs": abs, "round": round, "min": min, "max": max}
        import ast
        import operator as op
        
        operators = {
            ast.Add: op.add, ast.Sub: op.sub, ast.Mult: op.mul,
            ast.Div: op.truediv, ast.Pow: op.pow, ast.USub: op.neg
        }
        
        def eval_expr(node):
            if isinstance(node, ast.Constant):
                return node.value
            elif isinstance(node, ast.BinOp):
                return operators[type(node.op)](eval_expr(node.left), eval_expr(node.right))
            elif isinstance(node, ast.UnaryOp):
                return operators[type(node.op)](eval_expr(node.operand))
            else:
                raise TypeError(f"Unsupported mathematical expression.")
                
        try:
            return str(eval_expr(ast.parse(expression, mode='eval').body))
        except Exception as e:
            return f"Error evaluating expression: {e}"
