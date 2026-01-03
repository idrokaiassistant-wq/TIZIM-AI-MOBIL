from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from typing import Optional, List
from datetime import date, datetime, timedelta
from app.models import Habit, HabitCompletion
from app.schemas.habit import HabitCreate, HabitUpdate, HabitCompletionCreate
import uuid


def get_habits(
    db: Session,
    user_id: str,
    skip: int = 0,
    limit: int = 100,
    is_active: Optional[bool] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
) -> List[Habit]:
    """Get habits with filters and pagination"""
    query = db.query(Habit).filter(Habit.user_id == user_id)
    
    if is_active is not None:
        query = query.filter(Habit.is_active == (1 if is_active else 0))
    if category:
        query = query.filter(Habit.category == category)
    if search:
        query = query.filter(
            or_(
                Habit.title.ilike(f"%{search}%"),
                Habit.description.ilike(f"%{search}%")
            )
        )
    
    return query.order_by(Habit.created_at.desc()).offset(skip).limit(limit).all()


def get_habit(db: Session, habit_id: str, user_id: str) -> Optional[Habit]:
    """Get a single habit by ID"""
    return db.query(Habit).filter(
        and_(Habit.id == habit_id, Habit.user_id == user_id)
    ).first()


def create_habit(db: Session, habit: HabitCreate, user_id: str) -> Habit:
    """Create a new habit"""
    db_habit = Habit(
        id=str(uuid.uuid4()),
        user_id=user_id,
        **habit.model_dump(),
        is_active=1 if habit.is_active else 0,
    )
    db.add(db_habit)
    db.commit()
    db.refresh(db_habit)
    return db_habit


def update_habit(
    db: Session,
    habit_id: str,
    user_id: str,
    habit_update: HabitUpdate
) -> Optional[Habit]:
    """Update a habit"""
    habit = get_habit(db, habit_id, user_id)
    if not habit:
        return None
    
    update_data = habit_update.model_dump(exclude_unset=True)
    if "is_active" in update_data:
        update_data["is_active"] = 1 if update_data["is_active"] else 0
    
    for field, value in update_data.items():
        setattr(habit, field, value)
    
    db.commit()
    db.refresh(habit)
    return habit


def delete_habit(db: Session, habit_id: str, user_id: str) -> bool:
    """Delete a habit"""
    habit = get_habit(db, habit_id, user_id)
    if not habit:
        return False
    db.delete(habit)
    db.commit()
    return True


def complete_habit(
    db: Session,
    habit_id: str,
    user_id: str,
    completion: HabitCompletionCreate
) -> HabitCompletion:
    """Mark habit as completed for a specific date"""
    habit = get_habit(db, habit_id, user_id)
    if not habit:
        return None
    
    # Check if already completed for this date
    existing = db.query(HabitCompletion).filter(
        and_(
            HabitCompletion.habit_id == habit_id,
            HabitCompletion.completion_date == completion.completion_date
        )
    ).first()
    
    if existing:
        # Update existing completion
        existing.progress = completion.progress
        existing.notes = completion.notes
        db.commit()
        db.refresh(existing)
        completion_obj = existing
    else:
        # Create new completion
        completion_obj = HabitCompletion(
            id=str(uuid.uuid4()),
            habit_id=habit_id,
            completion_date=completion.completion_date,
            progress=completion.progress,
            notes=completion.notes,
        )
        db.add(completion_obj)
        db.commit()
        db.refresh(completion_obj)
    
    # Update habit statistics
    _update_habit_stats(db, habit)
    
    return completion_obj


def _update_habit_stats(db: Session, habit: Habit):
    """Update habit streak and completion statistics"""
    # Get all completions ordered by date
    completions = db.query(HabitCompletion).filter(
        HabitCompletion.habit_id == habit.id
    ).order_by(HabitCompletion.completion_date.desc()).all()
    
    # Calculate current streak
    current_streak = 0
    today = date.today()
    check_date = today
    
    for completion in completions:
        if completion.completion_date == check_date:
            current_streak += 1
            check_date = check_date - timedelta(days=1)
        else:
            break
    
    # Calculate longest streak
    longest_streak = 0
    temp_streak = 0
    prev_date = None
    
    for completion in sorted(completions, key=lambda x: x.completion_date):
        if prev_date is None:
            temp_streak = 1
        elif (completion.completion_date - prev_date).days == 1:
            temp_streak += 1
        else:
            longest_streak = max(longest_streak, temp_streak)
            temp_streak = 1
        prev_date = completion.completion_date
    
    longest_streak = max(longest_streak, temp_streak)
    
    # Update habit
    habit.current_streak = current_streak
    habit.longest_streak = longest_streak
    habit.total_completions = len(completions)
    
    db.commit()
    db.refresh(habit)


def get_habit_completions(
    db: Session,
    habit_id: str,
    user_id: str,
    skip: int = 0,
    limit: int = 100,
) -> List[HabitCompletion]:
    """Get habit completion history"""
    habit = get_habit(db, habit_id, user_id)
    if not habit:
        return []
    
    return db.query(HabitCompletion).filter(
        HabitCompletion.habit_id == habit_id
    ).order_by(HabitCompletion.completion_date.desc()).offset(skip).limit(limit).all()

