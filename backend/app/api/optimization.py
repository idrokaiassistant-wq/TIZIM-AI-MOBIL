from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from app.database import get_db
from app.models import User
from app.api.auth import get_current_user
from app.services.optimization.task_scheduler import TaskScheduler
from app.services.optimization.budget_optimizer import BudgetOptimizer

router = APIRouter()


class TaskScheduleRequest(BaseModel):
    task_ids: List[str]
    available_hours: int = 8


class BudgetSuggestionRequest(BaseModel):
    total_budget: float
    period: str = "monthly"


@router.post("/tasks/schedule")
async def schedule_tasks(
    request: TaskScheduleRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Vazifalarni optimal tartibda joylashtirish"""
    try:
        service = TaskScheduler(db)
        from app.models import Task
        
        tasks = db.query(Task).filter(
            Task.id.in_(request.task_ids),
            Task.user_id == current_user.id
        ).all()
        
        if len(tasks) != len(request.task_ids):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Some tasks not found"
            )
        
        scheduled = service.schedule_tasks(
            current_user.id,
            tasks,
            request.available_hours
        )
        return {"scheduled": scheduled}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to schedule tasks: {str(e)}"
        )


@router.post("/tasks/optimize-order")
async def optimize_task_order(
    task_ids: List[str],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Vazifalar tartibini optimallashtirish"""
    try:
        service = TaskScheduler(db)
        optimized = service.optimize_task_order(current_user.id, task_ids)
        return {"optimized_order": optimized}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to optimize order: {str(e)}"
        )


@router.get("/tasks/{task_id}/suggest-timing")
async def suggest_task_timing(
    task_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Vazifa uchun optimal vaqtni tavsiya qilish"""
    try:
        service = TaskScheduler(db)
        suggestion = service.suggest_task_timing(current_user.id, task_id)
        return suggestion
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to suggest timing: {str(e)}"
        )


@router.post("/budget/suggest")
async def suggest_budget_allocations(
    request: BudgetSuggestionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Byudjet taqsimotini tavsiya qilish"""
    try:
        service = BudgetOptimizer(db)
        suggestions = service.suggest_budget_allocations(
            current_user.id,
            request.total_budget,
            request.period
        )
        return {"suggestions": suggestions}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to suggest budget: {str(e)}"
        )


@router.post("/budget/{budget_id}/optimize")
async def optimize_budget(
    budget_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Mavjud byudjetni optimallashtirish"""
    try:
        service = BudgetOptimizer(db)
        result = service.optimize_budget(current_user.id, budget_id)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to optimize budget: {str(e)}"
        )

