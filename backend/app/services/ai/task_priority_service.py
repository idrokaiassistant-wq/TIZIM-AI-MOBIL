from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from typing import Optional, Dict
from datetime import datetime, timedelta
import numpy as np
import joblib
import os
from pathlib import Path
from app.models import Task
from app.config.ai_config import ai_config

try:
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.preprocessing import LabelEncoder
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False


class TaskPriorityService:
    """Vazifalar prioritetini bashorat qilish servisi"""
    
    def __init__(self, db: Session):
        self.db = db
        self.model = None
        self.label_encoders = {}
        self.model_path = ai_config.task_priority_model_path
        self._load_model()
    
    def _load_model(self):
        """Modelni yuklash"""
        if not SKLEARN_AVAILABLE:
            return
        
        model_file = Path(self.model_path)
        if model_file.exists():
            try:
                self.model = joblib.load(model_file)
                # Label encoderni ham yuklash
                encoders_file = model_file.parent / "task_priority_encoders.joblib"
                if encoders_file.exists():
                    self.label_encoders = joblib.load(encoders_file)
            except Exception:
                self.model = None
    
    def predict_priority(
        self,
        user_id: str,
        task_data: Dict
    ) -> str:
        """Vazifa prioritetini bashorat qilish"""
        if not SKLEARN_AVAILABLE or not self.model:
            return self._fallback_priority(task_data)
        
        try:
            # Features tayyorlash
            features = self._extract_features(user_id, task_data)
            
            # Prediction
            prediction = self.model.predict([features])[0]
            
            # Label decoder
            if "priority" in self.label_encoders:
                priority = self.label_encoders["priority"].inverse_transform([prediction])[0]
            else:
                priority_map = {0: "low", 1: "medium", 2: "high"}
                priority = priority_map.get(prediction, "medium")
            
            return priority
        except Exception:
            return self._fallback_priority(task_data)
    
    def _extract_features(
        self,
        user_id: str,
        task_data: Dict
    ) -> list:
        """Features ajratish"""
        # Foydalanuvchi tarixi
        user_tasks = self.db.query(Task).filter(
            Task.user_id == user_id
        ).limit(100).all()
        
        # Kategoriya statistikasi
        category = task_data.get("category", "Ish")
        category_tasks = [t for t in user_tasks if t.category == category]
        category_completion_rate = (
            len([t for t in category_tasks if t.status == "done"]) / len(category_tasks) * 100
            if category_tasks
            else 50
        )
        
        # Muddat
        due_date = task_data.get("due_date")
        if due_date:
            if isinstance(due_date, str):
                due_date = datetime.fromisoformat(due_date.replace("Z", "+00:00"))
            days_until_due = (due_date.date() - datetime.now().date()).days
        else:
            days_until_due = 999  # Muddat yo'q
        
        # Vaqt
        hour = datetime.now().hour
        
        # Features
        features = [
            category_completion_rate / 100,  # Normalized
            min(days_until_due / 30, 1.0) if days_until_due > 0 else 0,  # Normalized
            hour / 24,  # Normalized
            len(category_tasks) / 100,  # Normalized
            1 if task_data.get("is_focus") else 0
        ]
        
        return features
    
    def _fallback_priority(self, task_data: Dict) -> str:
        """Fallback prioritet (ML ishlamasa)"""
        due_date = task_data.get("due_date")
        if due_date:
            if isinstance(due_date, str):
                due_date = datetime.fromisoformat(due_date.replace("Z", "+00:00"))
            days_until_due = (due_date.date() - datetime.now().date()).days
            
            if days_until_due < 1:
                return "high"
            elif days_until_due < 3:
                return "medium"
            else:
                return "low"
        
        return "medium"
    
    def train_model(self, user_id: Optional[str] = None):
        """Modelni train qilish"""
        if not SKLEARN_AVAILABLE:
            return False
        
        # Ma'lumotlarni yig'ish
        query = self.db.query(Task)
        if user_id:
            query = query.filter(Task.user_id == user_id)
        
        tasks = query.filter(Task.status == "done").limit(1000).all()
        
        if len(tasks) < 10:
            return False
        
        # Features va labels
        X = []
        y = []
        
        for task in tasks:
            features = self._extract_features(task.user_id, {
                "category": task.category,
                "due_date": task.due_date,
                "is_focus": task.is_focus == 1
            })
            X.append(features)
            
            # Priority label
            priority_map = {"low": 0, "medium": 1, "high": 2}
            y.append(priority_map.get(task.priority, 1))
        
        # Model train qilish
        self.model = RandomForestClassifier(n_estimators=50, random_state=42)
        self.model.fit(X, y)
        
        # Model saqlash
        model_dir = Path(self.model_path).parent
        model_dir.mkdir(parents=True, exist_ok=True)
        
        joblib.dump(self.model, self.model_path)
        
        return True

