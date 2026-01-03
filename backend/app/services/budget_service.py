from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from typing import Optional, List
from datetime import date, datetime
from app.models import Budget, Transaction
from app.schemas.budget import BudgetCreate, BudgetUpdate, BudgetStatus
import uuid


def get_budgets(
    db: Session,
    user_id: str,
    skip: int = 0,
    limit: int = 100,
    is_active: Optional[bool] = None,
    category: Optional[str] = None,
) -> List[Budget]:
    """Get budgets with filters and pagination"""
    query = db.query(Budget).filter(Budget.user_id == user_id)
    
    if is_active is not None:
        query = query.filter(Budget.is_active == (1 if is_active else 0))
    if category:
        query = query.filter(Budget.category == category)
    
    return query.order_by(Budget.created_at.desc()).offset(skip).limit(limit).all()


def get_budget(db: Session, budget_id: str, user_id: str) -> Optional[Budget]:
    """Get a single budget by ID"""
    return db.query(Budget).filter(
        and_(Budget.id == budget_id, Budget.user_id == user_id)
    ).first()


def create_budget(db: Session, budget: BudgetCreate, user_id: str) -> Budget:
    """Create a new budget"""
    db_budget = Budget(
        id=str(uuid.uuid4()),
        user_id=user_id,
        **budget.model_dump(),
        is_active=1 if budget.is_active else 0,
    )
    db.add(db_budget)
    db.commit()
    db.refresh(db_budget)
    return db_budget


def update_budget(
    db: Session,
    budget_id: str,
    user_id: str,
    budget_update: BudgetUpdate
) -> Optional[Budget]:
    """Update a budget"""
    budget = get_budget(db, budget_id, user_id)
    if not budget:
        return None
    
    update_data = budget_update.model_dump(exclude_unset=True)
    if "is_active" in update_data:
        update_data["is_active"] = 1 if update_data["is_active"] else 0
    
    for field, value in update_data.items():
        setattr(budget, field, value)
    
    db.commit()
    db.refresh(budget)
    return budget


def delete_budget(db: Session, budget_id: str, user_id: str) -> bool:
    """Delete a budget"""
    budget = get_budget(db, budget_id, user_id)
    if not budget:
        return False
    db.delete(budget)
    db.commit()
    return True


def get_budget_status(
    db: Session,
    budget_id: str,
    user_id: str,
) -> Optional[BudgetStatus]:
    """Get budget status with spending information"""
    budget = get_budget(db, budget_id, user_id)
    if not budget:
        return None
    
    # Calculate date range based on period
    today = date.today()
    start_date = budget.start_date
    end_date = budget.end_date or today
    
    # Get transactions for this category in the date range
    transactions = db.query(Transaction).filter(
        and_(
            Transaction.user_id == user_id,
            Transaction.category == budget.category,
            Transaction.transaction_type == "expense",
            Transaction.transaction_date >= start_date,
            Transaction.transaction_date <= end_date,
        )
    ).all()
    
    # Calculate spent amount
    spent_amount = sum(abs(t.amount) for t in transactions)
    
    # Calculate percentage and remaining
    percentage_used = (spent_amount / budget.amount * 100) if budget.amount > 0 else 0
    remaining_amount = budget.amount - spent_amount
    is_over_budget = spent_amount > budget.amount
    
    return BudgetStatus(
        budget_id=budget.id,
        category=budget.category,
        budget_amount=budget.amount,
        spent_amount=spent_amount,
        remaining_amount=remaining_amount,
        percentage_used=round(percentage_used, 2),
        is_over_budget=is_over_budget,
    )

