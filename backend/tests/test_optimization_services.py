import pytest
from datetime import datetime, timedelta
from app.database import SessionLocal, init_db
from app.models import User, Task, Budget
from app.services.optimization.task_scheduler import TaskScheduler
from app.services.optimization.budget_optimizer import BudgetOptimizer


@pytest.fixture
def db():
    """Database session"""
    init_db()
    db = SessionLocal()
    yield db
    db.close()


@pytest.fixture
def test_user(db):
    """Test user yaratish"""
    user = User(
        id="test_user_opt",
        email="opt@example.com",
        password_hash="hashed_password",
        full_name="Test User"
    )
    db.add(user)
    db.commit()
    return user


def test_task_scheduler(db, test_user):
    """Task scheduler test"""
    scheduler = TaskScheduler(db)
    
    # Test with empty tasks
    scheduled = scheduler.schedule_tasks(test_user.id, [], available_hours=8)
    assert isinstance(scheduled, list)
    
    # Test optimize order
    optimized = scheduler.optimize_task_order(test_user.id, [])
    assert isinstance(optimized, list)


def test_budget_optimizer(db, test_user):
    """Budget optimizer test"""
    optimizer = BudgetOptimizer(db)
    
    # Test suggest allocations
    suggestions = optimizer.suggest_budget_allocations(
        test_user.id,
        total_budget=1000.0,
        period="monthly"
    )
    assert isinstance(suggestions, list)
    if suggestions:
        assert "category" in suggestions[0]
        assert "suggested_amount" in suggestions[0]

