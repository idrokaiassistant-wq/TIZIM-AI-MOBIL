from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class ProductivityLogBase(BaseModel):
    log_date: date
    tasks_completed: int = 0
    tasks_total: int = 0
    habits_completed: int = 0
    habits_total: int = 0
    focus_time_minutes: int = 0
    energy_level: int = 5  # 1-10
    mood: Optional[str] = None  # 'great', 'good', 'ok', 'bad', 'terrible'
    notes: Optional[str] = None


class ProductivityLogCreate(ProductivityLogBase):
    pass


class ProductivityLogUpdate(BaseModel):
    tasks_completed: Optional[int] = None
    tasks_total: Optional[int] = None
    habits_completed: Optional[int] = None
    habits_total: Optional[int] = None
    focus_time_minutes: Optional[int] = None
    energy_level: Optional[int] = None
    mood: Optional[str] = None
    notes: Optional[str] = None


class ProductivityLogResponse(ProductivityLogBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProductivityStats(BaseModel):
    total_tasks_completed: int
    total_tasks: int
    total_habits_completed: int
    total_habits: int
    total_focus_time_minutes: int
    average_energy_level: float
    average_tasks_completion_rate: float
    average_habits_completion_rate: float

