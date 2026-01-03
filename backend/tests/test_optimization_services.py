import pytest
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.models import User, Task, Budget
from app.services.optimization.task_scheduler import TaskScheduler
from app.services.optimization.budget_optimizer import BudgetOptimizer
import uuid


@pytest.fixture(scope="function")
def db():
    """Database session for service tests"""
    test_db_url = "sqlite:///:memory:"
    engine = create_engine(test_db_url, connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


@pytest.fixture
def test_user(db):
    """Test user yaratish"""
    unique_id = str(uuid.uuid4())[:8]
    user = User(
        id=f"test_user_opt_{unique_id}",
        email=f"opt_{unique_id}@example.com",
        password_hash="hashed_password",
        full_name="Test User"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
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

