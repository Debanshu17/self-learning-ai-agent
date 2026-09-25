# Self-Learning AI Agent

A production-quality AI agent built entirely around local LLMs (Ollama). This agent doesn't just answer questions—it plans, executes, evaluates its own responses, and learns from its mistakes and your feedback using semantic long-term memory.

## Architecture

* **LLM Core**: `llama3.2` running locally via Ollama (Zero Cost).
* **Memory**: SQLite (Long-term facts) + ChromaDB (Semantic Vector Store).
* **Agent Engine**: Custom orchestrator with Planning, Tool execution, Self-Evaluation, and a Learning Engine.
* **Backend**: FastAPI (Python).
* **Frontend**: React + Vite + Tailwind CSS.

## Features

- 🧠 **Learning Engine**: Extracts generalizable lessons from interactions and stores them.
- 🔄 **Self-Correction**: Evaluates drafted responses and retries if they are incomplete.
- 💾 **Dual Memory**: Long-term SQLite storage combined with ChromaDB for RAG context.
- 🛠️ **Tool System**: Includes a secure sandboxed python environment, local file reader, and web search (using duckduckgo).
- 🎨 **Modern UI**: Clean React interface to chat and submit explicit feedback on specific tasks.

## Setup Instructions

### Prerequisites
1. Install [Ollama](https://ollama.com/)
2. Run `ollama run llama3.2` in your terminal to download the model.

### 1. Install Backend
```bash
cd backend
python -m venv venv
# Activate venv:
# Windows: .\venv\Scripts\activate
# Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
```

### 2. Install Frontend
```bash
cd frontend
npm install
```

### 3. Run the Full Application
At the root of the project, run:
```bash
# Ensure you are using the virtual environment
python run.py
```
This will start both the FastAPI backend and the React frontend simultaneously!
Visit `http://localhost:5173` in your browser.

## Offline Capabilities
If you run without an internet connection, the agent uses a fallback mock embedding system so that the database and learning loop continue to function locally without crashing. To use real offline semantic search, you can pull a local model like `nomic-embed-text` and configure the vector store to use it.
