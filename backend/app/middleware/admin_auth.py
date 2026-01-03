from fastapi import HTTPException, status, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.api.auth import get_current_user
from app.config import settings
import os

# Admin email list from environment variable or default
ADMIN_EMAILS = os.getenv("ADMIN_EMAILS", "").split(",") if os.getenv("ADMIN_EMAILS") else []
# Also check for single admin email
if os.getenv("ADMIN_EMAIL"):
    ADMIN_EMAILS.append(os.getenv("ADMIN_EMAIL"))


def is_admin_email(email: str) -> bool:
    """Check if email is in admin list"""
    if not ADMIN_EMAILS:
        return False
    return email.lower().strip() in [e.lower().strip() for e in ADMIN_EMAILS if e.strip()]


def get_admin_user(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> User:
    """Dependency to get current admin user - raises 403 if not admin"""
    # Check if user email is in admin list
    if not is_admin_email(current_user.email):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


