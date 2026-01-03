from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from typing import Optional, List
from datetime import date
from app.models import ProductivityLog
from app.schemas.productivity import ProductivityLogCreate, ProductivityLogUpdate, ProductivityStats
import uuid


def get_productivity_logs(
    db: Session,
    user_id: str,
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> List[ProductivityLog]:
    """Get productivity logs with filters and pagination"""
    query = db.query(ProductivityLog).filter(ProductivityLog.user_id == user_id)
    
    if start_date:
        query = query.filter(ProductivityLog.log_date >= start_date)
    if end_date:
        query = query.filter(ProductivityLog.log_date <= end_date)
    
    return query.order_by(ProductivityLog.log_date.desc()).offset(skip).limit(limit).all()


def get_productivity_log(db: Session, log_id: str, user_id: str) -> Optional[ProductivityLog]:
    """Get a single productivity log by ID"""
    return db.query(ProductivityLog).filter(
        and_(ProductivityLog.id == log_id, ProductivityLog.user_id == user_id)
    ).first()


def get_productivity_log_by_date(
    db: Session,
    user_id: str,
    log_date: date
) -> Optional[ProductivityLog]:
    """Get productivity log by date"""
    return db.query(ProductivityLog).filter(
        and_(
            ProductivityLog.user_id == user_id,
            ProductivityLog.log_date == log_date
        )
    ).first()


def create_productivity_log(
    db: Session,
    log: ProductivityLogCreate,
    user_id: str
) -> ProductivityLog:
    """Create a new productivity log"""
    # Check if log already exists for this date
    existing = get_productivity_log_by_date(db, user_id, log.log_date)
    if existing:
        raise ValueError(f"Productivity log already exists for date {log.log_date}")
    
    db_log = ProductivityLog(
        id=str(uuid.uuid4()),
        user_id=user_id,
        **log.model_dump(),
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log


def update_productivity_log(
    db: Session,
    log_id: str,
    user_id: str,
    log_update: ProductivityLogUpdate
) -> Optional[ProductivityLog]:
    """Update a productivity log"""
    log = get_productivity_log(db, log_id, user_id)
    if not log:
        return None
    
    update_data = log_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(log, field, value)
    
    db.commit()
    db.refresh(log)
    return log


def delete_productivity_log(db: Session, log_id: str, user_id: str) -> bool:
    """Delete a productivity log"""
    log = get_productivity_log(db, log_id, user_id)
    if not log:
        return False
    db.delete(log)
    db.commit()
    return True


def get_productivity_stats(
    db: Session,
    user_id: str,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> ProductivityStats:
    """Get productivity statistics"""
    query = db.query(ProductivityLog).filter(ProductivityLog.user_id == user_id)
    
    if start_date:
        query = query.filter(ProductivityLog.log_date >= start_date)
    if end_date:
        query = query.filter(ProductivityLog.log_date <= end_date)
    
    # Calculate aggregates
    result = query.with_entities(
        func.sum(ProductivityLog.tasks_completed).label("total_tasks_completed"),
        func.sum(ProductivityLog.tasks_total).label("total_tasks"),
        func.sum(ProductivityLog.habits_completed).label("total_habits_completed"),
        func.sum(ProductivityLog.habits_total).label("total_habits"),
        func.sum(ProductivityLog.focus_time_minutes).label("total_focus_time"),
        func.avg(ProductivityLog.energy_level).label("avg_energy"),
    ).first()
    
    total_tasks_completed = int(result[0] or 0)
    total_tasks = int(result[1] or 0)
    total_habits_completed = int(result[2] or 0)
    total_habits = int(result[3] or 0)
    total_focus_time_minutes = int(result[4] or 0)
    average_energy_level = float(result[5] or 0)
    
    # Calculate completion rates
    average_tasks_completion_rate = (
        (total_tasks_completed / total_tasks * 100) if total_tasks > 0 else 0
    )
    average_habits_completion_rate = (
        (total_habits_completed / total_habits * 100) if total_habits > 0 else 0
    )
    
    return ProductivityStats(
        total_tasks_completed=total_tasks_completed,
        total_tasks=total_tasks,
        total_habits_completed=total_habits_completed,
        total_habits=total_habits,
        total_focus_time_minutes=total_focus_time_minutes,
        average_energy_level=round(average_energy_level, 2),
        average_tasks_completion_rate=round(average_tasks_completion_rate, 2),
        average_habits_completion_rate=round(average_habits_completion_rate, 2),
    )

