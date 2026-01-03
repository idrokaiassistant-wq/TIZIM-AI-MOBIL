from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class TransactionBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: str
    amount: float
    transaction_type: str  # 'income', 'expense'
    transaction_date: date
    icon: str = "CreditCard"
    color: str = "bg-slate-100 text-slate-600"
    receipt_url: Optional[str] = None


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    amount: Optional[float] = None
    transaction_type: Optional[str] = None
    transaction_date: Optional[date] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    receipt_url: Optional[str] = None


class TransactionResponse(TransactionBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TransactionStats(BaseModel):
    total_income: float
    total_expense: float
    balance: float
    income_count: int
    expense_count: int

