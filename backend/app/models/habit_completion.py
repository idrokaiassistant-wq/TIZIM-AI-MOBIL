from sqlalchemy import Column, String, Text, Integer, Date, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class HabitCompletion(Base):
    __tablename__ = "habit_completions"

    id = Column(String, primary_key=True, index=True)
    habit_id = Column(String, ForeignKey("habits.id", ondelete="CASCADE"), nullable=False, index=True)
    completion_date = Column(Date, nullable=False, index=True)
    progress = Column(Integer, default=0)  # 0-100
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    habit = relationship("Habit", back_populates="completions")

    # Constraints
    __table_args__ = (UniqueConstraint("habit_id", "completion_date", name="uq_habit_completion_date"),)

