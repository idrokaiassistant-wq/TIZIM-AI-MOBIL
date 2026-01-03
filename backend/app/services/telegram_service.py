"""
Telegram Bot service for sending verification codes
"""
import random
import logging
import re
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from app.config import settings
from app.models.telegram_code import TelegramCode
from app.models.telegram_user import TelegramUser
import requests

logger = logging.getLogger(__name__)


def normalize_phone_number(phone_number: str) -> str:
    """Normalize phone number to format +998901234567"""
    # Remove all non-digit characters
    digits = re.sub(r'\D', '', phone_number)
    
    # Handle different formats
    if digits.startswith('998'):
        return f"+{digits}"
    elif digits.startswith('9'):
        return f"+998{digits}"
    elif len(digits) == 9:
        return f"+998{digits}"
    else:
        # If already has +, just return
        if phone_number.startswith('+'):
            return phone_number
        return f"+{digits}"


def validate_phone_number(phone_number: str) -> bool:
    """Validate phone number format (Uzbekistan: +998XXXXXXXXX)"""
    normalized = normalize_phone_number(phone_number)
    # Uzbekistan phone number: +998 + 9 digits
    pattern = r'^\+998[0-9]{9}$'
    return bool(re.match(pattern, normalized))


def generate_code() -> str:
    """Generate 6-digit verification code"""
    return str(random.randint(100000, 999999)).zfill(6)


def send_telegram_message(db: Session, phone_number: str, code: str) -> bool:
    """
    Send verification code via Telegram Bot API
    Gets chat_id from database (phone_number -> chat_id mapping)
    """
    if not settings.telegram_bot_token:
        logger.warning("TELEGRAM_BOT_TOKEN not set, logging code instead")
        logger.info(f"Verification code for {phone_number}: {code}")
        return True
    
    try:
        normalized_phone = normalize_phone_number(phone_number)
        
        # Get chat_id from database
        telegram_user = db.query(TelegramUser).filter(
            TelegramUser.phone_number == normalized_phone
        ).first()
        
        if not telegram_user:
            # User hasn't registered phone number with bot yet
            logger.warning(f"No chat_id found for phone number: {normalized_phone}. User must send phone number to bot first.")
            logger.info(f"Verification code for {phone_number}: {code} (logged because chat_id not found)")
            return True
        
        chat_id = telegram_user.chat_id
        
        # Send code via Telegram Bot API
        url = f"https://api.telegram.org/bot{settings.telegram_bot_token}/sendMessage"
        payload = {
            "chat_id": chat_id,
            "text": f"🔐 Sizning tasdiqlash kodingiz: {code}\n\n⏱ Muddati: {settings.telegram_code_expire_minutes} daqiqa"
        }
        response = requests.post(url, json=payload, timeout=5)
        
        if response.status_code == 200:
            logger.info(f"Code sent successfully to Telegram chat_id: {chat_id} (phone: {normalized_phone})")
            return True
        else:
            logger.error(f"Failed to send Telegram message. Status: {response.status_code}, Response: {response.text}")
            return False
        
    except Exception as e:
        logger.error(f"Error sending Telegram message: {e}", exc_info=True)
        # Fallback: log the code
        logger.info(f"Verification code for {phone_number}: {code} (logged due to error)")
        return True


def create_code(db: Session, phone_number: str) -> Optional[str]:
    """
    Create and send verification code
    Returns code if successful, None otherwise
    """
    normalized_phone = normalize_phone_number(phone_number)
    
    if not validate_phone_number(normalized_phone):
        logger.warning(f"Invalid phone number format: {phone_number}")
        return None
    
    # Check rate limiting
    existing_code = db.query(TelegramCode).filter(
        TelegramCode.phone_number == normalized_phone
    ).first()
    
    if existing_code:
        time_since_creation = datetime.utcnow() - existing_code.created_at.replace(tzinfo=None)
        if time_since_creation.total_seconds() < settings.telegram_code_rate_limit_minutes * 60:
            logger.warning(f"Rate limit: code already sent to {normalized_phone} recently")
            return None
    
    # Generate code
    code = generate_code()
    expires_at = datetime.utcnow() + timedelta(minutes=settings.telegram_code_expire_minutes)
    
    # Delete old code if exists
    if existing_code:
        db.delete(existing_code)
    
    # Create new code
    telegram_code = TelegramCode(
        phone_number=normalized_phone,
        code=code,
        expires_at=expires_at,
        attempts=0
    )
    db.add(telegram_code)
    db.commit()
    
    # Send code via Telegram
    if send_telegram_message(db, normalized_phone, code):
        logger.info(f"Code sent successfully to {normalized_phone}")
        return code
    else:
        # If sending failed, delete the code
        db.delete(telegram_code)
        db.commit()
        return None


def verify_code(db: Session, phone_number: str, code: str) -> bool:
    """
    Verify code and increment attempts
    Returns True if code is valid, False otherwise
    """
    normalized_phone = normalize_phone_number(phone_number)
    
    telegram_code = db.query(TelegramCode).filter(
        TelegramCode.phone_number == normalized_phone
    ).first()
    
    if not telegram_code:
        logger.warning(f"No code found for phone number: {normalized_phone}")
        return False
    
    # Check if code expired
    if datetime.utcnow() > telegram_code.expires_at.replace(tzinfo=None):
        logger.warning(f"Code expired for phone number: {normalized_phone}")
        db.delete(telegram_code)
        db.commit()
        return False
    
    # Check attempts limit
    if telegram_code.attempts >= settings.telegram_code_attempts:
        logger.warning(f"Too many attempts for phone number: {normalized_phone}")
        db.delete(telegram_code)
        db.commit()
        return False
    
    # Increment attempts
    telegram_code.attempts += 1
    
    # Verify code
    if telegram_code.code == code:
        # Code is valid, delete it
        db.delete(telegram_code)
        db.commit()
        logger.info(f"Code verified successfully for {normalized_phone}")
        return True
    else:
        # Code is invalid, save attempts
        db.commit()
        logger.warning(f"Invalid code attempt for {normalized_phone} (attempt {telegram_code.attempts}/{settings.telegram_code_attempts})")
        return False

