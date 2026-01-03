from datetime import datetime, timedelta
from typing import Dict, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from app.models import Log, Metric, User
from app.database import SessionLocal
import json
import logging

logger = logging.getLogger(__name__)


class MetricsService:
    """Service for collecting and aggregating metrics"""
    
    @staticmethod
    def get_response_time_metrics(db: Session, hours: int = 24) -> Dict:
        """Get average response time metrics for the last N hours"""
        cutoff_time = datetime.utcnow() - timedelta(hours=hours)
        
        # Get average response time by endpoint
        results = (
            db.query(
                Log.endpoint,
                func.avg(Log.response_time).label("avg_time"),
                func.count(Log.id).label("count"),
            )
            .filter(
                and_(
                    Log.timestamp >= cutoff_time,
                    Log.response_time.isnot(None),
                )
            )
            .group_by(Log.endpoint)
            .all()
        )
        
        return {
            "by_endpoint": [
                {
                    "endpoint": r.endpoint or "unknown",
                    "avg_response_time": round(r.avg_time, 2),
                    "request_count": r.count,
                }
                for r in results
            ],
            "overall_avg": (
                round(sum(r.avg_time * r.count for r in results) / sum(r.count for r in results), 2)
                if results and sum(r.count for r in results) > 0
                else 0
            ),
        }
    
    @staticmethod
    def get_error_rate(db: Session, hours: int = 24) -> Dict:
        """Get error rate metrics for the last N hours"""
        cutoff_time = datetime.utcnow() - timedelta(hours=hours)
        
        total = db.query(func.count(Log.id)).filter(Log.timestamp >= cutoff_time).scalar() or 0
        errors = (
            db.query(func.count(Log.id))
            .filter(
                and_(
                    Log.timestamp >= cutoff_time,
                    Log.status_code >= 400,
                )
            )
            .scalar()
            or 0
        )
        
        error_rate = (errors / total * 100) if total > 0 else 0
        
        return {
            "total_requests": total,
            "error_count": errors,
            "error_rate": round(error_rate, 2),
            "success_rate": round(100 - error_rate, 2),
        }
    
    @staticmethod
    def get_active_users_count(db: Session, hours: int = 24) -> int:
        """Get count of active users in the last N hours"""
        cutoff_time = datetime.utcnow() - timedelta(hours=hours)
        
        count = (
            db.query(func.count(func.distinct(Log.user_id)))
            .filter(
                and_(
                    Log.timestamp >= cutoff_time,
                    Log.user_id.isnot(None),
                )
            )
            .scalar()
            or 0
        )
        
        return count
    
    @staticmethod
    def get_request_volume(db: Session, hours: int = 24, interval_minutes: int = 60) -> List[Dict]:
        """Get request volume over time"""
        cutoff_time = datetime.utcnow() - timedelta(hours=hours)
        
        # Group by time intervals
        results = (
            db.query(
                func.strftime(
                    f"%Y-%m-%d %H:00:00",
                    Log.timestamp
                ).label("time_bucket"),
                func.count(Log.id).label("count"),
            )
            .filter(Log.timestamp >= cutoff_time)
            .group_by("time_bucket")
            .order_by("time_bucket")
            .all()
        )
        
        return [
            {
                "timestamp": r.time_bucket,
                "count": r.count,
            }
            for r in results
        ]
    
    @staticmethod
    def get_database_status(db: Session) -> Dict:
        """Check database connection status"""
        try:
            # Try a simple query
            db.execute(func.now())
            return {
                "status": "healthy",
                "connected": True,
            }
        except Exception as e:
            logger.error(f"Database health check failed: {str(e)}")
            return {
                "status": "unhealthy",
                "connected": False,
                "error": str(e),
            }
    
    @staticmethod
    def get_ai_service_status() -> Dict:
        """Check AI service status"""
        try:
            from app.config.ai_config import ai_config
            
            return {
                "status": "healthy" if ai_config.enable_ml else "disabled",
                "ml_enabled": ai_config.enable_ml,
                "nlp_enabled": ai_config.enable_nlp,
            }
        except Exception as e:
            logger.error(f"AI service health check failed: {str(e)}")
            return {
                "status": "unhealthy",
                "error": str(e),
            }
    
    @staticmethod
    def get_all_metrics(db: Session, hours: int = 24) -> Dict:
        """Get all metrics in one call"""
        return {
            "response_times": MetricsService.get_response_time_metrics(db, hours),
            "error_rate": MetricsService.get_error_rate(db, hours),
            "active_users": MetricsService.get_active_users_count(db, hours),
            "request_volume": MetricsService.get_request_volume(db, hours),
            "database": MetricsService.get_database_status(db),
            "ai_service": MetricsService.get_ai_service_status(),
            "timestamp": datetime.utcnow().isoformat(),
        }
    
    @staticmethod
    def save_metric(metric_name: str, metric_value: float, tags: Optional[Dict] = None):
        """Save a metric to database"""
        try:
            db = SessionLocal()
            try:
                metric = Metric(
                    metric_name=metric_name,
                    metric_value=metric_value,
                    tags=json.dumps(tags) if tags else None,
                )
                db.add(metric)
                db.commit()
            except Exception as e:
                logger.error(f"Error saving metric: {str(e)}")
                db.rollback()
            finally:
                db.close()
        except Exception as e:
            logger.error(f"Error creating database session for metrics: {str(e)}")

