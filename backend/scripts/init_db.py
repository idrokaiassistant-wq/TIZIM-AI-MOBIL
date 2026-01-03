"""
Database initialization script
Creates tables and loads seed data
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import init_db, engine
from sqlalchemy import text
from app.models import Category
from app.database import SessionLocal
import uuid

def load_seed_data():
    """Load seed data into database"""
    db = SessionLocal()
    try:
        # Check if categories already exist
        existing = db.query(Category).filter(Category.is_default == 1).first()
        if existing:
            print("Seed data already loaded. Skipping...")
            return
        
        # Insert default categories
        categories = [
            {"id": "cat_task_ish", "name": "Ish", "type": "task", "color": "indigo", "icon": "Briefcase", "is_default": 1},
            {"id": "cat_task_shaxsiy", "name": "Shaxsiy", "type": "task", "color": "blue", "icon": "User", "is_default": 1},
            {"id": "cat_task_oqish", "name": "O'qish", "type": "task", "color": "orange", "icon": "BookOpen", "is_default": 1},
            {"id": "cat_trans_oziq", "name": "Oziq-ovqat", "type": "transaction", "color": "orange", "icon": "ShoppingBag", "is_default": 1},
            {"id": "cat_trans_transport", "name": "Transport", "type": "transaction", "color": "blue", "icon": "Car", "is_default": 1},
            {"id": "cat_trans_maosh", "name": "Maosh", "type": "transaction", "color": "emerald", "icon": "CreditCard", "is_default": 1},
            {"id": "cat_habit_salomatlik", "name": "Salomatlik", "type": "habit", "color": "green", "icon": "Heart", "is_default": 1},
            {"id": "cat_habit_sport", "name": "Sport", "type": "habit", "color": "red", "icon": "Dumbbell", "is_default": 1},
        ]
        
        for cat_data in categories:
            category = Category(**cat_data)
            db.add(category)
        
        db.commit()
        print("Seed data loaded successfully!")
    except Exception as e:
        print(f"Error loading seed data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("Initializing database...")
    init_db()
    print("Database initialized!")
    print("Loading seed data...")
    load_seed_data()

