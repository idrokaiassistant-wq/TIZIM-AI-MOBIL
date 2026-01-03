from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)  # NULL = default categories
    name = Column(String, nullable=False)
    type = Column(String, nullable=False, index=True)  # 'task', 'habit', 'transaction'
    color = Column(String, nullable=True)
    icon = Column(String, nullable=True)
    is_default = Column(Integer, default=0)  # Boolean as INTEGER (0/1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="categories")

