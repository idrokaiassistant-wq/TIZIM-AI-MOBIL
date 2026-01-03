from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc
from typing import Optional, List
from datetime import datetime, timedelta
from app.database import get_db
from app.models import Log, Metric, User
from app.middleware.admin_auth import get_admin_user
from app.services.metrics_service import MetricsService
from pydantic import BaseModel
from typing import Dict, Any

router = APIRouter()


class HealthResponse(BaseModel):
    status: str
    timestamp: str
    services: Dict[str, Any]


class MetricsResponse(BaseModel):
    response_times: Dict[str, Any]
    error_rate: Dict[str, Any]
    active_users: int
    request_volume: List[Dict[str, Any]]
    database: Dict[str, Any]
    ai_service: Dict[str, Any]
    timestamp: str


class LogResponse(BaseModel):
    id: str
    level: str
    message: str
    timestamp: str
    user_id: Optional[str]
    endpoint: Optional[str]
    method: Optional[str]
    status_code: Optional[int]
    response_time: Optional[float]
    error_details: Optional[str]
    ip_address: Optional[str]


class LogsListResponse(BaseModel):
    logs: List[LogResponse]
    total: int
    page: int
    page_size: int


class ServiceStatusResponse(BaseModel):
    api: Dict[str, Any]
    database: Dict[str, Any]
    ai_service: Dict[str, Any]
    timestamp: str


@router.get("/health", response_model=HealthResponse)
async def get_health(
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)
):
    """Get overall health status of all services"""
    db_status = MetricsService.get_database_status(db)
    ai_status = MetricsService.get_ai_service_status()
    
    # API status
    api_status = {
        "status": "healthy",
        "uptime": "operational"
    }
    
    # Overall status
    overall_status = "healthy"
    if db_status.get("status") != "healthy" or ai_status.get("status") not in ["healthy", "disabled"]:
        overall_status = "degraded"
    
    return {
        "status": overall_status,
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "api": api_status,
            "database": db_status,
            "ai_service": ai_status,
        }
    }


@router.get("/metrics", response_model=MetricsResponse)
async def get_metrics(
    hours: int = Query(24, ge=1, le=168, description="Hours of data to retrieve"),
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)
):
    """Get real-time metrics"""
    metrics = MetricsService.get_all_metrics(db, hours)
    return metrics


@router.get("/logs", response_model=LogsListResponse)
async def get_logs(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=500, description="Items per page"),
    level: Optional[str] = Query(None, description="Filter by log level"),
    endpoint: Optional[str] = Query(None, description="Filter by endpoint"),
    search: Optional[str] = Query(None, description="Search in message"),
    hours: int = Query(24, ge=1, le=168, description="Hours of logs to retrieve"),
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)
):
    """Get logs with filtering and pagination"""
    cutoff_time = datetime.utcnow() - timedelta(hours=hours)
    
    # Build query
    query = db.query(Log).filter(Log.timestamp >= cutoff_time)
    
    # Apply filters
    if level:
        query = query.filter(Log.level == level.upper())
    if endpoint:
        query = query.filter(Log.endpoint.contains(endpoint))
    if search:
        query = query.filter(Log.message.contains(search))
    
    # Get total count
    total = query.count()
    
    # Apply pagination and ordering
    logs = (
        query.order_by(desc(Log.timestamp))
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    
    return {
        "logs": [
            {
                "id": log.id,
                "level": log.level,
                "message": log.message,
                "timestamp": log.timestamp.isoformat() if log.timestamp else None,
                "user_id": log.user_id,
                "endpoint": log.endpoint,
                "method": log.method,
                "status_code": log.status_code,
                "response_time": log.response_time,
                "error_details": log.error_details,
                "ip_address": log.ip_address,
            }
            for log in logs
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.get("/services", response_model=ServiceStatusResponse)
async def get_services_status(
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)
):
    """Get status of all services"""
    db_status = MetricsService.get_database_status(db)
    ai_status = MetricsService.get_ai_service_status()
    
    # API status with basic metrics
    error_rate = MetricsService.get_error_rate(db, hours=1)
    response_times = MetricsService.get_response_time_metrics(db, hours=1)
    
    api_status = {
        "status": "healthy" if error_rate["error_rate"] < 5 else "degraded",
        "error_rate": error_rate["error_rate"],
        "avg_response_time": response_times["overall_avg"],
        "active_users_1h": MetricsService.get_active_users_count(db, hours=1),
    }
    
    return {
        "api": api_status,
        "database": db_status,
        "ai_service": ai_status,
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/railway")
async def get_railway_status(
    admin_user: User = Depends(get_admin_user)
):
    """Get Railway server status (if Railway API is configured)"""
    from app.services.railway_service import RailwayService
    
    status = RailwayService.get_service_status()
    logs = RailwayService.get_logs(limit=50)
    
    return {
        **status,
        "logs_available": logs is not None,
        "logs_count": len(logs.get("logs", [])) if logs else 0,
        "timestamp": datetime.utcnow().isoformat(),
    }

