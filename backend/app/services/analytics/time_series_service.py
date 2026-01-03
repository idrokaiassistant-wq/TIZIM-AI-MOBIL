from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List, Dict, Optional
from datetime import date, datetime, timedelta
import pandas as pd
import numpy as np
from app.models import ProductivityLog, Transaction
from app.config.ai_config import ai_config

try:
    from prophet import Prophet
    PROPHET_AVAILABLE = True
except ImportError:
    PROPHET_AVAILABLE = False


class TimeSeriesService:
    """Time series analysis va bashorat servisi"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_productivity_trends(
        self,
        user_id: str,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        period: str = "daily"  # daily, weekly, monthly
    ) -> Dict:
        """Produktivlik tendentsiyalarini olish"""
        if not start_date:
            start_date = date.today() - timedelta(days=30)
        if not end_date:
            end_date = date.today()
        
        logs = self.db.query(ProductivityLog).filter(
            and_(
                ProductivityLog.user_id == user_id,
                ProductivityLog.log_date >= start_date,
                ProductivityLog.log_date <= end_date
            )
        ).order_by(ProductivityLog.log_date).all()
        
        if not logs:
            return {
                "dates": [],
                "tasks_completed": [],
                "habits_completed": [],
                "focus_time": [],
                "energy_level": []
            }
        
        # DataFrame yaratish
        data = []
        for log in logs:
            data.append({
                "date": log.log_date,
                "tasks_completed": log.tasks_completed or 0,
                "tasks_total": log.tasks_total or 0,
                "habits_completed": log.habits_completed or 0,
                "habits_total": log.habits_total or 0,
                "focus_time": log.focus_time_minutes or 0,
                "energy_level": log.energy_level or 5
            })
        
        df = pd.DataFrame(data)
        df["date"] = pd.to_datetime(df["date"])
        
        # Period bo'yicha guruhlash
        if period == "weekly":
            df = df.set_index("date").resample("W").agg({
                "tasks_completed": "sum",
                "tasks_total": "sum",
                "habits_completed": "sum",
                "habits_total": "sum",
                "focus_time": "sum",
                "energy_level": "mean"
            }).reset_index()
        elif period == "monthly":
            df = df.set_index("date").resample("M").agg({
                "tasks_completed": "sum",
                "tasks_total": "sum",
                "habits_completed": "sum",
                "habits_total": "sum",
                "focus_time": "sum",
                "energy_level": "mean"
            }).reset_index()
        
        return {
            "dates": df["date"].dt.strftime("%Y-%m-%d").tolist(),
            "tasks_completed": df["tasks_completed"].tolist(),
            "tasks_total": df["tasks_total"].tolist(),
            "habits_completed": df["habits_completed"].tolist(),
            "habits_total": df["habits_total"].tolist(),
            "focus_time": df["focus_time"].tolist(),
            "energy_level": df["energy_level"].round(2).tolist(),
            "tasks_completion_rate": (
                (df["tasks_completed"] / df["tasks_total"] * 100)
                .fillna(0)
                .round(2)
                .tolist()
            ) if (df["tasks_total"] > 0).any() else [0] * len(df),
            "habits_completion_rate": (
                (df["habits_completed"] / df["habits_total"] * 100)
                .fillna(0)
                .round(2)
                .tolist()
            ) if (df["habits_total"] > 0).any() else [0] * len(df)
        }
    
    def get_expense_trends(
        self,
        user_id: str,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        period: str = "daily"
    ) -> Dict:
        """Xarajatlar tendentsiyalarini olish"""
        if not start_date:
            start_date = date.today() - timedelta(days=30)
        if not end_date:
            end_date = date.today()
        
        transactions = self.db.query(Transaction).filter(
            and_(
                Transaction.user_id == user_id,
                Transaction.transaction_type == "expense",
                Transaction.transaction_date >= start_date,
                Transaction.transaction_date <= end_date
            )
        ).order_by(Transaction.transaction_date).all()
        
        if not transactions:
            return {
                "dates": [],
                "amounts": [],
                "categories": {}
            }
        
        data = []
        for txn in transactions:
            data.append({
                "date": txn.transaction_date,
                "amount": abs(txn.amount),
                "category": txn.category
            })
        
        df = pd.DataFrame(data)
        df["date"] = pd.to_datetime(df["date"])
        
        # Period bo'yicha guruhlash
        if period == "weekly":
            df_grouped = df.set_index("date").resample("W").agg({
                "amount": "sum"
            }).reset_index()
        elif period == "monthly":
            df_grouped = df.set_index("date").resample("M").agg({
                "amount": "sum"
            }).reset_index()
        else:
            df_grouped = df.groupby("date")["amount"].sum().reset_index()
        
        # Kategoriyalar bo'yicha taqsimot
        category_totals = df.groupby("category")["amount"].sum().to_dict()
        
        return {
            "dates": df_grouped["date"].dt.strftime("%Y-%m-%d").tolist(),
            "amounts": df_grouped["amount"].round(2).tolist(),
            "categories": {k: round(v, 2) for k, v in category_totals.items()}
        }
    
    def forecast_productivity(
        self,
        user_id: str,
        days: int = 30
    ) -> Dict:
        """Produktivlik bashorati (Prophet yoki oddiy trend)"""
        if not PROPHET_AVAILABLE:
            return self._simple_forecast_productivity(user_id, days)
        
        start_date = date.today() - timedelta(days=90)
        logs = self.db.query(ProductivityLog).filter(
            and_(
                ProductivityLog.user_id == user_id,
                ProductivityLog.log_date >= start_date
            )
        ).order_by(ProductivityLog.log_date).all()
        
        if len(logs) < 7:
            return {"forecast": [], "dates": []}
        
        # DataFrame yaratish
        data = []
        for log in logs:
            completion_rate = (
                (log.tasks_completed / log.tasks_total * 100)
                if log.tasks_total and log.tasks_total > 0
                else 0
            )
            data.append({
                "ds": log.log_date,
                "y": completion_rate
            })
        
        df = pd.DataFrame(data)
        df["ds"] = pd.to_datetime(df["ds"])
        
        try:
            # Prophet model
            model = Prophet(
                yearly_seasonality=False,
                weekly_seasonality=True,
                daily_seasonality=False
            )
            model.fit(df)
            
            # Bashorat
            future = model.make_future_dataframe(periods=days)
            forecast = model.predict(future)
            
            # Faqat kelajakdagi kunlar
            forecast_future = forecast.tail(days)
            
            return {
                "dates": forecast_future["ds"].dt.strftime("%Y-%m-%d").tolist(),
                "forecast": forecast_future["yhat"].round(2).tolist(),
                "lower_bound": forecast_future["yhat_lower"].round(2).tolist(),
                "upper_bound": forecast_future["yhat_upper"].round(2).tolist()
            }
        except Exception:
            return self._simple_forecast_productivity(user_id, days)
    
    def _simple_forecast_productivity(
        self,
        user_id: str,
        days: int
    ) -> Dict:
        """Oddiy trend asosida bashorat"""
        start_date = date.today() - timedelta(days=30)
        logs = self.db.query(ProductivityLog).filter(
            and_(
                ProductivityLog.user_id == user_id,
                ProductivityLog.log_date >= start_date
            )
        ).order_by(ProductivityLog.log_date).all()
        
        if not logs:
            return {"forecast": [], "dates": []}
        
        # Oddiy moving average
        completion_rates = []
        for log in logs:
            rate = (
                (log.tasks_completed / log.tasks_total * 100)
                if log.tasks_total and log.tasks_total > 0
                else 0
            )
            completion_rates.append(rate)
        
        avg_rate = np.mean(completion_rates) if completion_rates else 0
        
        # Kelajakdagi kunlar
        dates = []
        forecast = []
        for i in range(1, days + 1):
            future_date = date.today() + timedelta(days=i)
            dates.append(future_date.strftime("%Y-%m-%d"))
            forecast.append(round(avg_rate, 2))
        
        return {
            "dates": dates,
            "forecast": forecast,
            "lower_bound": [max(0, f - 10) for f in forecast],
            "upper_bound": [min(100, f + 10) for f in forecast]
        }
    
    def forecast_expenses(
        self,
        user_id: str,
        days: int = 30
    ) -> Dict:
        """Xarajatlar bashorati"""
        start_date = date.today() - timedelta(days=90)
        transactions = self.db.query(Transaction).filter(
            and_(
                Transaction.user_id == user_id,
                Transaction.transaction_type == "expense",
                Transaction.transaction_date >= start_date
            )
        ).order_by(Transaction.transaction_date).all()
        
        if len(transactions) < 7:
            return {"forecast": [], "dates": []}
        
        # Kunlik xarajatlar
        daily_expenses = {}
        for txn in transactions:
            day = txn.transaction_date
            daily_expenses[day] = daily_expenses.get(day, 0) + abs(txn.amount)
        
        # DataFrame
        data = [{"ds": k, "y": v} for k, v in sorted(daily_expenses.items())]
        df = pd.DataFrame(data)
        df["ds"] = pd.to_datetime(df["ds"])
        
        if PROPHET_AVAILABLE and len(df) >= 7:
            try:
                model = Prophet(
                    yearly_seasonality=False,
                    weekly_seasonality=True,
                    daily_seasonality=False
                )
                model.fit(df)
                
                future = model.make_future_dataframe(periods=days)
                forecast = model.predict(future)
                
                forecast_future = forecast.tail(days)
                
                return {
                    "dates": forecast_future["ds"].dt.strftime("%Y-%m-%d").tolist(),
                    "forecast": forecast_future["yhat"].round(2).tolist(),
                    "lower_bound": forecast_future["yhat_lower"].round(2).tolist(),
                    "upper_bound": forecast_future["yhat_upper"].round(2).tolist()
                }
            except Exception:
                pass
        
        # Oddiy bashorat
        avg_expense = np.mean(list(daily_expenses.values())) if daily_expenses else 0
        
        dates = []
        forecast = []
        for i in range(1, days + 1):
            future_date = date.today() + timedelta(days=i)
            dates.append(future_date.strftime("%Y-%m-%d"))
            forecast.append(round(avg_expense, 2))
        
        return {
            "dates": dates,
            "forecast": forecast,
            "lower_bound": [max(0, f * 0.7) for f in forecast],
            "upper_bound": [f * 1.3 for f in forecast]
        }

