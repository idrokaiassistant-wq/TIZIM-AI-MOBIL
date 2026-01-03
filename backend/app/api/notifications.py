from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models import User
from app.api.auth import get_current_user
from app.services.notification_service import NotificationService

router = APIRouter()


class DeviceRegistration(BaseModel):
    device_token: str
    platform: str = "web"


@router.post("/register-device")
async def register_device(
    registration: DeviceRegistration,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Register device for push notifications"""
    service = NotificationService(db)
    success = await service.register_device(
        current_user.id,
        registration.device_token,
        registration.platform
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to register device"
        )
    
    return {"success": True, "message": "Device registered successfully"}


