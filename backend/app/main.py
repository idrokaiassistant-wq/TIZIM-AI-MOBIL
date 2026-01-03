from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db, SessionLocal
from app.models import Category, User
from app.utils.auth import get_password_hash
from app.api import auth, tasks, habits, transactions, budgets, productivity, ai, analytics, optimization
import uuid
import logging

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if settings.debug else logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    debug=settings.debug,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
@app.on_event("startup")
async def startup_event():
    logger.info("Initializing database...")
    init_db()
    
    # Load seed data if not exists
    db = SessionLocal()
    try:
        logger.info("Loading default categories...")
        existing = db.query(Category).filter(Category.is_default == 1).first()
        if not existing:
            # Insert default categories
            categories = [
                Category(id="cat_task_ish", name="Ish", type="task", color="indigo", icon="Briefcase", is_default=1),
                Category(id="cat_task_shaxsiy", name="Shaxsiy", type="task", color="blue", icon="User", is_default=1),
                Category(id="cat_task_oqish", name="O'qish", type="task", color="orange", icon="BookOpen", is_default=1),
                Category(id="cat_trans_oziq", name="Oziq-ovqat", type="transaction", color="orange", icon="ShoppingBag", is_default=1),
                Category(id="cat_trans_transport", name="Transport", type="transaction", color="blue", icon="Car", is_default=1),
                Category(id="cat_trans_maosh", name="Maosh", type="transaction", color="emerald", icon="CreditCard", is_default=1),
                Category(id="cat_habit_salomatlik", name="Salomatlik", type="habit", color="green", icon="Heart", is_default=1),
                Category(id="cat_habit_sport", name="Sport", type="habit", color="red", icon="Dumbbell", is_default=1),
            ]
            for category in categories:
                db.add(category)
            db.commit()
            logger.info("Default categories created successfully")
        else:
            logger.info("Default categories already exist")
    except Exception as e:
        logger.error(f"Error loading categories: {str(e)}", exc_info=True)
        db.rollback()
    
    # Create default user if not exists
    try:
        logger.info("Checking for default user...")
        default_user = db.query(User).filter(User.email == "test@example.com").first()
        if not default_user:
            logger.info("Creating default user: test@example.com")
            password_hash = get_password_hash("test123456")
            user = User(
                id=str(uuid.uuid4()),
                email="test@example.com",
                password_hash=password_hash,
                full_name="Test User",
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            logger.info(f"Default user created successfully: {user.email} (ID: {user.id})")
        else:
            logger.info(f"Default user already exists: {default_user.email} (ID: {default_user.id})")
    except Exception as e:
        logger.error(f"Error creating default user: {str(e)}", exc_info=True)
        db.rollback()
    finally:
        db.close()
        logger.info("Database initialization complete")


# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(habits.router, prefix="/api/habits", tags=["habits"])
app.include_router(transactions.router, prefix="/api/transactions", tags=["transactions"])
app.include_router(budgets.router, prefix="/api/budgets", tags=["budgets"])
app.include_router(productivity.router, prefix="/api/productivity", tags=["productivity"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(optimization.router, prefix="/api/optimization", tags=["optimization"])


@app.get("/")
async def root():
    return {
        "message": "Tizim AI API",
        "version": settings.app_version,
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {"status": "ok"}
