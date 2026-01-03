from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from typing import List, Dict, Optional
from datetime import date, timedelta
import pandas as pd
import numpy as np
from app.models import Task, Habit, HabitCompletion, Transaction


class TrendAnalyzer:
    """Trend tahlili servisi"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def analyze_task_completion_trends(
        self,
        user_id: str,
        days: int = 30
    ) -> Dict:
        """Vazifalar bajarilish tendentsiyalarini tahlil qilish"""
        start_date = date.today() - timedelta(days=days)
        
        tasks = self.db.query(Task).filter(
            and_(
                Task.user_id == user_id,
                func.date(Task.created_at) >= start_date
            )
        ).all()
        
        if not tasks:
            return {
                "trend": "stable",
                "completion_rate": 0,
                "trend_percentage": 0,
                "daily_completion": []
            }
        
        # Kunlik bajarilish
        daily_stats = {}
        for task in tasks:
            task_date = task.created_at.date() if task.created_at else date.today()
            if task_date not in daily_stats:
                daily_stats[task_date] = {"total": 0, "completed": 0}
            
            daily_stats[task_date]["total"] += 1
            if task.status == "done":
                daily_stats[task_date]["completed"] += 1
        
        # Completion rate hisoblash
        daily_completion = []
        for day in sorted(daily_stats.keys()):
            stats = daily_stats[day]
            rate = (
                (stats["completed"] / stats["total"] * 100)
                if stats["total"] > 0
                else 0
            )
            daily_completion.append({
                "date": day.strftime("%Y-%m-%d"),
                "rate": round(rate, 2)
            })
        
        # Trend hisoblash (oddiy linear regression)
        if len(daily_completion) >= 2:
            rates = [d["rate"] for d in daily_completion]
            x = np.arange(len(rates))
            slope = np.polyfit(x, rates, 1)[0]
            
            if slope > 1:
                trend = "increasing"
            elif slope < -1:
                trend = "decreasing"
            else:
                trend = "stable"
            
            trend_percentage = round(slope, 2)
        else:
            trend = "stable"
            trend_percentage = 0
        
        avg_completion = np.mean([d["rate"] for d in daily_completion]) if daily_completion else 0
        
        return {
            "trend": trend,
            "completion_rate": round(avg_completion, 2),
            "trend_percentage": trend_percentage,
            "daily_completion": daily_completion
        }
    
    def analyze_habit_streak_trends(
        self,
        user_id: str,
        days: int = 30
    ) -> Dict:
        """Odatlar streak tendentsiyalarini tahlil qilish"""
        habits = self.db.query(Habit).filter(
            and_(
                Habit.user_id == user_id,
                Habit.is_active == 1
            )
        ).all()
        
        if not habits:
            return {
                "average_streak": 0,
                "trend": "stable",
                "habits": []
            }
        
        habit_trends = []
        for habit in habits:
            completions = self.db.query(HabitCompletion).filter(
                HabitCompletion.habit_id == habit.id
            ).order_by(HabitCompletion.completion_date.desc()).limit(30).all()
            
            if completions:
                recent_streak = habit.current_streak or 0
                longest_streak = habit.longest_streak or 0
                
                habit_trends.append({
                    "habit_id": habit.id,
                    "title": habit.title,
                    "current_streak": recent_streak,
                    "longest_streak": longest_streak,
                    "completion_rate": (
                        (len(completions) / 30 * 100)
                        if len(completions) > 0
                        else 0
                    )
                })
        
        avg_streak = (
            np.mean([h["current_streak"] for h in habit_trends])
            if habit_trends
            else 0
        )
        
        return {
            "average_streak": round(avg_streak, 2),
            "trend": "increasing" if avg_streak > 0 else "stable",
            "habits": habit_trends
        }
    
    def analyze_expense_category_trends(
        self,
        user_id: str,
        days: int = 30
    ) -> Dict:
        """Xarajatlar kategoriyalari tendentsiyalarini tahlil qilish"""
        start_date = date.today() - timedelta(days=days)
        
        transactions = self.db.query(Transaction).filter(
            and_(
                Transaction.user_id == user_id,
                Transaction.transaction_type == "expense",
                Transaction.transaction_date >= start_date
            )
        ).all()
        
        if not transactions:
            return {
                "categories": {},
                "total_expense": 0,
                "trends": {}
            }
        
        # Kategoriyalar bo'yicha guruhlash
        category_data = {}
        for txn in transactions:
            cat = txn.category
            if cat not in category_data:
                category_data[cat] = {
                    "total": 0,
                    "count": 0,
                    "dates": []
                }
            
            category_data[cat]["total"] += abs(txn.amount)
            category_data[cat]["count"] += 1
            category_data[cat]["dates"].append(txn.transaction_date)
        
        # Har bir kategoriya uchun trend
        category_trends = {}
        for cat, data in category_data.items():
            if len(data["dates"]) >= 2:
                # Oddiy trend (oxirgi hafta vs oldingi hafta)
                recent_days = 7
                recent_start = date.today() - timedelta(days=recent_days)
                previous_start = recent_start - timedelta(days=recent_days)
                
                recent_total = sum(
                    abs(txn.amount) for txn in transactions
                    if txn.category == cat and txn.transaction_date >= recent_start
                )
                previous_total = sum(
                    abs(txn.amount) for txn in transactions
                    if txn.category == cat
                    and previous_start <= txn.transaction_date < recent_start
                )
                
                if previous_total > 0:
                    change = ((recent_total - previous_total) / previous_total * 100)
                    trend = "increasing" if change > 5 else "decreasing" if change < -5 else "stable"
                else:
                    trend = "increasing" if recent_total > 0 else "stable"
                    change = 0
            else:
                trend = "stable"
                change = 0
            
            category_trends[cat] = {
                "trend": trend,
                "change_percentage": round(change, 2)
            }
        
        total_expense = sum(abs(txn.amount) for txn in transactions)
        
        return {
            "categories": {
                cat: {
                    "total": round(data["total"], 2),
                    "count": data["count"],
                    "average": round(data["total"] / data["count"], 2) if data["count"] > 0 else 0
                }
                for cat, data in category_data.items()
            },
            "total_expense": round(total_expense, 2),
            "trends": category_trends
        }
    
    def calculate_moving_average(
        self,
        values: List[float],
        window: int = 7
    ) -> List[float]:
        """Moving average hisoblash"""
        if len(values) < window:
            return values
        
        df = pd.Series(values)
        return df.rolling(window=window, min_periods=1).mean().tolist()
    
    def calculate_exponential_smoothing(
        self,
        values: List[float],
        alpha: float = 0.3
    ) -> List[float]:
        """Exponential smoothing"""
        if not values:
            return []
        
        smoothed = [values[0]]
        for i in range(1, len(values)):
            smoothed.append(alpha * values[i] + (1 - alpha) * smoothed[i - 1])
        
        return smoothed

