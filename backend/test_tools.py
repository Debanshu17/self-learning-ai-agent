import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.tools.calculator import CalculatorTool
from app.tools.python_tool import PythonTool
from app.tools.file_tool import FileTool
from app.tools.search_tool import SearchTool
from app.tools.document_search import DocumentSearchTool

def test_tools():
    print("Testing Calculator...")
    calc = CalculatorTool()
    res = calc.execute("2 + 2 * 3")
    print(f"Calc result: {res}")
    assert res == "8"
    
    print("Testing PythonTool...")
    pt = PythonTool()
    res = pt.execute("print('hello world')")
    assert res == "hello world"
    
    print("Testing SearchTool...")
    st = SearchTool()
    res = st.execute("Capital of France")
    print(f"Search result: {res}")
    assert "Paris" in res
    
    print("All tool tests passed!")

if __name__ == "__main__":
    try:
        test_tools()
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Tool test failed: {e}")
