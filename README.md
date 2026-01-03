# Tizim AI - Personal Productivity & Finance Management System

Tizim AI - shaxsiy produktivlik va moliyaviy boshqaruv tizimi. React + FastAPI + PostgreSQL stack'da qurilgan.

## 🚀 Features

- **Vazifalar Boshqaruvi** - Kunlik vazifalarni boshqarish va kuzatish
- **Odatlar Tracking** - Odatlarni kuzatish va streak hisoblash
- **Moliyaviy Boshqaruv** - Xarajatlar va daromadlarni kuzatish
- **Byudjet Planning** - Byudjet rejalashtirish va monitoring
- **Produktivlik Analytics** - Kunlik/haftalik/oylik statistika
- **AI Tavsiyalar** - ML asosida avtomatik tavsiyalar
- **Telegram Mini App** - Telegram orqali kirish

## 📦 Tech Stack

### Frontend
- React 19 + TypeScript
- Vite
- TailwindCSS
- Zustand (State Management)
- Capacitor (Mobile)

### Backend
- FastAPI (Python)
- SQLAlchemy ORM
- PostgreSQL / SQLite
- JWT Authentication
- AI/ML Services (scikit-learn, pandas, prophet)

### Automation
- n8n (Workflow Automation)

## 🛠️ Setup

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL (production) / SQLite (development)
- Git

### Local Development

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python scripts/create_default_user.py
uvicorn app.main:app --reload
```

Default user:
- Email: `test@example.com`
- Password: `test123456`

#### Frontend
```bash
npm install
npm run dev
```

#### n8n (Optional)
```bash
cd n8n
pnpm install
pnpm dev
```

## 📚 Documentation

- [Deployment Guide](docs/DEPLOYMENT.md) - Railway deploy qo'llanmasi
- [Database Schema](docs/MVP_DATABASE_SCHEMA.md) - To'liq ma'lumotlar bazasi strukturası
- [API Documentation](backend/README.md) - Backend API qo'llanmasi
- [Features & Functions](docs/FEATURES_AND_FUNCTIONS.md) - Funksiyalar ro'yxati

## 🚢 Deployment

### Railway Deployment

1. Railway'ga repository'ni connect qiling
2. PostgreSQL service qo'shing
3. Environment variables sozlang:
   - `DATABASE_URL` (avtomatik - PostgreSQL)
   - `SECRET_KEY` (generate qiling)
   - `CORS_ORIGINS` (frontend URL)
4. Deploy!

Batafsil: [Deployment Guide](docs/DEPLOYMENT.md)

### n8n Deployment

n8n'ni Railway'da alohida service sifatida deploy qilish mumkin yoki Docker orqali.

## 🔄 Automation (n8n Workflows)

Quyidagi workflow'lar n8n orqali avtomatlashtirilgan:

1. **Daily Summary Email** - Kunlik xulosa email
2. **Task Reminders** - Vazifa eslatmalari
3. **Budget Alerts** - Byudjet ogohlantirishlari
4. **Habit Streak Tracking** - Odatlar streak kuzatish
5. **Weekly Reports** - Haftalik hisobotlar

## 📝 License

MIT License

## 👥 Contributors

- idrokaiassistant-wq

## 🔗 Links

- [GitHub Repository](https://github.com/idrokaiassistant-wq/TIZIM-AI-MOBIL)
- [API Docs](http://localhost:8000/docs) (local)
- [n8n Docs](https://docs.n8n.io)
