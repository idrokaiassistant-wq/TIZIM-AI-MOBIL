# Tizim AI Backend API

FastAPI-based backend for Tizim AI - Personal Productivity and Finance Management System.

## Features

- **Authentication**: JWT-based authentication with password hashing
- **Tasks Management**: Full CRUD operations for tasks
- **Habits Tracking**: Habit management with streak calculation
- **Financial Transactions**: Income/expense tracking with statistics
- **Budget Management**: Budget tracking with status monitoring
- **Productivity Logs**: Daily productivity tracking and statistics

## Tech Stack

- **Framework**: FastAPI 0.115.0
- **Database**: SQLite (MVP)
- **ORM**: SQLAlchemy 2.0.36
- **Authentication**: JWT (python-jose)
- **Password Hashing**: bcrypt (passlib)

## Setup

### Prerequisites

- Python 3.11+
- pip

### Installation

1. Clone the repository and navigate to backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file (optional, defaults are provided):
```bash
cp .env.example .env
```

5. Initialize database:
```bash
# Database will be created automatically on first run
```

6. Create default user (optional):
```bash
python scripts/create_default_user.py
```
This creates a test user:
- Email: `test@example.com`
- Password: `test123456`

7. Run the application:
```bash
# Make sure you're in the backend directory
cd backend
uvicorn app.main:app --reload
```

**Important**: The uvicorn command must be run from the `backend/` directory, not from the project root.

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, you can access:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Docker Setup

### Using Docker Compose

From the project root:
```bash
docker-compose up -d
```

This will:
- Build the backend Docker image
- Start the backend service on port 8000
- Create a volume for the SQLite database

### Using Docker directly

```bash
cd backend
docker build -t tizim-ai-backend .
docker run -p 8000:8000 tizim-ai-backend
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get token
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Tasks
- `GET /api/tasks` - Get all tasks (with filters)
- `POST /api/tasks` - Create new task
- `GET /api/tasks/{id}` - Get task by ID
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task
- `PATCH /api/tasks/{id}/toggle` - Toggle task status

### Habits
- `GET /api/habits` - Get all habits
- `POST /api/habits` - Create new habit
- `GET /api/habits/{id}` - Get habit by ID
- `PUT /api/habits/{id}` - Update habit
- `DELETE /api/habits/{id}` - Delete habit
- `POST /api/habits/{id}/complete` - Mark habit as completed
- `GET /api/habits/{id}/completions` - Get habit completion history

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create new transaction
- `GET /api/transactions/{id}` - Get transaction by ID
- `PUT /api/transactions/{id}` - Update transaction
- `DELETE /api/transactions/{id}` - Delete transaction
- `GET /api/transactions/stats/summary` - Get transaction statistics

### Budgets
- `GET /api/budgets` - Get all budgets
- `POST /api/budgets` - Create new budget
- `GET /api/budgets/{id}` - Get budget by ID
- `PUT /api/budgets/{id}` - Update budget
- `DELETE /api/budgets/{id}` - Delete budget
- `GET /api/budgets/{id}/status` - Get budget status

### Productivity
- `GET /api/productivity/logs` - Get all productivity logs
- `POST /api/productivity/logs` - Create new log
- `GET /api/productivity/logs/{id}` - Get log by ID
- `PUT /api/productivity/logs/{id}` - Update log
- `DELETE /api/productivity/logs/{id}` - Delete log
- `GET /api/productivity/stats` - Get productivity statistics

## Testing

Run tests with pytest:
```bash
pytest
```

Run with coverage:
```bash
pytest --cov=app tests/
```

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── config.py            # Configuration
│   ├── database.py          # Database connection
│   ├── models/              # SQLAlchemy models
│   ├── schemas/             # Pydantic schemas
│   ├── api/                 # API routes
│   ├── services/            # Business logic
│   └── utils/               # Utilities
├── database/
│   ├── schema.sql
│   └── migrations/
├── tests/                   # Test files
├── requirements.txt
├── Dockerfile
└── README.md
```

## Environment Variables

- `DATABASE_URL` - Database connection string (default: `sqlite:///./tizim_ai.db`)
- `SECRET_KEY` - JWT secret key (change in production!)
- `DEBUG` - Debug mode (default: `false`)
- `CORS_ORIGINS` - Allowed CORS origins (comma-separated)

## Notes

- SQLite is used for MVP. For production, consider PostgreSQL.
- JWT tokens expire after 24 hours by default.
- All endpoints (except auth) require authentication.
- Database is automatically initialized on first run.

