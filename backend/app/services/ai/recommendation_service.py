from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Dict, Optional
from datetime import date, timedelta
from app.models import Task, Habit, HabitCompletion
from app.config.ai_config import ai_config


class RecommendationService:
    """Tavsiyalar servisi"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_task_recommendations(
        self,
        user_id: str,
        limit: int = 5
    ) -> List[Dict]:
        """Vazifalar uchun tavsiyalar"""
        # Foydalanuvchi tarixi
        completed_tasks = self.db.query(Task).filter(
            and_(
                Task.user_id == user_id,
                Task.status == "done"
            )
        ).order_by(Task.completed_at.desc()).limit(50).all()
        
        pending_tasks = self.db.query(Task).filter(
            and_(
                Task.user_id == user_id,
                Task.status == "pending"
            )
        ).all()
        
        if not completed_tasks:
            # Hech qanday tarix yo'q, oddiy tavsiyalar
            return self._get_default_task_recommendations(pending_tasks, limit)
        
        # Kategoriyalar bo'yicha muvaffaqiyat darajasi
        category_success = {}
        for task in completed_tasks:
            cat = task.category
            if cat not in category_success:
                category_success[cat] = {"completed": 0, "total": 0}
            category_success[cat]["completed"] += 1
        
        # Pending tasks uchun score hisoblash
        recommendations = []
        for task in pending_tasks:
            score = 0
            
            # Kategoriya muvaffaqiyati
            cat = task.category
            if cat in category_success:
                success_rate = category_success[cat]["completed"] / max(category_success[cat]["total"], 1)
                score += success_rate * 30
            
            # Muddat
            if task.due_date:
                days_until = (task.due_date.date() - date.today()).days
                if days_until < 0:
                    score += 50  # Kechikkan
                elif days_until < 1:
                    score += 40
                elif days_until < 3:
                    score += 20
            
            # Prioritet
            priority_scores = {"high": 30, "medium": 15, "low": 5}
            score += priority_scores.get(task.priority, 15)
            
            # Focus
            if task.is_focus == 1:
                score += 10
            
            recommendations.append({
                "task_id": task.id,
                "title": task.title,
                "category": task.category,
                "priority": task.priority,
                "due_date": task.due_date.isoformat() if task.due_date else None,
                "score": round(score, 2),
                "reason": self._get_recommendation_reason(task, category_success)
            })
        
        # Score bo'yicha saralash
        recommendations.sort(key=lambda x: x["score"], reverse=True)
        
        return recommendations[:limit]
    
    def get_habit_recommendations(
        self,
        user_id: str,
        limit: int = 5
    ) -> List[Dict]:
        """Odatlar uchun tavsiyalar"""
        habits = self.db.query(Habit).filter(
            and_(
                Habit.user_id == user_id,
                Habit.is_active == 1
            )
        ).all()
        
        recommendations = []
        for habit in habits:
            # Streak holati
            streak = habit.current_streak or 0
            longest_streak = habit.longest_streak or 0
            
            # Oxirgi bajarilish
            last_completion = self.db.query(HabitCompletion).filter(
                HabitCompletion.habit_id == habit.id
            ).order_by(HabitCompletion.completion_date.desc()).first()
            
            days_since_completion = None
            if last_completion:
                days_since_completion = (date.today() - last_completion.completion_date).days
            
            # Score hisoblash
            score = 0
            
            # Streak uzilgan bo'lsa
            if days_since_completion and days_since_completion > 1:
                score += 50 - min(days_since_completion * 5, 50)
            
            # Streak kichik bo'lsa
            if streak < longest_streak * 0.5:
                score += 20
            
            # Completion rate
            completion_rate = (
                (habit.total_completions / 30 * 100)
                if habit.total_completions
                else 0
            )
            if completion_rate < 50:
                score += 15
            
            recommendations.append({
                "habit_id": habit.id,
                "title": habit.title,
                "category": habit.category,
                "current_streak": streak,
                "longest_streak": longest_streak,
                "days_since_completion": days_since_completion,
                "score": round(score, 2),
                "reason": self._get_habit_recommendation_reason(habit, days_since_completion)
            })
        
        # Score bo'yicha saralash
        recommendations.sort(key=lambda x: x["score"], reverse=True)
        
        return recommendations[:limit]
    
    def _get_default_task_recommendations(
        self,
        pending_tasks: List[Task],
        limit: int
    ) -> List[Dict]:
        """Oddiy tavsiyalar (tarix yo'q bo'lsa)"""
        recommendations = []
        for task in pending_tasks[:limit]:
            recommendations.append({
                "task_id": task.id,
                "title": task.title,
                "category": task.category,
                "priority": task.priority,
                "due_date": task.due_date.isoformat() if task.due_date else None,
                "score": 10.0,
                "reason": "Yangi vazifa"
            })
        return recommendations
    
    def _get_recommendation_reason(
        self,
        task: Task,
        category_success: Dict
    ) -> str:
        """Tavsiya sababi"""
        reasons = []
        
        if task.due_date:
            days_until = (task.due_date.date() - date.today()).days
            if days_until < 0:
                reasons.append("Muddat o'tib ketgan")
            elif days_until < 1:
                reasons.append("Bugun muddat")
        
        if task.priority == "high":
            reasons.append("Yuqori prioritet")
        
        if task.is_focus == 1:
            reasons.append("Focus vazifa")
        
        cat = task.category
        if cat in category_success:
            reasons.append(f"{cat} kategoriyasida yaxshi natijalar")
        
        return ", ".join(reasons) if reasons else "Tavsiya etiladi"
    
    def _get_habit_recommendation_reason(
        self,
        habit: Habit,
        days_since_completion: Optional[int]
    ) -> str:
        """Odat tavsiya sababi"""
        if days_since_completion and days_since_completion > 1:
            return f"{days_since_completion} kun bajarilmagan"
        
        if habit.current_streak < (habit.longest_streak or 0) * 0.5:
            return "Streak pasayib ketgan"
        
        return "Davom eting"

