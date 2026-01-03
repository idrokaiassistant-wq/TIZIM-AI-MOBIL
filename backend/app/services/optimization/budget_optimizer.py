from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from typing import List, Dict, Optional
from datetime import date, timedelta
from app.models import Budget, Transaction


class BudgetOptimizer:
    """Byudjet optimizatsiyasi servisi"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def suggest_budget_allocations(
        self,
        user_id: str,
        total_budget: float,
        period: str = "monthly"
    ) -> List[Dict]:
        """Byudjet taqsimotini tavsiya qilish"""
        # Oxirgi 3 oy xarajatlari
        start_date = date.today() - timedelta(days=90)
        
        transactions = self.db.query(Transaction).filter(
            and_(
                Transaction.user_id == user_id,
                Transaction.transaction_type == "expense",
                Transaction.transaction_date >= start_date
            )
        ).all()
        
        if not transactions:
            # Default taqsimot
            return self._get_default_allocations(total_budget)
        
        # Kategoriyalar bo'yicha xarajatlar
        category_expenses = {}
        for txn in transactions:
            cat = txn.category
            category_expenses[cat] = category_expenses.get(cat, 0) + abs(txn.amount)
        
        total_expense = sum(category_expenses.values())
        
        # Har bir kategoriya uchun foiz
        suggestions = []
        for cat, expense in category_expenses.items():
            percentage = (expense / total_expense * 100) if total_expense > 0 else 0
            suggested_amount = total_budget * (percentage / 100)
            
            suggestions.append({
                "category": cat,
                "suggested_amount": round(suggested_amount, 2),
                "percentage": round(percentage, 2),
                "historical_average": round(expense / 3, 2),  # Oylik o'rtacha
                "reason": f"Tarixiy xarajatlar asosida"
            })
        
        # Amount bo'yicha saralash
        suggestions.sort(key=lambda x: x["suggested_amount"], reverse=True)
        
        return suggestions
    
    def optimize_budget(
        self,
        user_id: str,
        budget_id: str
    ) -> Dict:
        """Mavjud byudjetni optimallashtirish"""
        budget = self.db.query(Budget).filter(
            Budget.id == budget_id,
            Budget.user_id == user_id
        ).first()
        
        if not budget:
            return {"optimized": False}
        
        # Joriy davr xarajatlari
        start_date = budget.start_date
        end_date = budget.end_date or date.today()
        
        transactions = self.db.query(Transaction).filter(
            and_(
                Transaction.user_id == user_id,
                Transaction.transaction_type == "expense",
                Transaction.category == budget.category,
                Transaction.transaction_date >= start_date,
                Transaction.transaction_date <= end_date
            )
        ).all()
        
        spent = sum(abs(txn.amount) for txn in transactions)
        remaining = budget.amount - spent
        percentage_used = (spent / budget.amount * 100) if budget.amount > 0 else 0
        
        # Optimizatsiya tavsiyalari
        recommendations = []
        
        if percentage_used > 100:
            recommendations.append({
                "type": "warning",
                "message": f"Byudjetdan {abs(remaining):.2f} oshib ketgan",
                "suggestion": "Xarajatlarni kamaytirish yoki byudjetni oshirish kerak"
            })
        elif percentage_used > 80:
            recommendations.append({
                "type": "alert",
                "message": f"Byudjetning {percentage_used:.1f}% ishlatilgan",
                "suggestion": "Xarajatlarni nazorat qiling"
            })
        
        # Kategoriya bo'yicha taqqoslash
        if len(transactions) > 0:
            avg_transaction = spent / len(transactions)
            if avg_transaction > budget.amount * 0.1:
                recommendations.append({
                    "type": "info",
                    "message": f"O'rtacha tranzaksiya: {avg_transaction:.2f}",
                    "suggestion": "Kichik xarajatlarni birlashtirishni ko'rib chiqing"
                })
        
        return {
            "optimized": True,
            "budget_id": budget_id,
            "spent": round(spent, 2),
            "remaining": round(remaining, 2),
            "percentage_used": round(percentage_used, 2),
            "recommendations": recommendations
        }
    
    def _get_default_allocations(
        self,
        total_budget: float
    ) -> List[Dict]:
        """Default byudjet taqsimoti"""
        default_percentages = {
            "Oziq-ovqat": 30,
            "Transport": 15,
            "Uy": 20,
            "Telefon": 5,
            "Sog'liq": 10,
            "Ta'lim": 10,
            "Boshqa": 10
        }
        
        suggestions = []
        for category, percentage in default_percentages.items():
            suggestions.append({
                "category": category,
                "suggested_amount": round(total_budget * (percentage / 100), 2),
                "percentage": percentage,
                "historical_average": 0,
                "reason": "Standart taqsimot"
            })
        
        return suggestions

