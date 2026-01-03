from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models import User
from app.api.auth import get_current_user
from app.schemas.habit import (
    HabitCreate,
    HabitUpdate,
    HabitResponse,
    HabitCompletionCreate,
    HabitCompletionResponse,
)
from app.services import habit_service

router = APIRouter()


@router.get("", response_model=list[HabitResponse])
async def get_habits(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    is_active: Optional[bool] = Query(None),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all habits with filters and pagination"""
    habits = habit_service.get_habits(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        is_active=is_active,
        category=category,
        search=search,
    )
    return habits


@router.get("/{habit_id}", response_model=HabitResponse)
async def get_habit(
    habit_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a single habit by ID"""
    habit = habit_service.get_habit(db, habit_id, current_user.id)
    if not habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )
    return habit


@router.post("", response_model=HabitResponse, status_code=status.HTTP_201_CREATED)
async def create_habit(
    habit: HabitCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new habit"""
    return habit_service.create_habit(db, habit, current_user.id)


@router.put("/{habit_id}", response_model=HabitResponse)
async def update_habit(
    habit_id: str,
    habit_update: HabitUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a habit"""
    habit = habit_service.update_habit(db, habit_id, current_user.id, habit_update)
    if not habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )
    return habit


@router.delete("/{habit_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_habit(
    habit_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a habit"""
    success = habit_service.delete_habit(db, habit_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )


@router.post("/{habit_id}/complete", response_model=HabitCompletionResponse)
async def complete_habit(
    habit_id: str,
    completion: HabitCompletionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Mark habit as completed for a specific date"""
    completion_obj = habit_service.complete_habit(
        db, habit_id, current_user.id, completion
    )
    if not completion_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )
    return completion_obj


@router.get("/{habit_id}/completions", response_model=list[HabitCompletionResponse])
async def get_habit_completions(
    habit_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get habit completion history"""
    completions = habit_service.get_habit_completions(
        db, habit_id, current_user.id, skip, limit
    )
    return completions

