from sqlalchemy.orm import Session
from typing import Optional
from datetime import date, timedelta
from app.services.ai.insights_service import InsightsService
from app.services.ai.task_priority_service import TaskPriorityService
from app.services.ai.anomaly_detection_service import AnomalyDetectionService
from app.config.ai_config import ai_config


class AITasks:
    """Background AI vazifalari"""
    
    def __init__(self, db: Session):
        self.db = db
        self.insights_service = InsightsService(db)
        self.anomaly_detection = AnomalyDetectionService(db)
        self.task_priority = TaskPriorityService(db)
    
    def generate_daily_insights_for_all_users(self):
        """Barcha foydalanuvchilar uchun kunlik xulosa generatsiya qilish"""
        from app.models import User
        
        users = self.db.query(User).all()
        results = []
        
        for user in users:
            try:
                insights = self.insights_service.generate_daily_insights(user.id)
                results.append({
                    "user_id": user.id,
                    "success": True,
                    "insights": insights
                })
            except Exception as e:
                results.append({
                    "user_id": user.id,
                    "success": False,
                    "error": str(e)
                })
        
        return results
    
    def check_anomalies_for_all_users(self):
        """Barcha foydalanuvchilar uchun anomaliyalarni tekshirish"""
        from app.models import User
        
        users = self.db.query(User).all()
        results = []
        
        for user in users:
            try:
                expense_anomalies = self.anomaly_detection.detect_expense_anomalies(user.id)
                habit_anomalies = self.anomaly_detection.detect_habit_anomalies(user.id)
                
                results.append({
                    "user_id": user.id,
                    "expense_anomalies": len(expense_anomalies),
                    "habit_anomalies": len(habit_anomalies),
                    "total": len(expense_anomalies) + len(habit_anomalies)
                })
            except Exception as e:
                results.append({
                    "user_id": user.id,
                    "error": str(e)
                })
        
        return results
    
    def retrain_models(self, user_id: Optional[str] = None):
        """ML modellarni qayta train qilish"""
        if not ai_config.enable_ml:
            return {"success": False, "reason": "ML disabled"}
        
        try:
            success = self.task_priority.train_model(user_id)
            return {
                "success": success,
                "model": "task_priority",
                "user_id": user_id
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def should_retrain_models(self, user_id: str) -> bool:
        """Modellarni qayta train qilish kerakmi?"""
        from app.models import Task
        
        # Oxirgi train qilingan vaqtni tekshirish (oddiy versiya)
        # Keyinchalik model metadata bilan yaxshilash mumkin
        
        # Agar ko'p yangi ma'lumotlar bo'lsa
        recent_tasks = self.db.query(Task).filter(
            Task.user_id == user_id,
            Task.status == "done"
        ).limit(ai_config.task_priority_retrain_days * 10).count()
        
        return recent_tasks >= 50  # 50+ yangi vazifalar bo'lsa

