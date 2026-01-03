from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class BudgetBase(BaseModel):
    category: str
    amount: float
    period: str  # 'daily', 'weekly', 'monthly', 'yearly'
    start_date: date
    end_date: Optional[date] = None
    is_active: bool = True


class BudgetCreate(BudgetBase):
    pass


class BudgetUpdate(BaseModel):
    category: Optional[str] = None
    amount: Optional[float] = None
    period: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_active: Optional[bool] = None


class BudgetResponse(BudgetBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BudgetStatus(BaseModel):
    budget_id: str
    category: str
    budget_amount: float
    spent_amount: float
    remaining_amount: float
    percentage_used: float
    is_over_budget: bool

