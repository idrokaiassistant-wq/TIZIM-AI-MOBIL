import os
import logging
from typing import Optional, Dict, Any
import requests

logger = logging.getLogger(__name__)

# Railway API configuration
RAILWAY_API_TOKEN = os.getenv("RAILWAY_API_TOKEN")
RAILWAY_PROJECT_ID = os.getenv("RAILWAY_PROJECT_ID")
RAILWAY_SERVICE_ID = os.getenv("RAILWAY_SERVICE_ID")


class RailwayService:
    """Service for interacting with Railway API"""
    
    @staticmethod
    def is_configured() -> bool:
        """Check if Railway API is configured"""
        return bool(RAILWAY_API_TOKEN and RAILWAY_PROJECT_ID)
    
    @staticmethod
    def get_logs(limit: int = 100) -> Optional[Dict[str, Any]]:
        """Get logs from Railway API"""
        if not RailwayService.is_configured():
            return None
        
        try:
            # Railway API endpoint for logs
            url = f"https://api.railway.app/v1/projects/{RAILWAY_PROJECT_ID}/services/{RAILWAY_SERVICE_ID}/logs"
            headers = {
                "Authorization": f"Bearer {RAILWAY_API_TOKEN}",
                "Content-Type": "application/json",
            }
            
            params = {
                "limit": limit,
            }
            
            response = requests.get(url, headers=headers, params=params, timeout=10)
            response.raise_for_status()
            
            return response.json()
        except Exception as e:
            logger.error(f"Error fetching Railway logs: {str(e)}")
            return None
    
    @staticmethod
    def get_service_status() -> Dict[str, Any]:
        """Get Railway service status"""
        if not RailwayService.is_configured():
            return {
                "status": "not_configured",
                "message": "Railway API not configured. Set RAILWAY_API_TOKEN, RAILWAY_PROJECT_ID, and RAILWAY_SERVICE_ID environment variables.",
            }
        
        try:
            # Railway API endpoint for service status
            url = f"https://api.railway.app/v1/projects/{RAILWAY_PROJECT_ID}/services/{RAILWAY_SERVICE_ID}"
            headers = {
                "Authorization": f"Bearer {RAILWAY_API_TOKEN}",
                "Content-Type": "application/json",
            }
            
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            return {
                "status": "configured",
                "service": data.get("name"),
                "state": data.get("state"),
                "created_at": data.get("createdAt"),
            }
        except Exception as e:
            logger.error(f"Error fetching Railway service status: {str(e)}")
            return {
                "status": "error",
                "error": str(e),
            }


