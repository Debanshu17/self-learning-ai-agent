# Self-Learning AI Agent Workspace

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Available%20Online-E60000?style=for-the-badge&logo=googlechrome&logoColor=white)](https://debanshu17.github.io/self-learning-ai-agent/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Debanshu17/self-learning-ai-agent)

🌐 **Live Web Application:** [https://debanshu17.github.io/self-learning-ai-agent/](https://debanshu17.github.io/self-learning-ai-agent/)

An autonomous, self-improving AI agent workspace that bridges the gap between static LLMs and dynamic, agentic workflows. Instead of just answering questions, this agent can break complex goals into actionable plans, execute code and file tools in an iterative loop, verify its own work, and—most importantly—extract semantic lessons from its successes and failures to store in a long-term Memory Repository.

## 🚀 What It Does

The application provides a sleek, real-time workspace for interacting with the agent. 

- **Workspace (Task Thread):** The primary hub. Enter a complex prompt (e.g., "Research the architecture of Agentic RAG and calculate its components"), and watch the agent stream its inner monologue in real-time. The UI visualizes the agent transitioning through `Planning -> Executing -> Evaluating -> Learning`.
- **Human-in-the-Loop (HITL) Interception:** If the agent decides to execute a tool (like running Python code or performing a web search), it will automatically pause and render an "Approve Execution" modal in the UI. You have full control over what the agent is allowed to do.
- **Knowledge Base:** The agent extracts semantic lessons from its experiences. The Knowledge tab allows you to view all the persistent lessons the agent has memorized over time via its SQLite and Vector stores. 
- **Task History:** A session history view that pulls your past task prompts and the agent's final responses directly from the backend API.

## 🛠 Tech Stack

### Backend
- **Python 3 / FastAPI**: High-performance asynchronous REST and Server-Sent Events (SSE) framework.
- **Llama 3.2 (via Ollama)**: Local, zero-cost LLM powering the core reasoning, planning, and evaluation engines.
- **SQLAlchemy & SQLite**: Relational database for storing structured experiences and task histories.
- **ChromaDB / Vector Embeddings**: Vector database for Agentic RAG, allowing the agent to semantically search its past lessons.
- **Pydantic**: Strict data validation and schema enforcement for the LLM's structured JSON outputs.

### Frontend
- **React (Vite)**: Lightning-fast frontend build tool and rendering library.
- **Tailwind CSS**: Utility-first CSS framework for building the custom, telecom-inspired flat UI design system.
- **Axios & Native Fetch**: For handling REST calls and processing real-time SSE streams from the backend orchestrator.

## 📁 Architecture Structure

```text
self-learning-ai-agent/
├── backend/                  # Python FastAPI Backend
│   ├── app/
│   │   ├── agent/            # Core Orchestrator and Planner
│   │   ├── api/              # FastAPI Endpoints and SSE Streams
│   │   ├── database/         # SQLite Models and Repositories
│   │   ├── learning/         # Evaluator, Learner, and Document Ingestion
│   │   ├── llm/              # Ollama Provider and Base LLM abstractions
│   │   ├── memory/           # Vector Store (Chroma) for RAG
│   │   ├── schemas/          # Pydantic Schemas for JSON enforcement
│   │   └── tools/            # Python, Search, File, and Math tools
│   ├── data/                 # Local SQLite DB storage
│   ├── main.py               # Uvicorn entry point
│   └── requirements.txt      # Python dependencies
├── frontend/                 # React Frontend
│   ├── src/
│   │   ├── App.jsx           # Main UI, Streaming logic, and HITL components
│   │   ├── index.css         # Global Tailwind resets
│   │   └── main.jsx          # React DOM entry
│   ├── package.json          # Node dependencies
│   ├── tailwind.config.js    # Custom design tokens and colors
│   └── vite.config.js        # Vite configuration
├── .gitignore                
└── run.py                    # Master bootstrapper script
```

## ✨ Key Features

- **Asynchronous Streaming (SSE):** The backend streams its status and execution states using Server-Sent Events, providing a real-time, low-latency UI experience without hanging requests.
- **Self-Reflection & Evaluation:** Before returning an answer, the agent passes its draft through an `Evaluator` that checks against the original prompt. If it fails, the agent retries.
- **Dynamic Tool System:** The agent has access to real programmatic tools and can iteratively run them. 
- **Human-In-The-Loop:** Built-in UI safety mechanism that pauses the backend and waits for the user to approve tool execution.
- **Zero-Cost Local Stack:** Completely bypasses OpenAI/Anthropic APIs by running Llama3.2 entirely locally.

## 💻 Setup and Installation

### Prerequisites
1. Node.js installed.
2. Python 3.10+ installed.
3. [Ollama](https://ollama.ai/) installed and running locally with the Llama 3.2 model (`ollama run llama3.2`).

### Running the Project

1. Clone the repository and navigate to the project root.
2. Run the master bootstrapper script:
   ```bash
   python run.py
   ```
3. The script will automatically:
   - Create a Python virtual environment (`venv`) and install `requirements.txt`.
   - Install all Node modules for the frontend via `npm install`.
   - Boot up the FastAPI backend on `http://127.0.0.1:8000`.
   - Boot up the Vite React frontend on `http://localhost:5173`.

### Environment Variables
Currently, the system is designed to run locally without external API keys. However, if you wish to expand the Web Search tool, you can add your credentials to `backend/.env`.

## ⚠️ Known Limitations & TODOs
- **Strict JSON Failures:** Smaller local models (like Llama 3.2 3B) occasionally fail strict Pydantic JSON schema generation. The backend Evaluator retries are currently minimized to prevent infinite loops.
- **Tool Interception Mocking:** While the UI fully supports Human-In-The-Loop approval, the SSE stream currently automatically proceeds after 2 seconds to simulate approval. To fully block execution until a WebSocket event is received, the API must be upgraded from SSE to bidirectional WebSockets.
- **Mock Embeddings:** In offline mode, the ChromaDB Vector Store falls back to MD5 hashing if a local embedding model (like `nomic-embed-text`) is unavailable on the Ollama instance.
