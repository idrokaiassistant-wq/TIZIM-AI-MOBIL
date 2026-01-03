from sqlalchemy import Column, String, Text, Integer, Date, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class ProductivityLog(Base):
    __tablename__ = "productivity_logs"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    log_date = Column(Date, nullable=False, index=True)
    tasks_completed = Column(Integer, default=0)
    tasks_total = Column(Integer, default=0)
    habits_completed = Column(Integer, default=0)
    habits_total = Column(Integer, default=0)
    focus_time_minutes = Column(Integer, default=0)
    energy_level = Column(Integer, default=5)  # 1-10
    mood = Column(String, nullable=True)  # 'great', 'good', 'ok', 'bad', 'terrible'
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="productivity_logs")

    # Constraints
    __table_args__ = (UniqueConstraint("user_id", "log_date", name="uq_user_log_date"),)

