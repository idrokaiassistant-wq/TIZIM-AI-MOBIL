from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from typing import Dict, Optional
from datetime import date, timedelta
import numpy as np
from app.models import Task, Habit, Transaction, ProductivityLog


class StatisticalReports:
    """Statistika hisobotlari servisi"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_category_distribution(
        self,
        user_id: str,
        entity_type: str,  # "task", "habit", "transaction"
        days: int = 30
    ) -> Dict:
        """Kategoriyalar bo'yicha taqsimot"""
        start_date = date.today() - timedelta(days=days)
        
        if entity_type == "task":
            items = self.db.query(Task).filter(
                and_(
                    Task.user_id == user_id,
                    func.date(Task.created_at) >= start_date
                )
            ).all()
            category_field = "category"
        elif entity_type == "habit":
            items = self.db.query(Habit).filter(
                and_(
                    Habit.user_id == user_id,
                    Habit.is_active == 1
                )
            ).all()
            category_field = "category"
        elif entity_type == "transaction":
            items = self.db.query(Transaction).filter(
                and_(
                    Transaction.user_id == user_id,
                    Transaction.transaction_date >= start_date
                )
            ).all()
            category_field = "category"
        else:
            return {"categories": {}}
        
        # Kategoriyalar bo'yicha hisoblash
        category_counts = {}
        for item in items:
            cat = getattr(item, category_field, "Unknown")
            category_counts[cat] = category_counts.get(cat, 0) + 1
        
        total = sum(category_counts.values())
        
        return {
            "categories": {
                cat: {
                    "count": count,
                    "percentage": round((count / total * 100), 2) if total > 0 else 0
                }
                for cat, count in category_counts.items()
            },
            "total": total
        }
    
    def analyze_correlation(
        self,
        user_id: str,
        days: int = 30
    ) -> Dict:
        """Produktivlik va kayfiyat o'rtasidagi korrelyatsiya"""
        start_date = date.today() - timedelta(days=days)
        
        logs = self.db.query(ProductivityLog).filter(
            and_(
                ProductivityLog.user_id == user_id,
                ProductivityLog.log_date >= start_date
            )
        ).all()
        
        if len(logs) < 3:
            return {
                "correlation": 0,
                "significance": "insufficient_data"
            }
        
        # Ma'lumotlarni tayyorlash
        completion_rates = []
        energy_levels = []
        
        for log in logs:
            if log.tasks_total and log.tasks_total > 0:
                rate = (log.tasks_completed / log.tasks_total * 100)
                completion_rates.append(rate)
                energy_levels.append(log.energy_level or 5)
        
        if len(completion_rates) < 3:
            return {
                "correlation": 0,
                "significance": "insufficient_data"
            }
        
        # Pearson correlation
        correlation = np.corrcoef(completion_rates, energy_levels)[0, 1]
        
        # Significance
        if abs(correlation) > 0.7:
            significance = "strong"
        elif abs(correlation) > 0.4:
            significance = "moderate"
        elif abs(correlation) > 0.2:
            significance = "weak"
        else:
            significance = "none"
        
        return {
            "correlation": round(correlation, 3),
            "significance": significance,
            "sample_size": len(completion_rates)
        }
    
    def regression_analysis(
        self,
        user_id: str,
        days: int = 30
    ) -> Dict:
        """Regression tahlili (vazifalar va odatlar o'rtasida)"""
        start_date = date.today() - timedelta(days=days)
        
        # Kunlik ma'lumotlar
        daily_data = {}
        
        # Vazifalar
        tasks = self.db.query(Task).filter(
            and_(
                Task.user_id == user_id,
                func.date(Task.created_at) >= start_date
            )
        ).all()
        
        for task in tasks:
            day = task.created_at.date() if task.created_at else date.today()
            if day not in daily_data:
                daily_data[day] = {"tasks_completed": 0, "habits_completed": 0}
            if task.status == "done":
                daily_data[day]["tasks_completed"] += 1
        
        # Odatlar
        habits = self.db.query(Habit).filter(
            Habit.user_id == user_id
        ).all()
        
        for habit in habits:
            completions = self.db.query(HabitCompletion).filter(
                and_(
                    HabitCompletion.habit_id == habit.id,
                    HabitCompletion.completion_date >= start_date
                )
            ).all()
            
            for completion in completions:
                day = completion.completion_date
                if day not in daily_data:
                    daily_data[day] = {"tasks_completed": 0, "habits_completed": 0}
                daily_data[day]["habits_completed"] += 1
        
        if len(daily_data) < 3:
            return {
                "r_squared": 0,
                "coefficient": 0,
                "significance": "insufficient_data"
            }
        
        # Linear regression
        x = [d["habits_completed"] for d in daily_data.values()]
        y = [d["tasks_completed"] for d in daily_data.values()]
        
        if len(x) < 3 or np.std(x) == 0:
            return {
                "r_squared": 0,
                "coefficient": 0,
                "significance": "insufficient_data"
            }
        
        # Simple linear regression
        coeff = np.polyfit(x, y, 1)
        slope = coeff[0]
        intercept = coeff[1]
        
        # R-squared
        y_pred = [slope * xi + intercept for xi in x]
        ss_res = sum((yi - ypi) ** 2 for yi, ypi in zip(y, y_pred))
        ss_tot = sum((yi - np.mean(y)) ** 2 for yi in y)
        r_squared = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0
        
        return {
            "r_squared": round(r_squared, 3),
            "coefficient": round(slope, 3),
            "intercept": round(intercept, 3),
            "significance": "strong" if r_squared > 0.5 else "moderate" if r_squared > 0.3 else "weak"
        }

