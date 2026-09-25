import chromadb
from chromadb.config import Settings
import os
import uuid
from typing import List, Dict, Any
from app.llm.base import BaseLLMProvider

class VectorStore:
    def __init__(self, llm_provider: BaseLLMProvider, persist_directory: str = "../data/chroma", collection_name: str = "agent_knowledge"):
        os.makedirs(persist_directory, exist_ok=True)
        self.client = chromadb.PersistentClient(path=persist_directory)
        self.llm = llm_provider
        
        self.collection = self.client.get_or_create_collection(
            name=collection_name,
            metadata={"hnsw:space": "cosine"}
        )

    def _get_embedding(self, text: str) -> List[float]:
        try:
            return self.llm.embed(text)
        except Exception as e:
            # Fallback for offline mode without an embedding model
            import hashlib
            import logging
            logging.getLogger(__name__).warning(f"Embedding failed, using mock embedding for offline mode: {e}")
            h = hashlib.md5(text.encode()).digest()
            # Generate a pseudo-random 384-dimensional vector
            return [(b / 255.0) - 0.5 for b in (h * 24)]

    def add_texts(self, texts: List[str], metadatas: List[Dict[str, Any]] = None, ids: List[str] = None):
        if not texts:
            return
            
        if ids is None:
            ids = [str(uuid.uuid4()) for _ in texts]
            
        embeddings = [self._get_embedding(text) for text in texts]
        
        self.collection.add(
            embeddings=embeddings,
            documents=texts,
            metadatas=metadatas,
            ids=ids
        )
        
    def similarity_search(self, query: str, n_results: int = 3, filter_metadata: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        query_embedding = self._get_embedding(query)
        
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results,
            where=filter_metadata
        )
        
        output = []
        if results['documents'] and len(results['documents']) > 0:
            docs = results['documents'][0]
            metas = results['metadatas'][0] if results['metadatas'] else [{}] * len(docs)
            distances = results['distances'][0] if results['distances'] else [0] * len(docs)
            
            for doc, meta, dist in zip(docs, metas, distances):
                output.append({
                    "content": doc,
                    "metadata": meta,
                    "distance": dist
                })
                
        return output
