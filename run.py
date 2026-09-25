import subprocess
import os
import sys
import time

def start_backend():
    print("Starting FastAPI backend...")
    return subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "main:app", "--reload", "--host", "127.0.0.1", "--port", "8000"],
        cwd=os.path.join(os.path.dirname(__file__), "backend")
    )

def start_frontend():
    print("Starting React frontend...")
    return subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=os.path.join(os.path.dirname(__file__), "frontend"),
        shell=True
    )

if __name__ == "__main__":
    backend = start_backend()
    frontend = start_frontend()
    
    print("\nSelf-Learning AI Agent started!")
    print("Backend API: http://127.0.0.1:8000/api")
    print("Frontend UI: http://localhost:5173\n")
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("Shutting down...")
        backend.terminate()
        frontend.terminate()
        sys.exit(0)
