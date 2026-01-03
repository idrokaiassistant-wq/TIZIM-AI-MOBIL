import pytest
from datetime import date, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.models import User, ProductivityLog, Transaction
from app.services.analytics.time_series_service import TimeSeriesService
from app.services.analytics.trend_analyzer import TrendAnalyzer
from app.services.analytics.statistical_reports import StatisticalReports
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
        id=f"test_user_analytics_{unique_id}",
        email=f"analytics_{unique_id}@example.com",
        password_hash="hashed_password",
        full_name="Test User"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def test_time_series_service(db, test_user):
    """Time series service test"""
    service = TimeSeriesService(db)
    
    # Test productivity trends
    trends = service.get_productivity_trends(test_user.id, period="daily")
    assert "dates" in trends
    assert "tasks_completed" in trends
    
    # Test expense trends
    expense_trends = service.get_expense_trends(test_user.id, period="daily")
    assert "dates" in expense_trends
    assert "amounts" in expense_trends
    
    # Test forecast (bo'sh ma'lumotlar bilan)
    forecast = service.forecast_productivity(test_user.id, days=7)
    assert "forecast" in forecast or "dates" in forecast


def test_trend_analyzer(db, test_user):
    """Trend analyzer test"""
    analyzer = TrendAnalyzer(db)
    
    # Test task completion trends
    trends = analyzer.analyze_task_completion_trends(test_user.id, days=30)
    assert "trend" in trends
    assert trends["trend"] in ["increasing", "decreasing", "stable"]
    assert "completion_rate" in trends
    
    # Test habit streak trends
    habit_trends = analyzer.analyze_habit_streak_trends(test_user.id, days=30)
    assert "average_streak" in habit_trends
    assert "trend" in habit_trends
    
    # Test expense category trends
    expense_trends = analyzer.analyze_expense_category_trends(test_user.id, days=30)
    assert "categories" in expense_trends
    assert "total_expense" in expense_trends


def test_statistical_reports(db, test_user):
    """Statistical reports test"""
    service = StatisticalReports(db)
    
    # Test category distribution
    distribution = service.get_category_distribution(test_user.id, "task", days=30)
    assert "categories" in distribution
    assert "total" in distribution
    
    # Test correlation (bo'sh ma'lumotlar bilan)
    correlation = service.analyze_correlation(test_user.id, days=30)
    assert "correlation" in correlation
    
    # Test regression
    regression = service.regression_analysis(test_user.id, days=30)
    assert "r_squared" in regression

