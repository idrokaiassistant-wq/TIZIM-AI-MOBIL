from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func
from app.database import Base


class TelegramUser(Base):
    __tablename__ = "telegram_users"

    phone_number = Column(String, primary_key=True, index=True)
    chat_id = Column(String, unique=True, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

