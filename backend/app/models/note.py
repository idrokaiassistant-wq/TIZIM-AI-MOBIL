from sqlalchemy import Column, String, Text, Integer, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Note(Base):
    __tablename__ = "notes"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    note_date = Column(Date, nullable=False, index=True)
    content = Column(Text, nullable=False)
    tags = Column(Text, nullable=True)  # JSON array as TEXT (comma-separated or JSON)
    is_pinned = Column(Integer, default=0)  # Boolean as INTEGER (0/1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="notes")

