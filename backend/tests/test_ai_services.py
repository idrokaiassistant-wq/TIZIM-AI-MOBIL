import pytest
from datetime import date, datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.models import User, Task, Habit, Transaction
from app.services.ai.task_priority_service import TaskPriorityService
from app.services.ai.recommendation_service import RecommendationService
from app.services.ai.anomaly_detection_service import AnomalyDetectionService
from app.services.ai.insights_service import InsightsService
from app.services.nlp.task_parser import TaskParser
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
        id=f"test_user_{unique_id}",
        email=f"test_{unique_id}@example.com",
        password_hash="hashed_password",
        full_name="Test User"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def test_task_priority_service(db, test_user):
    """Task priority service test"""
    service = TaskPriorityService(db)
    
    # Test fallback priority
    priority = service.predict_priority(
        test_user.id,
        {
            "category": "Ish",
            "due_date": None,
            "is_focus": False
        }
    )
    assert priority in ["low", "medium", "high"]


def test_recommendation_service(db, test_user):
    """Recommendation service test"""
    service = RecommendationService(db)
    
    # Test task recommendations (bo'sh ro'yxat)
    recommendations = service.get_task_recommendations(test_user.id, limit=5)
    assert isinstance(recommendations, list)
    
    # Test habit recommendations
    habit_recommendations = service.get_habit_recommendations(test_user.id, limit=5)
    assert isinstance(habit_recommendations, list)


def test_anomaly_detection_service(db, test_user):
    """Anomaly detection service test"""
    service = AnomalyDetectionService(db)
    
    # Test expense anomalies (bo'sh ro'yxat)
    anomalies = service.detect_expense_anomalies(test_user.id, days=30)
    assert isinstance(anomalies, list)
    
    # Test habit anomalies
    habit_anomalies = service.detect_habit_anomalies(test_user.id)
    assert isinstance(habit_anomalies, list)


def test_insights_service(db, test_user):
    """Insights service test"""
    service = InsightsService(db)
    
    # Test daily insights
    insights = service.generate_daily_insights(test_user.id)
    assert "date" in insights
    assert "summary" in insights
    assert "insights" in insights
    
    # Test weekly insights
    weekly_insights = service.generate_weekly_insights(test_user.id)
    assert "period" in weekly_insights
    assert weekly_insights["period"] == "weekly"
    
    # Test monthly insights
    monthly_insights = service.generate_monthly_insights(test_user.id)
    assert "period" in monthly_insights
    assert monthly_insights["period"] == "monthly"


def test_task_parser():
    """Task parser test"""
    parser = TaskParser()
    
    # Test simple parsing
    result = parser.parse_task_text("Bugun loyiha ustida ishlash")
    assert "title" in result
    assert "category" in result
    assert "priority" in result
    
    # Test with date
    result = parser.parse_task_text("Ertaga meeting bor")
    assert result["category"] in ["Ish", "Shaxsiy", "O'qish"]
    
    # Test priority extraction
    result = parser.parse_task_text("Muhim vazifa - bugun bajarish kerak")
    assert result["priority"] in ["low", "medium", "high"]

