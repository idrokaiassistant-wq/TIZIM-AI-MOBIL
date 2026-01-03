from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from typing import Dict, Optional
from datetime import date, timedelta
from app.models import Task, Habit, HabitCompletion, ProductivityLog, Transaction
from app.services.analytics.trend_analyzer import TrendAnalyzer
from app.services.analytics.time_series_service import TimeSeriesService


class InsightsService:
    """Aqlli xulosa generatsiya qilish servisi"""
    
    def __init__(self, db: Session):
        self.db = db
        self.trend_analyzer = TrendAnalyzer(db)
        self.time_series = TimeSeriesService(db)
    
    def generate_daily_insights(
        self,
        user_id: str
    ) -> Dict:
        """Kunlik xulosa generatsiya qilish"""
        today = date.today()
        
        # Bugungi vazifalar
        today_tasks = self.db.query(Task).filter(
            and_(
                Task.user_id == user_id,
                func.date(Task.created_at) == today
            )
        ).all()
        
        completed_tasks = [t for t in today_tasks if t.status == "done"]
        completion_rate = (
            (len(completed_tasks) / len(today_tasks) * 100)
            if today_tasks
            else 0
        )
        
        # Bugungi odatlar
        active_habits = self.db.query(Habit).filter(
            and_(
                Habit.user_id == user_id,
                Habit.is_active == 1
            )
        ).all()
        
        completed_habits = self.db.query(HabitCompletion).filter(
            and_(
                HabitCompletion.habit_id.in_([h.id for h in active_habits]),
                HabitCompletion.completion_date == today
            )
        ).count()
        
        habit_completion_rate = (
            (completed_habits / len(active_habits) * 100)
            if active_habits
            else 0
        )
        
        # Bugungi xarajatlar
        today_expenses = self.db.query(Transaction).filter(
            and_(
                Transaction.user_id == user_id,
                Transaction.transaction_type == "expense",
                Transaction.transaction_date == today
            )
        ).all()
        
        total_expense = sum(abs(txn.amount) for txn in today_expenses)
        
        # Xulosa
        insights = {
            "date": today.isoformat(),
            "summary": {
                "tasks_completed": len(completed_tasks),
                "tasks_total": len(today_tasks),
                "tasks_completion_rate": round(completion_rate, 2),
                "habits_completed": completed_habits,
                "habits_total": len(active_habits),
                "habits_completion_rate": round(habit_completion_rate, 2),
                "total_expense": round(total_expense, 2)
            },
            "insights": [],
            "recommendations": []
        }
        
        # Insightlar
        if completion_rate >= 80:
            insights["insights"].append("Ajoyib! Bugun ko'p vazifalar bajarildi.")
        elif completion_rate < 50:
            insights["insights"].append("Bugun vazifalar bajarilishi past. Ertaga yaxshiroq bo'ladi!")
        
        if habit_completion_rate >= 80:
            insights["insights"].append("Odatlar ajoyib bajarilmoqda!")
        elif habit_completion_rate < 50:
            insights["insights"].append("Odatlarni bajarishni yaxshilash kerak.")
        
        # Tavsiyalar
        if completion_rate < 50:
            insights["recommendations"].append("Ertaga vazifalarni kichik qismlarga bo'ling.")
        
        if habit_completion_rate < 50:
            insights["recommendations"].append("Odatlarni kunlik rejangizga qo'shing.")
        
        # Trend tahlili
        task_trend = self.trend_analyzer.analyze_task_completion_trends(user_id, days=7)
        if task_trend["trend"] == "increasing":
            insights["insights"].append("Oxirgi haftada vazifalar bajarilishi yaxshilanmoqda.")
        elif task_trend["trend"] == "decreasing":
            insights["recommendations"].append("Vazifalar bajarilishi pasaymoqda. Prioritetlarni ko'rib chiqing.")
        
        return insights
    
    def generate_weekly_insights(
        self,
        user_id: str
    ) -> Dict:
        """Haftalik xulosa"""
        week_start = date.today() - timedelta(days=7)
        
        # Haftalik statistika
        tasks = self.db.query(Task).filter(
            and_(
                Task.user_id == user_id,
                func.date(Task.created_at) >= week_start
            )
        ).all()
        
        completed_tasks = [t for t in tasks if t.status == "done"]
        
        # Haftalik odatlar
        habits = self.db.query(Habit).filter(
            and_(
                Habit.user_id == user_id,
                Habit.is_active == 1
            )
        ).all()
        
        habit_completions = self.db.query(HabitCompletion).filter(
            and_(
                HabitCompletion.habit_id.in_([h.id for h in habits]),
                HabitCompletion.completion_date >= week_start
            )
        ).count()
        
        # Haftalik xarajatlar
        expenses = self.db.query(Transaction).filter(
            and_(
                Transaction.user_id == user_id,
                Transaction.transaction_type == "expense",
                Transaction.transaction_date >= week_start
            )
        ).all()
        
        total_expense = sum(abs(txn.amount) for txn in expenses)
        
        # Trend tahlili
        task_trend = self.trend_analyzer.analyze_task_completion_trends(user_id, days=7)
        expense_trend = self.trend_analyzer.analyze_expense_category_trends(user_id, days=7)
        
        insights = {
            "period": "weekly",
            "start_date": week_start.isoformat(),
            "end_date": date.today().isoformat(),
            "summary": {
                "tasks_completed": len(completed_tasks),
                "tasks_total": len(tasks),
                "tasks_completion_rate": round((len(completed_tasks) / len(tasks) * 100) if tasks else 0, 2),
                "habits_completed": habit_completions,
                "habits_total": len(habits) * 7,  # Har bir odat uchun 7 kun
                "habits_completion_rate": round((habit_completions / (len(habits) * 7) * 100) if habits else 0, 2),
                "total_expense": round(total_expense, 2)
            },
            "trends": {
                "tasks": task_trend["trend"],
                "expenses": expense_trend.get("trends", {})
            },
            "insights": [],
            "recommendations": []
        }
        
        # Insightlar
        if task_trend["trend"] == "increasing":
            insights["insights"].append("Hafta davomida vazifalar bajarilishi yaxshilanmoqda.")
        elif task_trend["trend"] == "decreasing":
            insights["insights"].append("Vazifalar bajarilishi pasaymoqda.")
        
        if insights["summary"]["tasks_completion_rate"] >= 70:
            insights["insights"].append("Hafta muvaffaqiyatli o'tdi!")
        
        # Tavsiyalar
        if insights["summary"]["tasks_completion_rate"] < 50:
            insights["recommendations"].append("Vazifalarni kichik qismlarga bo'ling va prioritetlarni aniqlang.")
        
        return insights
    
    def generate_monthly_insights(
        self,
        user_id: str
    ) -> Dict:
        """Oylik xulosa"""
        month_start = date.today() - timedelta(days=30)
        
        # Oylik statistika
        tasks = self.db.query(Task).filter(
            and_(
                Task.user_id == user_id,
                func.date(Task.created_at) >= month_start
            )
        ).all()
        
        completed_tasks = [t for t in tasks if t.status == "done"]
        
        # Oylik xarajatlar
        expenses = self.db.query(Transaction).filter(
            and_(
                Transaction.user_id == user_id,
                Transaction.transaction_type == "expense",
                Transaction.transaction_date >= month_start
            )
        ).all()
        
        total_expense = sum(abs(txn.amount) for txn in expenses)
        
        # Kategoriyalar bo'yicha
        category_expenses = {}
        for txn in expenses:
            cat = txn.category
            category_expenses[cat] = category_expenses.get(cat, 0) + abs(txn.amount)
        
        top_category = max(category_expenses.items(), key=lambda x: x[1])[0] if category_expenses else None
        
        insights = {
            "period": "monthly",
            "start_date": month_start.isoformat(),
            "end_date": date.today().isoformat(),
            "summary": {
                "tasks_completed": len(completed_tasks),
                "tasks_total": len(tasks),
                "tasks_completion_rate": round((len(completed_tasks) / len(tasks) * 100) if tasks else 0, 2),
                "total_expense": round(total_expense, 2),
                "top_category": top_category
            },
            "insights": [],
            "recommendations": []
        }
        
        # Insightlar
        if insights["summary"]["tasks_completion_rate"] >= 70:
            insights["insights"].append("Oy davomida ajoyib ishladingiz!")
        
        if top_category:
            insights["insights"].append(f"Eng ko'p xarajat qilingan kategoriya: {top_category}")
        
        return insights

