from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date
from pydantic import BaseModel
from app.database import get_db
from app.models import User
from app.api.auth import get_current_user
from app.services.ai.task_priority_service import TaskPriorityService
from app.services.ai.recommendation_service import RecommendationService
from app.services.ai.anomaly_detection_service import AnomalyDetectionService
from app.services.ai.insights_service import InsightsService
from app.services.nlp.task_parser import TaskParser

router = APIRouter()


class TaskPriorityRequest(BaseModel):
    category: str
    due_date: Optional[str] = None
    is_focus: bool = False


class NLPParseRequest(BaseModel):
    text: str


@router.post("/tasks/predict-priority")
async def predict_task_priority(
    request: TaskPriorityRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Vazifa prioritetini bashorat qilish"""
    try:
        service = TaskPriorityService(db)
        priority = service.predict_priority(
            current_user.id,
            {
                "category": request.category,
                "due_date": request.due_date,
                "is_focus": request.is_focus
            }
        )
        return {"priority": priority}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Priority prediction failed: {str(e)}"
        )


@router.get("/recommendations/tasks")
async def get_task_recommendations(
    limit: int = Query(5, ge=1, le=20),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Vazifalar uchun tavsiyalar"""
    try:
        service = RecommendationService(db)
        recommendations = service.get_task_recommendations(current_user.id, limit)
        return {"recommendations": recommendations}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get recommendations: {str(e)}"
        )


@router.get("/recommendations/habits")
async def get_habit_recommendations(
    limit: int = Query(5, ge=1, le=20),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Odatlar uchun tavsiyalar"""
    try:
        service = RecommendationService(db)
        recommendations = service.get_habit_recommendations(current_user.id, limit)
        return {"recommendations": recommendations}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get recommendations: {str(e)}"
        )


@router.get("/insights/daily")
async def get_daily_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Kunlik xulosa"""
    try:
        service = InsightsService(db)
        insights = service.generate_daily_insights(current_user.id)
        return insights
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate insights: {str(e)}"
        )


@router.get("/insights/weekly")
async def get_weekly_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Haftalik xulosa"""
    try:
        service = InsightsService(db)
        insights = service.generate_weekly_insights(current_user.id)
        return insights
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate insights: {str(e)}"
        )


@router.get("/insights/monthly")
async def get_monthly_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Oylik xulosa"""
    try:
        service = InsightsService(db)
        insights = service.generate_monthly_insights(current_user.id)
        return insights
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate insights: {str(e)}"
        )


@router.get("/anomalies/expenses")
async def get_expense_anomalies(
    days: int = Query(30, ge=1, le=90),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Xarajatlar anomaliyalari"""
    try:
        service = AnomalyDetectionService(db)
        anomalies = service.detect_expense_anomalies(current_user.id, days)
        return {"anomalies": anomalies, "count": len(anomalies)}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to detect anomalies: {str(e)}"
        )


@router.get("/anomalies/habits")
async def get_habit_anomalies(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Odatlar anomaliyalari"""
    try:
        service = AnomalyDetectionService(db)
        anomalies = service.detect_habit_anomalies(current_user.id)
        return {"anomalies": anomalies, "count": len(anomalies)}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to detect anomalies: {str(e)}"
        )


@router.post("/nlp/parse-task")
async def parse_task_from_text(
    request: NLPParseRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Tabiiy til bilan vazifa yaratish"""
    try:
        parser = TaskParser()
        parsed = parser.parse_task_text(request.text)
        return parsed
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to parse task: {str(e)}"
        )

