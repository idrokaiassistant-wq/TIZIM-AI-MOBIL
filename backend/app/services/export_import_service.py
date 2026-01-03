"""
Export/Import Service
"""
import json
import csv
import io
from typing import Dict, List, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.models import Task, Habit, Transaction, Budget


class ExportImportService:
    """Service for exporting and importing data"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def export_tasks(self, user_id: str) -> List[Dict[str, Any]]:
        """Export all tasks for a user"""
        tasks = self.db.query(Task).filter(Task.user_id == user_id).all()
        
        return [
            {
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "category": task.category,
                "priority": task.priority,
                "status": task.status,
                "is_focus": bool(task.is_focus),
                "due_date": task.due_date.isoformat() if task.due_date else None,
                "start_time": task.start_time,
                "end_time": task.end_time,
                "color": task.color,
                "completed_at": task.completed_at.isoformat() if task.completed_at else None,
                "created_at": task.created_at.isoformat() if task.created_at else None,
                "updated_at": task.updated_at.isoformat() if task.updated_at else None,
            }
            for task in tasks
        ]
    
    def export_habits(self, user_id: str) -> List[Dict[str, Any]]:
        """Export all habits for a user"""
        habits = self.db.query(Habit).filter(Habit.user_id == user_id).all()
        
        return [
            {
                "id": habit.id,
                "title": habit.title,
                "description": habit.description,
                "frequency": habit.frequency,
                "target_days": habit.target_days,
                "current_streak": habit.current_streak,
                "longest_streak": habit.longest_streak,
                "is_active": bool(habit.is_active),
                "created_at": habit.created_at.isoformat() if habit.created_at else None,
                "updated_at": habit.updated_at.isoformat() if habit.updated_at else None,
            }
            for habit in habits
        ]
    
    def export_finance(self, user_id: str) -> Dict[str, List[Dict[str, Any]]]:
        """Export all finance data for a user"""
        transactions = self.db.query(Transaction).filter(Transaction.user_id == user_id).all()
        budgets = self.db.query(Budget).filter(Budget.user_id == user_id).all()
        
        return {
            "transactions": [
                {
                    "id": t.id,
                    "amount": float(t.amount),
                    "type": t.type,
                    "category": t.category,
                    "description": t.description,
                    "date": t.date.isoformat() if t.date else None,
                    "created_at": t.created_at.isoformat() if t.created_at else None,
                }
                for t in transactions
            ],
            "budgets": [
                {
                    "id": b.id,
                    "category": b.category,
                    "amount": float(b.amount),
                    "period": b.period,
                    "start_date": b.start_date.isoformat() if b.start_date else None,
                    "end_date": b.end_date.isoformat() if b.end_date else None,
                    "created_at": b.created_at.isoformat() if b.created_at else None,
                }
                for b in budgets
            ],
        }
    
    def export_all(self, user_id: str) -> Dict[str, Any]:
        """Export all data for a user"""
        return {
            "tasks": self.export_tasks(user_id),
            "habits": self.export_habits(user_id),
            "finance": self.export_finance(user_id),
            "exported_at": datetime.now().isoformat(),
        }
    
    def import_tasks(self, user_id: str, tasks_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Import tasks for a user"""
        imported = 0
        errors = []
        
        for task_data in tasks_data:
            try:
                # Check if task already exists
                existing = self.db.query(Task).filter(
                    Task.id == task_data.get("id"),
                    Task.user_id == user_id
                ).first()
                
                if existing:
                    # Update existing task
                    for key, value in task_data.items():
                        if key not in ["id", "user_id"] and hasattr(existing, key):
                            setattr(existing, key, value)
                    imported += 1
                else:
                    # Create new task
                    task = Task(
                        id=task_data.get("id") or f"imported-{datetime.now().timestamp()}",
                        user_id=user_id,
                        title=task_data.get("title", ""),
                        description=task_data.get("description"),
                        category=task_data.get("category", "Ish"),
                        priority=task_data.get("priority", "medium"),
                        status=task_data.get("status", "pending"),
                        is_focus=1 if task_data.get("is_focus") else 0,
                        color=task_data.get("color", "indigo"),
                    )
                    self.db.add(task)
                    imported += 1
            except Exception as e:
                errors.append(f"Task {task_data.get('title', 'Unknown')}: {str(e)}")
        
        self.db.commit()
        
        return {
            "imported": imported,
            "errors": errors,
        }
    
    def import_habits(self, user_id: str, habits_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Import habits for a user"""
        imported = 0
        errors = []
        
        for habit_data in habits_data:
            try:
                # Check if habit already exists
                existing = self.db.query(Habit).filter(
                    Habit.id == habit_data.get("id"),
                    Habit.user_id == user_id
                ).first()
                
                if existing:
                    # Update existing habit
                    for key, value in habit_data.items():
                        if key not in ["id", "user_id"] and hasattr(existing, key):
                            setattr(existing, key, value)
                    imported += 1
                else:
                    # Create new habit
                    habit = Habit(
                        id=habit_data.get("id") or f"imported-{datetime.now().timestamp()}",
                        user_id=user_id,
                        title=habit_data.get("title", ""),
                        description=habit_data.get("description"),
                        frequency=habit_data.get("frequency", "daily"),
                        target_days=habit_data.get("target_days", 7),
                        current_streak=habit_data.get("current_streak", 0),
                        longest_streak=habit_data.get("longest_streak", 0),
                        is_active=1 if habit_data.get("is_active", True) else 0,
                    )
                    self.db.add(habit)
                    imported += 1
            except Exception as e:
                errors.append(f"Habit {habit_data.get('title', 'Unknown')}: {str(e)}")
        
        self.db.commit()
        
        return {
            "imported": imported,
            "errors": errors,
        }
    
    def import_all(self, user_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Import all data for a user"""
        results = {
            "tasks": {"imported": 0, "errors": []},
            "habits": {"imported": 0, "errors": []},
        }
        
        if "tasks" in data:
            results["tasks"] = self.import_tasks(user_id, data["tasks"])
        
        if "habits" in data:
            results["habits"] = self.import_habits(user_id, data["habits"])
        
        return results

