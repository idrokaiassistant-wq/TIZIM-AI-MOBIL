from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date
from app.database import get_db
from app.models import User
from app.api.auth import get_current_user
from app.schemas.productivity import (
    ProductivityLogCreate,
    ProductivityLogUpdate,
    ProductivityLogResponse,
    ProductivityStats,
)
from app.services import productivity_service

router = APIRouter()


@router.get("/logs", response_model=list[ProductivityLogResponse])
async def get_productivity_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all productivity logs with filters and pagination"""
    logs = productivity_service.get_productivity_logs(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        start_date=start_date,
        end_date=end_date,
    )
    return logs


@router.get("/logs/{log_id}", response_model=ProductivityLogResponse)
async def get_productivity_log(
    log_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a single productivity log by ID"""
    log = productivity_service.get_productivity_log(db, log_id, current_user.id)
    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Productivity log not found"
        )
    return log


@router.post("/logs", response_model=ProductivityLogResponse, status_code=status.HTTP_201_CREATED)
async def create_productivity_log(
    log: ProductivityLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new productivity log"""
    try:
        return productivity_service.create_productivity_log(db, log, current_user.id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.put("/logs/{log_id}", response_model=ProductivityLogResponse)
async def update_productivity_log(
    log_id: str,
    log_update: ProductivityLogUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a productivity log"""
    log = productivity_service.update_productivity_log(
        db, log_id, current_user.id, log_update
    )
    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Productivity log not found"
        )
    return log


@router.delete("/logs/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_productivity_log(
    log_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a productivity log"""
    success = productivity_service.delete_productivity_log(db, log_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Productivity log not found"
        )


@router.get("/stats", response_model=ProductivityStats)
async def get_productivity_stats(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get productivity statistics"""
    return productivity_service.get_productivity_stats(
        db, current_user.id, start_date, end_date
    )

