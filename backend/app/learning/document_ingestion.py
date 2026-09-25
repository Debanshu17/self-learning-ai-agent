import fitz  # PyMuPDF
import os
import uuid
from typing import List, Dict, Any
from app.memory.vector_store import VectorStore

class DocumentIngester:
    def __init__(self, vector_store: VectorStore, chunk_size: int = 1000, chunk_overlap: int = 200):
        self.vs = vector_store
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def chunk_text(self, text: str) -> List[str]:
        words = text.split()
        chunks = []
        i = 0
        while i < len(words):
            chunk = " ".join(words[i:i + self.chunk_size])
            chunks.append(chunk)
            i += self.chunk_size - self.chunk_overlap
        return chunks

    def ingest_file(self, file_path: str, filename: str) -> int:
        """Reads a file, chunks it, and stores it in the vector store. Returns number of chunks."""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File {file_path} not found.")
            
        ext = filename.split('.')[-1].lower()
        text = ""
        
        if ext == 'pdf':
            doc = fitz.open(file_path)
            for page in doc:
                text += page.get_text()
        elif ext in ['txt', 'md']:
            with open(file_path, 'r', encoding='utf-8') as f:
                text = f.read()
        else:
            raise ValueError(f"Unsupported file extension: {ext}")
            
        if not text.strip():
            return 0
            
        chunks = self.chunk_text(text)
        metadatas = [{"source": filename, "type": "document", "chunk_index": i} for i in range(len(chunks))]
        
        self.vs.add_texts(texts=chunks, metadatas=metadatas)
        return len(chunks)
