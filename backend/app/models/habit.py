from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Habit(Base):
    __tablename__ = "habits"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    goal = Column(String, nullable=False)  # '30 min', '2 Litr', 'Har kuni'
    category = Column(String, nullable=True)  # 'Salomatlik', 'O\'qish', 'Sport'
    icon = Column(String, default="Zap")
    color = Column(String, default="text-purple-500")
    bg_color = Column(String, default="bg-purple-100")
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    total_completions = Column(Integer, default=0)
    is_active = Column(Integer, default=1)  # Boolean as INTEGER (0/1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="habits")
    completions = relationship("HabitCompletion", back_populates="habit", cascade="all, delete-orphan")

