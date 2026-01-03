# Railway Deploy Qo'llanmasi

Bu hujjat Tizim AI backend'ini Railway platformasiga deploy qilish bo'yicha qo'llanmadir.

## Talablar

1. [Railway](https://railway.app) hisobi
2. GitHub repository
3. PostgreSQL database (Railway Postgres service)

## 1. Railway Hisobini Yaratish

1. [Railway.app](https://railway.app) ga kiring
2. "Login" yoki "Get Started" tugmasini bosing
3. GitHub account orqali login qiling

## 2. Repository'ni Railway'ga Qo'shish

1. Railway dashboard'da "New Project" tugmasini bosing
2. "Deploy from GitHub repo" ni tanlang
3. Repository'ni tanlang va "Deploy" tugmasini bosing

## 3. PostgreSQL Database Qo'shish

1. Railway project dashboard'da "New" tugmasini bosing
2. "Database" → "Add PostgreSQL" ni tanlang
3. Database avtomatik yaratiladi va `DATABASE_URL` environment variable sifatida qo'shiladi

## 4. Environment Variables Sozlash

Railway project dashboard'da "Variables" bo'limiga kiring va quyidagilarni qo'shing:

### Majburiy Variables:

```
SECRET_KEY=your-very-secure-secret-key-here-change-this
```

Secret key yaratish uchun:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Ixtiyoriy Variables:

```
DEBUG=false
CORS_ORIGINS=https://your-app.railway.app,https://web.telegram.org
```

**Eslatma**: `DATABASE_URL` avtomatik qo'shiladi (PostgreSQL service orqali)

## 5. Deploy Sozlamalari

### railway.json

Loyiha ildizida `railway.json` fayli mavjud:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pip install -r backend/requirements.txt"
  },
  "deploy": {
    "startCommand": "cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Root Directory

Agar Railway avtomatik root directory'ni topa olmasa:
1. Project Settings → Source
2. Root Directory: `backend/` (agar boshqa bo'lsa)

## 6. Deploy

1. Railway avtomatik ravishda repository'ni deploy qiladi
2. Deploy jarayonini "Deployments" bo'limida kuzatib boring
3. Muvaffaqiyatli deploy qilinganidan keyin "Settings" → "Networking" da URL oling

## 7. Default User Yaratish

Deploy qilingandan keyin default user avtomatik yaratiladi:
- **Email**: `test@example.com`
- **Password**: `test123456`

Agar avtomatik yaratilmagan bo'lsa, Railway console orqali yaratish mumkin:

```bash
python scripts/create_default_user.py
```

## 8. Test Qilish

1. API endpoint'ini tekshiring:
   ```
   https://your-app.railway.app/health
   ```
   Javob: `{"status": "ok"}`

2. API documentation:
   ```
   https://your-app.railway.app/docs
   ```

3. Login test:
   ```bash
   curl -X POST "https://your-app.railway.app/api/auth/login" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "username=test@example.com&password=test123456"
   ```

## 9. Telegram Mini App Sozlash

### Frontend Deploy

Frontend'ni ham Railway yoki boshqa platformaga (Vercel, Netlify) deploy qiling va:

1. `.env` yoki environment variable'da:
   ```
   VITE_API_URL=https://your-backend.railway.app
   ```

2. Backend CORS'da frontend domain'ni qo'shing:
   ```
   CORS_ORIGINS=https://your-frontend.railway.app,https://web.telegram.org
   ```

### Telegram Bot Sozlash

1. [@BotFather](https://t.me/botfather) ga kiring
2. `/newbot` - yangi bot yarating
3. Bot token'ni saqlang
4. Bot settings'da "Menu Button" → "Configure Menu Button"
5. Mini App URL: `https://your-frontend.railway.app`

## 10. Monitoring va Logs

- **Logs**: Railway dashboard'da "Deployments" → "View Logs"
- **Metrics**: "Metrics" bo'limida CPU, Memory, Network statistikalarini ko'ring

## Troubleshooting

### Database Connection Xatosi

- `DATABASE_URL` to'g'ri qo'shilganini tekshiring
- PostgreSQL service ishlamoqdamikanligini tekshiring

### Port Xatosi

- Railway `$PORT` environment variable'ni avtomatik beradi
- Dockerfile yoki start command'da `$PORT` ishlatilganini tekshiring

### CORS Xatosi

- Frontend domain CORS_ORIGINS'da mavjudligini tekshiring
- Telegram Mini App uchun `https://web.telegram.org` qo'shilganini tekshiring

### Build Xatosi

- `requirements.txt` da barcha dependency'lar mavjudligini tekshiring
- Python version 3.11+ ekanligini tekshiring

## Foydali Linklar

- [Railway Documentation](https://docs.railway.app)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [Telegram Mini Apps](https://core.telegram.org/bots/webapps)

