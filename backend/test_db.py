import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.database import Base, engine, SessionLocal
from app.database.repositories import MemoryRepository

def test_db():
    print("Testing SQLite memory database...")
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    repo = MemoryRepository(db)
    
    # Add memory
    mem = repo.add_memory(
        content="User likes dark mode.",
        category="user_preference",
        source="user"
    )
    
    # Retrieve
    memories = repo.get_memories_by_category("user_preference")
    assert len(memories) > 0
    assert memories[0].content == "User likes dark mode."
    
    db.close()
    print("Database test passed!")

if __name__ == "__main__":
    try:
        test_db()
    except Exception as e:
        print(f"Database test failed: {e}")
