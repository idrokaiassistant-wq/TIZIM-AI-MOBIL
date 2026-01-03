from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime


class HabitBase(BaseModel):
    title: str
    description: Optional[str] = None
    goal: str  # '30 min', '2 Litr', 'Har kuni'
    category: Optional[str] = None
    icon: str = "Zap"
    color: str = "text-purple-500"
    bg_color: str = "bg-purple-100"
    is_active: bool = True


class HabitCreate(HabitBase):
    pass


class HabitUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    goal: Optional[str] = None
    category: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    bg_color: Optional[str] = None
    is_active: Optional[bool] = None


class HabitResponse(HabitBase):
    id: str
    user_id: str
    current_streak: int
    longest_streak: int
    total_completions: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class HabitCompletionCreate(BaseModel):
    completion_date: date
    progress: int = 100  # 0-100
    notes: Optional[str] = None


class HabitCompletionResponse(BaseModel):
    id: str
    habit_id: str
    completion_date: date
    progress: int
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

