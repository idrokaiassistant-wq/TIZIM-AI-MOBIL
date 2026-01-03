from sqlalchemy import Column, String, DateTime, Integer
from sqlalchemy.sql import func
from app.database import Base


class TelegramCode(Base):
    __tablename__ = "telegram_codes"

    phone_number = Column(String, primary_key=True, index=True)
    code = Column(String(6), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    attempts = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

