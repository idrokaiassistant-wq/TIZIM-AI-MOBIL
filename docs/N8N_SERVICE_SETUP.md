# n8n Service Railway'da Yaratish

## Qadam-baqadam Ko'rsatma

### Qadam 1: Yangi Service Yaratish

1. Railway Dashboard'ga kiring: https://railway.app/dashboard
2. Project → **New** tugmasini bosing
3. **GitHub Repo** ni tanlang
4. Repository: `idrokaiassistant-wq/TIZIM-AI-MOBIL` ni tanlang
5. Service nomini o'zgartiring: **n8n**

### Qadam 2: Source Sozlash

**Settings** → **Source** bo'limiga kiring:

- **Root Directory**: `n8n`
- **Branch**: `main` (default)

### Qadam 3: Build va Deploy Sozlash

**Settings** → **Deploy** bo'limiga kiring:

- **Build Command**: `pnpm install`
- **Start Command**: `pnpm start`

**Yoki** `railway-n8n.json` config file ishlatish:
- **Settings** → **Config-as-code** → **Railway Config File**
- File path: `railway-n8n.json`

### Qadam 4: Environment Variables

**Variables** bo'limiga kiring va quyidagilarni qo'shing:

```env
# Backend API
BACKEND_API_URL=https://backend-production-219b.up.railway.app

# n8n Basic Auth
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=<sizning-xavfsiz-parol>

# n8n Host va Port
N8N_HOST=0.0.0.0
N8N_PORT=$PORT

# n8n Protocol (deploy qilingandan keyin URL o'zgaradi)
WEBHOOK_URL=https://n8n-production-xxxx.up.railway.app

# Telegram Bot (agar kerak bo'lsa)
TELEGRAM_BOT_TOKEN=your-telegram-bot-token

# Email SMTP (agar kerak bo'lsa)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
```

**Muhim**: `N8N_BASIC_AUTH_PASSWORD` ni xavfsiz parol bilan almashtiring!

### Qadam 5: Deploy

1. Barcha sozlamalarni saqlang
2. Service avtomatik deploy qilinadi
3. Deploy logs'ni kuzatib turing

### Qadam 6: n8n UI'ga Kirish

Deploy muvaffaqiyatli bo'lgandan keyin:

1. Service → **Networking** bo'limiga kiring
2. Public domain'ni ko'ring: `https://n8n-production-xxxx.up.railway.app`
3. Browser'da oching
4. Login qiling:
   - Username: `admin`
   - Password: (yuqorida belgilangan parol)

### Qadam 7: Workflow'lar Yaratish

n8n UI'ga kirgandan keyin:

1. **Workflows** bo'limiga kiring
2. **New Workflow** tugmasini bosing
3. Workflow'larni yarating (qarang: `n8n-workflows.md`)

## Tekshirish

n8n ishlayotganini tekshirish:

```bash
curl https://n8n-production-xxxx.up.railway.app/healthz
```

## Muammo Hal Qilish

### Build Xatosi

Agar `pnpm install` xato bersa:

1. Root Directory `n8n` ekanligini tekshiring
2. `n8n/package.json` fayli mavjudligini tekshiring
3. Build logs'ni ko'rib chiqing

### Start Xatosi

Agar `pnpm start` xato bersa:

1. Environment variable'larni tekshiring
2. `N8N_PORT=$PORT` to'g'ri ekanligini tekshiring
3. Deploy logs'ni ko'rib chiqing

### n8n UI Ko'rinmayapti

1. Public domain mavjudligini tekshiring
2. Service ishlayotganini tekshiring (Metrics bo'limida)
3. Health check endpoint'ni tekshiring

## Qo'shimcha Ma'lumot

- n8n workflow'lar: `n8n-workflows.md` faylida
- n8n documentation: https://docs.n8n.io
- Railway n8n guide: https://docs.railway.app/guides/n8n

