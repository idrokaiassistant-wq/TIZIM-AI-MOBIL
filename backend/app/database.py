from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

# Create engine with appropriate connection args
# For SQLite: need check_same_thread=False
# For PostgreSQL: use connection pooling (default)
if "sqlite" in settings.database_url:
    connect_args = {"check_same_thread": False}
    # SQLite doesn't support pool_size
    engine = create_engine(
        settings.database_url,
        connect_args=connect_args,
        echo=settings.debug,
    )
else:
    # PostgreSQL: use connection pooling
    engine = create_engine(
        settings.database_url,
        pool_size=10,
        max_overflow=20,
        echo=settings.debug,
    )

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()


def get_db():
    """Dependency for getting database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database - create all tables"""
    Base.metadata.create_all(bind=engine)

