import time
import logging
import traceback
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Log
from app.utils.auth import decode_access_token
import uuid

logger = logging.getLogger(__name__)


class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for logging all requests and responses"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Skip logging for health checks and admin endpoints to avoid recursion
        if request.url.path in ["/health", "/api/admin/logs", "/api/admin/metrics"]:
            return await call_next(request)
        
        start_time = time.time()
        user_id = None
        ip_address = request.client.host if request.client else None
        user_agent = request.headers.get("user-agent")
        
        # Extract user ID from token if available
        auth_header = request.headers.get("authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            payload = decode_access_token(token)
            if payload:
                user_id = payload.get("sub")
        
        # Process request
        error_details = None
        status_code = 200
        
        try:
            response = await call_next(request)
            status_code = response.status_code
            
            # Calculate response time
            response_time = (time.time() - start_time) * 1000  # Convert to milliseconds
            
            # Log to database asynchronously (don't block response)
            self._log_to_db(
                level="INFO" if status_code < 400 else "ERROR",
                message=f"{request.method} {request.url.path} - {status_code}",
                user_id=user_id,
                endpoint=request.url.path,
                method=request.method,
                status_code=status_code,
                response_time=response_time,
                error_details=None,
                ip_address=ip_address,
                user_agent=user_agent,
            )
            
            return response
            
        except Exception as e:
            # Calculate response time
            response_time = (time.time() - start_time) * 1000
            
            # Get error details
            error_details = f"{str(e)}\n{traceback.format_exc()}"
            status_code = 500
            
            # Log error to database
            self._log_to_db(
                level="ERROR",
                message=f"{request.method} {request.url.path} - Exception: {str(e)}",
                user_id=user_id,
                endpoint=request.url.path,
                method=request.method,
                status_code=status_code,
                response_time=response_time,
                error_details=error_details,
                ip_address=ip_address,
                user_agent=user_agent,
            )
            
            # Re-raise exception
            raise
    
    def _log_to_db(
        self,
        level: str,
        message: str,
        user_id: str = None,
        endpoint: str = None,
        method: str = None,
        status_code: int = None,
        response_time: float = None,
        error_details: str = None,
        ip_address: str = None,
        user_agent: str = None,
    ):
        """Log to database in background"""
        try:
            db = SessionLocal()
            try:
                log_entry = Log(
                    id=str(uuid.uuid4()),
                    level=level,
                    message=message,
                    user_id=user_id,
                    endpoint=endpoint,
                    method=method,
                    status_code=status_code,
                    response_time=response_time,
                    error_details=error_details,
                    ip_address=ip_address,
                    user_agent=user_agent,
                )
                db.add(log_entry)
                db.commit()
            except Exception as e:
                logger.error(f"Error logging to database: {str(e)}")
                db.rollback()
            finally:
                db.close()
        except Exception as e:
            logger.error(f"Error creating database session for logging: {str(e)}")

