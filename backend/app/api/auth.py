from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.models.telegram_code import TelegramCode
from app.schemas.auth import (
    UserRegister, Token, UserResponse, UserUpdate,
    TelegramSendCodeRequest, TelegramVerifyCodeRequest, TelegramLoginResponse
)
from app.utils.auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    decode_access_token,
)
from app.services.telegram_service import create_code, verify_code, normalize_phone_number
from datetime import timedelta
import uuid
import logging
from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user = User(
        id=str(uuid.uuid4()),
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        full_name=user_data.full_name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Login and get access token"""
    logger.info(f"Login attempt for email: {form_data.username}")
    
    user = db.query(User).filter(User.email == form_data.username).first()
    
    if not user:
        logger.warning(f"User not found: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    logger.info(f"User found: {user.email}, verifying password...")
    
    try:
        password_valid = verify_password(form_data.password, user.password_hash)
        logger.info(f"Password verification result: {password_valid}")
        
        if not password_valid:
            logger.warning(f"Invalid password for user: {form_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except Exception as e:
        logger.error(f"Error verifying password: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=60 * 24)  # 24 hours
    access_token = create_access_token(
        data={"sub": user.id}, expires_delta=access_token_expires
    )
    logger.info(f"Login successful for user: {user.email}")
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return current_user


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile"""
    update_data = user_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/debug/users", response_model=list[dict])
async def debug_list_users(
    db: Session = Depends(get_db)
):
    """Debug endpoint to list all users (development only)"""
    from app.config import settings
    
    if not settings.debug:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This endpoint is only available in debug mode"
        )
    
    users = db.query(User).all()
    return [
        {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "has_password_hash": bool(user.password_hash),
            "password_hash_length": len(user.password_hash) if user.password_hash else 0,
        }
        for user in users
    ]


@router.post("/telegram/send-code", status_code=status.HTTP_200_OK)
async def telegram_send_code(
    request: TelegramSendCodeRequest,
    db: Session = Depends(get_db)
):
    """Send verification code via Telegram"""
    try:
        code = create_code(db, request.phone_number)
        if code:
            return {
                "message": "Code sent successfully",
                "expires_in_minutes": settings.telegram_code_expire_minutes
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to send code. Please check phone number format and try again later."
            )
    except Exception as e:
        logger.error(f"Error sending Telegram code: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error sending verification code"
        )


@router.post("/telegram/verify-code", response_model=TelegramLoginResponse, status_code=status.HTTP_200_OK)
async def telegram_verify_code(
    request: TelegramVerifyCodeRequest,
    db: Session = Depends(get_db)
):
    """Verify code and login/register user"""
    normalized_phone = normalize_phone_number(request.phone_number)
    
    # Verify code
    if not verify_code(db, request.phone_number, request.code):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired code"
        )
    
    # Find or create user
    user = db.query(User).filter(User.phone_number == normalized_phone).first()
    
    if not user:
        # Create new user
        user = User(
            id=str(uuid.uuid4()),
            phone_number=normalized_phone,
            email=None,
            password_hash=None,
            full_name=None,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        logger.info(f"New user created via Telegram: {normalized_phone}")
    else:
        logger.info(f"User logged in via Telegram: {normalized_phone}")
    
    # Create access token
    access_token_expires = timedelta(minutes=60 * 24)  # 24 hours
    access_token = create_access_token(
        data={"sub": user.id}, expires_delta=access_token_expires
    )
    
    return TelegramLoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=user
    )

