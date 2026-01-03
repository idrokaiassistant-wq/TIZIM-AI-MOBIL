"""
ML modellarni train qilish scripti
"""
import sys
import os
from pathlib import Path

# Backend papkasini path ga qo'shish
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from app.database import SessionLocal, init_db
from app.services.ai.task_priority_service import TaskPriorityService
from app.config.ai_config import ai_config


def train_all_models(user_id: str = None):
    """Barcha modellarni train qilish"""
    print("Database initializing...")
    init_db()
    
    db = SessionLocal()
    try:
        print("Training task priority model...")
        service = TaskPriorityService(db)
        success = service.train_model(user_id)
        
        if success:
            print("✓ Task priority model trained successfully")
        else:
            print("✗ Failed to train task priority model (insufficient data)")
        
        return success
    except Exception as e:
        print(f"✗ Error training models: {str(e)}")
        return False
    finally:
        db.close()


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Train ML models")
    parser.add_argument("--user-id", type=str, help="Specific user ID to train for")
    args = parser.parse_args()
    
    train_all_models(args.user_id)

