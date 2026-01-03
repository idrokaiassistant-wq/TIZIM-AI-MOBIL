# Railway Deployment - To'liq Qo'llanma

Bu hujjat Tizim AI dasturini Railway'ga deploy qilish bo'yicha to'liq qo'llanmadir.

## 📋 Overview

Loyihada 3 ta asosiy service deploy qilinadi:
1. **Backend API** - FastAPI backend
2. **Frontend** - React frontend (Vercel/Netlify yoki Railway)
3. **n8n** - Workflow automation (Railway)

---

## 1. Backend API Deploy

### Step 1: Repository'ni Railway'ga Qo'shish

1. [Railway Dashboard](https://railway.app/dashboard) ga kiring
2. "New Project" → "Deploy from GitHub repo"
3. Repository'ni tanlang: `idrokaiassistant-wq/TIZIM-AI-MOBIL`
4. Deploy qilish

### Step 2: PostgreSQL Database Qo'shish

1. Project dashboard'da "New" tugmasini bosing
2. "Database" → "Add PostgreSQL"
3. Database avtomatik yaratiladi

### Step 3: Environment Variables

Backend service'da "Variables" bo'limiga quyidagilarni qo'shing:

```env
# Database (avtomatik qo'shiladi)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# JWT Secret (generate qiling)
SECRET_KEY=your-very-secure-secret-key-here

# Debug mode
DEBUG=false

# CORS Origins (frontend va Telegram)
CORS_ORIGINS=https://your-frontend.railway.app,https://web.telegram.org
```

**SECRET_KEY generate qilish:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Step 4: Deploy Settings

Railway `railway.json` faylini avtomatik o'qidi. Agar ishlamasa:

1. "Settings" → "Deploy"
2. Root Directory: `/` (default)
3. Build Command: `pip install -r backend/requirements.txt`
4. Start Command: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Step 5: Deploy va Test

1. Deploy jarayonini kuzatib boring
2. Deploy tugagandan keyin "Settings" → "Networking" da URL oling
3. Test qiling:
   ```
   https://your-backend.railway.app/health
   https://your-backend.railway.app/docs
   ```

---

## 2. Frontend Deploy

### Variant A: Railway'da Deploy

1. Project'da "New" → "GitHub Repo"
2. Xuddi shu repository'ni tanlang
3. Service Settings:
   - Root Directory: `/` (default)
   - Build Command: `npm install && npm run build`
   - Start Command: `npx serve -s dist -l $PORT`
   - Output Directory: `dist`

4. Environment Variables:
```env
VITE_API_URL=https://your-backend.railway.app
```

### Variant B: Vercel/Netlify (Tavsiya etiladi)

#### Vercel:
1. [Vercel](https://vercel.com) ga kiring
2. "New Project" → GitHub repo'ni tanlang
3. Build Settings:
   - Framework Preset: Vite
   - Root Directory: `/`
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. Environment Variables:
   - `VITE_API_URL`: Backend URL

#### Netlify:
1. [Netlify](https://netlify.com) ga kiring
2. "Add new site" → "Import an existing project"
3. Build Settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

4. Environment Variables:
   - `VITE_API_URL`: Backend URL

---

## 3. n8n Deploy

### Step 1: n8n Service Yaratish

1. Railway project'da "New" → "GitHub Repo"
2. Xuddi shu repository'ni tanlang
3. Service Settings:
   - Root Directory: `n8n`
   - Build Command: `pnpm install`
   - Start Command: `pnpm start`

### Step 2: Environment Variables

n8n service'da quyidagilarni qo'shing:

```env
# Backend API
BACKEND_API_URL=https://your-backend.railway.app

# n8n Basic Auth
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=your-secure-password

# n8n Host
N8N_HOST=0.0.0.0
N8N_PORT=$PORT

# n8n Protocol
WEBHOOK_URL=https://your-n8n.railway.app

# Telegram Bot (agar kerak bo'lsa)
TELEGRAM_BOT_TOKEN=your-telegram-bot-token

# Email SMTP (agar kerak bo'lsa)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
```

### Step 3: n8n Workflow'lar

1. n8n UI'ga kirish: `https://your-n8n.railway.app`
2. Login qilish (admin/password)
3. Workflow'larni import qilish:
   - Daily Summary Email
   - Task Reminders
   - Budget Alerts
   - va boshqalar

Batafsil: [n8n-workflows.md](../n8n-workflows.md)

---

## 4. Telegram Bot Sozlash

### Step 1: Bot Yaratish

1. [@BotFather](https://t.me/botfather) ga kiring
2. `/newbot` - yangi bot yarating
3. Bot token'ni saqlang

### Step 2: Mini App Sozlash

1. Bot Settings'da "Menu Button" → "Configure Menu Button"
2. Text: "Tizim AI" yoki "Ochish"
3. Web App URL: Frontend URL (Vercel/Netlify/Railway)

### Step 3: Environment Variables

n8n va backend'da:
```env
TELEGRAM_BOT_TOKEN=your-bot-token
```

---

## 5. Networking va Domains

### Backend CORS

Backend `CORS_ORIGINS`'da quyidagilar bo'lishi kerak:
- Frontend URL
- Telegram web app domain: `https://web.telegram.org`

### Custom Domains

Railway'da har bir service uchun custom domain qo'shishingiz mumkin:
1. Settings → Networking
2. "Generate Domain" yoki "Custom Domain" qo'shing

---

## 6. Monitoring va Logs

### Railway Logs

Har bir service uchun:
- "Deployments" → "View Logs"
- Real-time loglar ko'rish

### Metrics

- CPU, Memory, Network statistikalarini ko'rish
- Error tracking

---

## 7. Database Backup

PostgreSQL service'da:
- "Settings" → "Backups"
- Avtomatik backup sozlash
- Manual backup olish

---

## 8. Troubleshooting

### Backend ishlamayapti

1. Loglarni tekshiring
2. Environment variables to'g'ri ekanligini tekshiring
3. Database connection tekshiring
4. Port sozlamalarini tekshiring

### n8n ishlamayapti

1. pnpm o'rnatilganligini tekshiring
2. PORT environment variable mavjudligini tekshiring
3. Build command to'g'ri ekanligini tekshiring

### Frontend API'ga ulana olmayapti

1. `VITE_API_URL` to'g'ri ekanligini tekshiring
2. CORS sozlamalarini tekshiring
3. Backend ishlayotganini tekshiring

---

## 9. Cost Estimation

Railway Pricing:
- Backend: ~$5-10/oy (Pro plan)
- PostgreSQL: ~$5/oy (Pro plan)
- n8n: ~$5-10/oy (Pro plan)

**Jami**: ~$15-25/oy

Free tier'da:
- 500 hours/oy (limited)
- Shared resources

---

## 10. Production Checklist

- [ ] Environment variables to'g'ri sozlangan
- [ ] Database backup sozlangan
- [ ] CORS to'g'ri sozlangan
- [ ] SSL/HTTPS ishlayapti
- [ ] n8n workflow'lar test qilingan
- [ ] Telegram bot ishlayapti
- [ ] Monitoring sozlangan
- [ ] Error tracking (Sentry yoki shunga o'xshash)
- [ ] Logs to'g'ri ishlayapti

---

## 🔗 Foydali Linklar

- [Railway Documentation](https://docs.railway.app)
- [Railway Pricing](https://railway.app/pricing)
- [n8n Documentation](https://docs.n8n.io)
- [Telegram Bot API](https://core.telegram.org/bots/api)

