from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date
from app.database import get_db
from app.models import User
from app.api.auth import get_current_user
from app.services.analytics.time_series_service import TimeSeriesService
from app.services.analytics.trend_analyzer import TrendAnalyzer
from app.services.analytics.statistical_reports import StatisticalReports

router = APIRouter()


@router.get("/trends/productivity")
async def get_productivity_trends(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    period: str = Query("daily", regex="^(daily|weekly|monthly)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Produktivlik tendentsiyalari"""
    try:
        service = TimeSeriesService(db)
        trends = service.get_productivity_trends(
            current_user.id,
            start_date,
            end_date,
            period
        )
        return trends
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get trends: {str(e)}"
        )


@router.get("/trends/expenses")
async def get_expense_trends(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    period: str = Query("daily", regex="^(daily|weekly|monthly)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Xarajatlar tendentsiyalari"""
    try:
        service = TimeSeriesService(db)
        trends = service.get_expense_trends(
            current_user.id,
            start_date,
            end_date,
            period
        )
        return trends
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get trends: {str(e)}"
        )


@router.get("/forecast/productivity")
async def forecast_productivity(
    days: int = Query(30, ge=1, le=90),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Produktivlik bashorati"""
    try:
        service = TimeSeriesService(db)
        forecast = service.forecast_productivity(current_user.id, days)
        return forecast
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to forecast: {str(e)}"
        )


@router.get("/forecast/expenses")
async def forecast_expenses(
    days: int = Query(30, ge=1, le=90),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Xarajatlar bashorati"""
    try:
        service = TimeSeriesService(db)
        forecast = service.forecast_expenses(current_user.id, days)
        return forecast
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to forecast: {str(e)}"
        )


@router.get("/correlation")
async def get_correlation_analysis(
    days: int = Query(30, ge=7, le=365),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Korrelyatsiya tahlili"""
    try:
        service = StatisticalReports(db)
        correlation = service.analyze_correlation(current_user.id, days)
        return correlation
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze correlation: {str(e)}"
        )


@router.get("/distribution/{entity_type}")
async def get_category_distribution(
    entity_type: str,
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Kategoriyalar bo'yicha taqsimot"""
    if entity_type not in ["task", "habit", "transaction"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="entity_type must be one of: task, habit, transaction"
        )
    
    try:
        service = StatisticalReports(db)
        distribution = service.get_category_distribution(
            current_user.id,
            entity_type,
            days
        )
        return distribution
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get distribution: {str(e)}"
        )


@router.get("/regression")
async def get_regression_analysis(
    days: int = Query(30, ge=7, le=365),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Regression tahlili"""
    try:
        service = StatisticalReports(db)
        regression = service.regression_analysis(current_user.id, days)
        return regression
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze regression: {str(e)}"
        )

