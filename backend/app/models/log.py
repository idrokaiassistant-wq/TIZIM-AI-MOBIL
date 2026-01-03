from sqlalchemy import Column, String, DateTime, Integer, Float, Text
from sqlalchemy.sql import func
from app.database import Base
import uuid


class Log(Base):
    __tablename__ = "logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    level = Column(String, nullable=False, index=True)  # DEBUG, INFO, WARNING, ERROR, CRITICAL
    message = Column(Text, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    user_id = Column(String, nullable=True, index=True)
    endpoint = Column(String, nullable=True, index=True)
    method = Column(String, nullable=True)  # GET, POST, PUT, DELETE, etc.
    status_code = Column(Integer, nullable=True)
    response_time = Column(Float, nullable=True)  # milliseconds
    error_details = Column(Text, nullable=True)
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)


