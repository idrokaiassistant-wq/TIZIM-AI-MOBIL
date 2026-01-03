from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date


class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: str = "Ish"
    priority: str = "medium"  # low, medium, high
    status: str = "pending"  # pending, in_progress, done, cancelled
    is_focus: bool = False
    due_date: Optional[datetime] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    color: str = "indigo"


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    is_focus: Optional[bool] = None
    due_date: Optional[datetime] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    color: Optional[str] = None


class TaskResponse(TaskBase):
    id: str
    user_id: str
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

