from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import Optional, List
from datetime import datetime
from app.models import Task
from app.schemas.task import TaskCreate, TaskUpdate
import uuid


def get_tasks(
    db: Session,
    user_id: str,
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    category: Optional[str] = None,
    is_focus: Optional[bool] = None,
    search: Optional[str] = None,
) -> List[Task]:
    """Get tasks with filters and pagination"""
    query = db.query(Task).filter(Task.user_id == user_id)
    
    if status:
        query = query.filter(Task.status == status)
    if category:
        query = query.filter(Task.category == category)
    if is_focus is not None:
        query = query.filter(Task.is_focus == (1 if is_focus else 0))
    if search:
        query = query.filter(
            or_(
                Task.title.ilike(f"%{search}%"),
                Task.description.ilike(f"%{search}%")
            )
        )
    
    return query.order_by(Task.created_at.desc()).offset(skip).limit(limit).all()


def get_task(db: Session, task_id: str, user_id: str) -> Optional[Task]:
    """Get a single task by ID"""
    return db.query(Task).filter(
        and_(Task.id == task_id, Task.user_id == user_id)
    ).first()


def create_task(db: Session, task: TaskCreate, user_id: str) -> Task:
    """Create a new task"""
    db_task = Task(
        id=str(uuid.uuid4()),
        user_id=user_id,
        **task.model_dump(),
        is_focus=1 if task.is_focus else 0,
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


def update_task(
    db: Session,
    task_id: str,
    user_id: str,
    task_update: TaskUpdate
) -> Optional[Task]:
    """Update a task"""
    task = get_task(db, task_id, user_id)
    if not task:
        return None
    
    update_data = task_update.model_dump(exclude_unset=True)
    if "is_focus" in update_data:
        update_data["is_focus"] = 1 if update_data["is_focus"] else 0
    
    for field, value in update_data.items():
        setattr(task, field, value)
    
    # Update completed_at if status is done
    if update_data.get("status") == "done" and task.completed_at is None:
        task.completed_at = datetime.utcnow()
    elif update_data.get("status") != "done":
        task.completed_at = None
    
    db.commit()
    db.refresh(task)
    return task


def delete_task(db: Session, task_id: str, user_id: str) -> bool:
    """Delete a task"""
    task = get_task(db, task_id, user_id)
    if not task:
        return False
    db.delete(task)
    db.commit()
    return True


def toggle_task_status(db: Session, task_id: str, user_id: str) -> Optional[Task]:
    """Toggle task status between pending and done"""
    task = get_task(db, task_id, user_id)
    if not task:
        return None
    
    if task.status == "done":
        task.status = "pending"
        task.completed_at = None
    else:
        task.status = "done"
        task.completed_at = datetime.utcnow()
    
    db.commit()
    db.refresh(task)
    return task

