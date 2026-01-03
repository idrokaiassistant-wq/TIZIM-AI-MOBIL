from sqlalchemy import Column, String, Text, Float, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String, nullable=False, index=True)
    amount = Column(Float, nullable=False)  # DECIMAL as REAL
    transaction_type = Column(String, nullable=False, index=True)  # 'income', 'expense'
    transaction_date = Column(Date, nullable=False, index=True)
    icon = Column(String, default="CreditCard")
    color = Column(String, default="bg-slate-100 text-slate-600")
    receipt_url = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="transactions")

