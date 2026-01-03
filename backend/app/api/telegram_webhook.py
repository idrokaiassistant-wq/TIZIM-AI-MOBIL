"""
Telegram Bot Webhook Handler
Handles incoming messages from Telegram Bot API
"""
from fastapi import APIRouter, Request, HTTPException, status, Header, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.telegram_user import TelegramUser
from app.services.telegram_service import normalize_phone_number, validate_phone_number
import logging
import hmac
import hashlib
from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter()


def verify_telegram_webhook(telegram_token: str, request_body: bytes, x_telegram_bot_api_secret_token: str = None) -> bool:
    """
    Verify Telegram webhook request
    In production, you should verify the request comes from Telegram
    """
    # For now, just check if token matches
    if not settings.telegram_bot_token:
        return False
    
    # In production, you should also verify IP addresses from Telegram
    # Telegram IP ranges: https://core.telegram.org/bots/webhooks#validating-updates
    return True


@router.post("/webhook")
async def telegram_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Handle incoming Telegram Bot webhook updates
    """
    try:
        data = await request.json()
        
        # Verify webhook (optional but recommended)
        # Note: For production, you should verify the request comes from Telegram IP ranges
        if not settings.telegram_bot_token:
            logger.warning("TELEGRAM_BOT_TOKEN not set")
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bot token not configured")
        
        # Handle update
        if "message" in data:
            message = data["message"]
            chat_id = str(message["chat"]["id"])
            text = message.get("text", "").strip()
            
            # Handle /start command
            if text == "/start":
                welcome_message = (
                    "👋 Salom! Tizim AI bot'iga xush kelibsiz!\n\n"
                    "📱 Autentifikatsiya kodini olish uchun telefon raqamingizni yuboring.\n"
                    "📝 Format: +998901234567 yoki 998901234567\n\n"
                    "Masalan: +998901234567"
                )
                
                # Send welcome message via Telegram Bot API
                await send_telegram_reply(chat_id, welcome_message)
                return {"ok": True}
            
            # Handle phone number
            elif text.startswith("+") or text.replace(" ", "").isdigit():
                phone_text = text.replace(" ", "").replace("-", "")
                normalized_phone = normalize_phone_number(phone_text)
                
                if validate_phone_number(normalized_phone):
                    # Save or update phone number -> chat_id mapping
                    existing = db.query(TelegramUser).filter(
                        TelegramUser.phone_number == normalized_phone
                    ).first()
                    
                    if existing:
                        # Update chat_id if changed
                        if existing.chat_id != chat_id:
                            existing.chat_id = chat_id
                            db.commit()
                    else:
                        # Create new mapping
                        telegram_user = TelegramUser(
                            phone_number=normalized_phone,
                            chat_id=chat_id
                        )
                        db.add(telegram_user)
                        db.commit()
                    
                    success_message = (
                        f"✅ Telefon raqamingiz qabul qilindi: {normalized_phone}\n\n"
                        "🔐 Endi web ilovada telefon raqamingizni kiriting va tasdiqlash kodini oling."
                    )
                    await send_telegram_reply(chat_id, success_message)
                    logger.info(f"Phone number registered: {normalized_phone} -> {chat_id}")
                    return {"ok": True}
                else:
                    error_message = (
                        "❌ Telefon raqam formati noto'g'ri!\n\n"
                        "✅ To'g'ri format: +998901234567\n"
                        "Masalan: +998901234567"
                    )
                    await send_telegram_reply(chat_id, error_message)
                    return {"ok": True}
        
        return {"ok": True}
    
    except Exception as e:
        logger.error(f"Error handling Telegram webhook: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error processing webhook"
        )


async def send_telegram_reply(chat_id: str, text: str) -> bool:
    """Send message via Telegram Bot API"""
    if not settings.telegram_bot_token:
        logger.warning("TELEGRAM_BOT_TOKEN not set, cannot send message")
        return False
    
    try:
        import requests
        url = f"https://api.telegram.org/bot{settings.telegram_bot_token}/sendMessage"
        payload = {
            "chat_id": chat_id,
            "text": text,
            "parse_mode": "HTML"
        }
        response = requests.post(url, json=payload, timeout=5)
        return response.status_code == 200
    except Exception as e:
        logger.error(f"Error sending Telegram message: {e}", exc_info=True)
        return False

