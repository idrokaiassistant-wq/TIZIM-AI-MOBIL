import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from app.database import Base, get_db
# Import all models to ensure they're registered with Base.metadata
# This must be done before creating tables
import app.models  # This imports all models and registers them with Base
from app.models import Category, User
from app.utils.auth import get_password_hash
import os
import uuid

# Import app after models to ensure proper initialization
from app.main import app

# Use in-memory SQLite for testing with unique database per test
def get_test_db_url():
    """Generate unique database URL for each test"""
    return f"sqlite:///:memory:"


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database session for each test"""
    # Ensure all models are imported and registered with Base.metadata
    # Import all model modules to register them
    from app.models.user import User  # noqa: F401
    from app.models.task import Task  # noqa: F401
    from app.models.habit import Habit  # noqa: F401
    from app.models.habit_completion import HabitCompletion  # noqa: F401
    from app.models.transaction import Transaction  # noqa: F401
    from app.models.budget import Budget  # noqa: F401
    from app.models.productivity_log import ProductivityLog  # noqa: F401
    from app.models.note import Note  # noqa: F401
    from app.models.category import Category  # noqa: F401
    from app.models.log import Log  # noqa: F401
    from app.models.metric import Metric  # noqa: F401
    
    # Create unique engine for each test
    test_db_url = get_test_db_url()
    engine = create_engine(test_db_url, connect_args={"check_same_thread": False})
    
    # Now create all tables - all models should be registered
    Base.metadata.create_all(bind=engine)
    
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSessionLocal()
    
    # Seed default categories
    try:
        existing = db.query(Category).filter(Category.is_default == 1).first()
        if not existing:
            categories = [
                Category(id="cat_task_ish", name="Ish", type="task", color="indigo", icon="Briefcase", is_default=1),
                Category(id="cat_task_shaxsiy", name="Shaxsiy", type="task", color="blue", icon="User", is_default=1),
                Category(id="cat_task_oqish", name="O'qish", type="task", color="orange", icon="BookOpen", is_default=1),
                Category(id="cat_trans_oziq", name="Oziq-ovqat", type="transaction", color="orange", icon="ShoppingBag", is_default=1),
                Category(id="cat_trans_transport", name="Transport", type="transaction", color="blue", icon="Car", is_default=1),
                Category(id="cat_trans_maosh", name="Maosh", type="transaction", color="emerald", icon="CreditCard", is_default=1),
                Category(id="cat_habit_salomatlik", name="Salomatlik", type="habit", color="green", icon="Heart", is_default=1),
                Category(id="cat_habit_sport", name="Sport", type="habit", color="red", icon="Dumbbell", is_default=1),
            ]
            for category in categories:
                db.add(category)
            db.commit()
    except Exception:
        db.rollback()
    
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


@pytest.fixture(scope="function")
def client(db_session, monkeypatch):
    """Create a test client with database override"""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    # Set test environment to skip startup event
    monkeypatch.setenv("TESTING", "true")
    
    # Override get_db dependency
    from fastapi import FastAPI
    if hasattr(app, 'dependency_overrides'):
        app.dependency_overrides[get_db] = override_get_db
    else:
        # If dependency_overrides doesn't exist, create it
        if not hasattr(app, 'dependency_overrides'):
            app.dependency_overrides = {}
        app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    # Clean up
    if hasattr(app, 'dependency_overrides'):
        app.dependency_overrides.clear()


@pytest.fixture
def test_user_data():
    """Test user data with unique email"""
    unique_id = str(uuid.uuid4())[:8]
    return {
        "email": f"test_{unique_id}@example.com",
        "password": "testpassword123",
        "full_name": "Test User",
    }


@pytest.fixture
def auth_headers(client, test_user_data):
    """Create authenticated user and return auth headers"""
    # Register user
    response = client.post("/api/auth/register", json=test_user_data)
    assert response.status_code == 201, f"Registration failed: {response.text}"
    
    # Login
    login_data = {
        "username": test_user_data["email"],
        "password": test_user_data["password"],
    }
    response = client.post("/api/auth/login", data=login_data)
    assert response.status_code == 200, f"Login failed: {response.text}"
    token = response.json()["access_token"]
    
    return {"Authorization": f"Bearer {token}"}

