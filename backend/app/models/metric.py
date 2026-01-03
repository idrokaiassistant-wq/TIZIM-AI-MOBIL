from sqlalchemy import Column, String, DateTime, Float, Text
from sqlalchemy.sql import func
from app.database import Base
import uuid


class Metric(Base):
    __tablename__ = "metrics"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    metric_name = Column(String, nullable=False, index=True)  # response_time, error_rate, active_users, etc.
    metric_value = Column(Float, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    tags = Column(Text, nullable=True)  # JSON string for additional metadata

