from sqlalchemy.orm import Session
from typing import List, Dict
from datetime import datetime, timedelta
from app.models import Task


class TaskScheduler:
    """Vazifalarni optimal tartibda joylashtirish servisi"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def schedule_tasks(
        self,
        user_id: str,
        tasks: List[Task],
        available_hours: int = 8
    ) -> List[Dict]:
        """Vazifalarni optimal tartibda joylashtirish"""
        if not tasks:
            return []
        
        # Vazifalarni prioritet va muddat bo'yicha saralash
        # Priority scores: high=3, medium=2, low=1
        priority_scores = {"high": 3, "medium": 2, "low": 1}
        
        # Vazifalarni score hisoblash
        task_scores = []
        for task in tasks:
            score = priority_scores.get(task.priority, 1)
            
            # Muddatga qarab score
            if task.due_date:
                days_until = (task.due_date.date() - datetime.now().date()).days
                if days_until < 0:
                    score += 10  # Kechikkan
                elif days_until == 0:
                    score += 5  # Bugun
                elif days_until < 3:
                    score += 2  # Tez orada
            
            # Focus vazifa
            if task.is_focus == 1:
                score += 3
            
            task_scores.append({
                "task": task,
                "score": score
            })
        
        # Score bo'yicha saralash (yuqoridan pastga)
        task_scores.sort(key=lambda x: x["score"], reverse=True)
        
        # Optimal tartibda joylashtirish
        scheduled = []
        current_time = datetime.now().replace(hour=9, minute=0, second=0, microsecond=0)  # 9:00 dan boshlash
        end_time = current_time.replace(hour=17, minute=0)  # 17:00 gacha
        
        for item in task_scores:
            task = item["task"]
            
            # Vazifa vaqti (taxminiy 1 soat)
            estimated_duration = timedelta(hours=1)
            
            if current_time + estimated_duration > end_time:
                # Kunlik vaqt tugadi
                break
            
            scheduled.append({
                "task_id": task.id,
                "title": task.title,
                "priority": task.priority,
                "scheduled_time": current_time.isoformat(),
                "estimated_duration": 60,  # daqiqalar
                "category": task.category
            })
            
            current_time += estimated_duration
        
        return scheduled
    
    def optimize_task_order(
        self,
        user_id: str,
        task_ids: List[str]
    ) -> List[str]:
        """Vazifalar tartibini optimallashtirish"""
        tasks = self.db.query(Task).filter(
            Task.id.in_(task_ids),
            Task.user_id == user_id
        ).all()
        
        if not tasks:
            return []
        
        # Priority va deadline bo'yicha saralash
        priority_order = {"high": 0, "medium": 1, "low": 2}
        
        sorted_tasks = sorted(tasks, key=lambda t: (
            priority_order.get(t.priority, 1),
            t.due_date if t.due_date else datetime.max
        ))
        
        return [task.id for task in sorted_tasks]
    
    def suggest_task_timing(
        self,
        user_id: str,
        task_id: str
    ) -> Dict:
        """Vazifa uchun optimal vaqtni tavsiya qilish"""
        task = self.db.query(Task).filter(
            Task.id == task_id,
            Task.user_id == user_id
        ).first()
        
        if not task:
            return {"suggested_time": None}
        
        # Foydalanuvchi tarixi (shu kategoriyadagi vazifalar)
        similar_tasks = self.db.query(Task).filter(
            Task.user_id == user_id,
            Task.category == task.category,
            Task.status == "done"
        ).limit(10).all()
        
        # O'rtacha bajarilish vaqti (taxminiy)
        avg_completion_hour = 14  # Default: 14:00
        
        if similar_tasks:
            # Oddiy o'rtacha (keyinchalik yaxshilash mumkin)
            completion_times = []
            for t in similar_tasks:
                if t.completed_at:
                    completion_times.append(t.completed_at.hour)
            
            if completion_times:
                avg_completion_hour = int(sum(completion_times) / len(completion_times))
        
        # Optimal vaqt
        suggested_time = datetime.now().replace(
            hour=avg_completion_hour,
            minute=0,
            second=0,
            microsecond=0
        )
        
        # Agar bugun muddat bo'lsa, ertaga ko'chirish
        if task.due_date and task.due_date.date() > datetime.now().date():
            suggested_time = suggested_time + timedelta(days=1)
        
        return {
            "suggested_time": suggested_time.isoformat(),
            "reason": f"Shunga o'xshash vazifalar o'rtacha {avg_completion_hour}:00 da bajarilgan"
        }

