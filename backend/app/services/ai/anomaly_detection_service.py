from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Dict, Optional
from datetime import date, timedelta
import numpy as np
from app.models import Transaction, Habit, HabitCompletion
from app.config.ai_config import ai_config

try:
    from sklearn.ensemble import IsolationForest
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False


class AnomalyDetectionService:
    """Anomaliya aniqlash servisi"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def detect_expense_anomalies(
        self,
        user_id: str,
        days: int = 30
    ) -> List[Dict]:
        """Xarajatlar anomaliyalarini aniqlash"""
        start_date = date.today() - timedelta(days=days)
        
        transactions = self.db.query(Transaction).filter(
            and_(
                Transaction.user_id == user_id,
                Transaction.transaction_type == "expense",
                Transaction.transaction_date >= start_date
            )
        ).all()
        
        if len(transactions) < 5:
            return []
        
        # Oddiy statistika
        amounts = [abs(txn.amount) for txn in transactions]
        mean_amount = np.mean(amounts)
        std_amount = np.std(amounts)
        
        anomalies = []
        
        if SKLEARN_AVAILABLE and len(transactions) >= 10:
            # Isolation Forest
            try:
                # Features: amount, category encoded, day of week
                features = []
                category_map = {}
                category_idx = 0
                
                for txn in transactions:
                    cat = txn.category
                    if cat not in category_map:
                        category_map[cat] = category_idx
                        category_idx += 1
                    
                    day_of_week = txn.transaction_date.weekday()
                    features.append([
                        abs(txn.amount),
                        category_map[cat],
                        day_of_week
                    ])
                
                # Normalize
                features = np.array(features)
                features[:, 0] = (features[:, 0] - features[:, 0].mean()) / (features[:, 0].std() + 1e-8)
                
                # Isolation Forest
                iso_forest = IsolationForest(
                    contamination=ai_config.anomaly_contamination,
                    random_state=42
                )
                predictions = iso_forest.fit_predict(features)
                
                # Anomalies
                for i, txn in enumerate(transactions):
                    if predictions[i] == -1:  # Anomaly
                        anomalies.append({
                            "transaction_id": txn.id,
                            "title": txn.title,
                            "amount": abs(txn.amount),
                            "category": txn.category,
                            "date": txn.transaction_date.isoformat(),
                            "reason": f"Kutilmagan katta xarajat (o'rtacha: {mean_amount:.2f})",
                            "severity": "high" if abs(txn.amount) > mean_amount + 2 * std_amount else "medium"
                        })
            except Exception:
                pass
        
        # Fallback: Z-score method
        if not anomalies:
            threshold = mean_amount + 2 * std_amount
            for txn in transactions:
                amount = abs(txn.amount)
                if amount > threshold:
                    anomalies.append({
                        "transaction_id": txn.id,
                        "title": txn.title,
                        "amount": amount,
                        "category": txn.category,
                        "date": txn.transaction_date.isoformat(),
                        "reason": f"Kutilmagan katta xarajat (o'rtacha: {mean_amount:.2f})",
                        "severity": "high" if amount > mean_amount + 3 * std_amount else "medium"
                    })
        
        # Amount bo'yicha saralash
        anomalies.sort(key=lambda x: x["amount"], reverse=True)
        
        return anomalies
    
    def detect_habit_anomalies(
        self,
        user_id: str
    ) -> List[Dict]:
        """Odatlar bajarilishida anomaliyalar"""
        habits = self.db.query(Habit).filter(
            and_(
                Habit.user_id == user_id,
                Habit.is_active == 1
            )
        ).all()
        
        anomalies = []
        
        for habit in habits:
            completions = self.db.query(HabitCompletion).filter(
                HabitCompletion.habit_id == habit.id
            ).order_by(HabitCompletion.completion_date.desc()).limit(30).all()
            
            if len(completions) < 5:
                continue
            
            # Streak uzilishi
            if habit.current_streak == 0 and habit.longest_streak > 7:
                last_completion = completions[0] if completions else None
                if last_completion:
                    days_since = (date.today() - last_completion.completion_date).days
                    if days_since > 7:
                        anomalies.append({
                            "habit_id": habit.id,
                            "title": habit.title,
                            "reason": f"Uzoq tanaffus: {days_since} kun",
                            "severity": "high" if days_since > 14 else "medium",
                            "current_streak": habit.current_streak,
                            "longest_streak": habit.longest_streak
                        })
            
            # Completion rate pasayishi
            if len(completions) >= 14:
                recent_completions = len([c for c in completions[:7] if c])
                previous_completions = len([c for c in completions[7:14] if c])
                
                if previous_completions > 0:
                    rate_change = (recent_completions - previous_completions) / previous_completions
                    if rate_change < -0.5:  # 50% pasayish
                        anomalies.append({
                            "habit_id": habit.id,
                            "title": habit.title,
                            "reason": f"Bajarilish darajasi pasaygan ({rate_change*100:.0f}%)",
                            "severity": "medium",
                            "current_streak": habit.current_streak,
                            "longest_streak": habit.longest_streak
                        })
        
        return anomalies

