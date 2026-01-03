from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models import User
from app.api.auth import get_current_user
from app.schemas.budget import BudgetCreate, BudgetUpdate, BudgetResponse, BudgetStatus
from app.services import budget_service

router = APIRouter()


@router.get("", response_model=list[BudgetResponse])
async def get_budgets(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    is_active: Optional[bool] = Query(None),
    category: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all budgets with filters and pagination"""
    budgets = budget_service.get_budgets(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        is_active=is_active,
        category=category,
    )
    return budgets


@router.get("/{budget_id}", response_model=BudgetResponse)
async def get_budget(
    budget_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a single budget by ID"""
    budget = budget_service.get_budget(db, budget_id, current_user.id)
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )
    return budget


@router.post("", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
async def create_budget(
    budget: BudgetCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new budget"""
    return budget_service.create_budget(db, budget, current_user.id)


@router.put("/{budget_id}", response_model=BudgetResponse)
async def update_budget(
    budget_id: str,
    budget_update: BudgetUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a budget"""
    budget = budget_service.update_budget(db, budget_id, current_user.id, budget_update)
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )
    return budget


@router.delete("/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_budget(
    budget_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a budget"""
    success = budget_service.delete_budget(db, budget_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )


@router.get("/{budget_id}/status", response_model=BudgetStatus)
async def get_budget_status(
    budget_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get budget status with spending information"""
    status_obj = budget_service.get_budget_status(db, budget_id, current_user.id)
    if not status_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )
    return status_obj

