# Railway Deploy Muammolarini Hal Qilish

## Muammolar

### 1. Frontend Deploy Muammosi

#### Muammo A: Root Directory Noto'g'ri
Frontend service'da Root Directory `/android/app` ga o'rnatilgan, bu noto'g'ri. Bu tufayli:
- Railpack builder npm topa olmayapti (`npm: not found`)
- Build jarayoni muvaffaqiyatsiz bo'ladi
- Frontend deploy qilinmaydi

**Yechim**: [docs/FRONTEND_ROOT_DIRECTORY_FIX.md](docs/FRONTEND_ROOT_DIRECTORY_FIX.md)

#### Muammo B: Railpack Builder Aniqlay Olmayapti
Railpack frontend'ni aniqlay olmayapti, chunki u `android/` papkasidagi `build.gradle` faylini ko'rib Java deb o'ylayapti.

### 2. n8n Deploy Qilinmagan
n8n service Railway dashboard'da ko'rinmayapti.

---

## Yechimlar

### 1. Frontend Service Sozlash

Railway dashboard'da frontend service uchun quyidagilarni sozlang:

#### Service Settings:
1. Service'ni oching yoki yangi service yarating
2. **Settings** → **Source**:
   - **Root Directory**: `/` ga o'zgartiring (agar `/android/app` bo'lsa)
   - **Update** tugmasini bosing
3. **Settings** → **Deploy**:
   - **Build Command**: `npm ci --legacy-peer-deps && npm run build`
   - **Start Command**: `npx serve -s dist -l $PORT`
   - **Output Directory**: `dist`

#### Environment Variables:
```
VITE_API_URL=https://backend-production-219b.up.railway.app
```

#### Yoki `railway-frontend.json` ishlatish:
Service'da **Settings** → **Service Settings** → **Use Configuration File** → `railway-frontend.json` tanlang.

---

### 2. n8n Service Qo'shish

**Batafsil ko'rsatma**: [docs/N8N_SERVICE_SETUP.md](docs/N8N_SERVICE_SETUP.md)

#### Yangi Service Yaratish:
1. Railway dashboard'da **New** → **GitHub Repo**
2. Repository: `idrokaiassistant-wq/TIZIM-AI-MOBIL`
3. Service nomini o'zgartiring: `n8n`

#### Service Settings:
1. **Settings** → **Source**:
   - Root Directory: `n8n`
2. **Settings** → **Deploy**:
   - **Build Command**: `pnpm install`
   - **Start Command**: `pnpm start`

#### Environment Variables:
```env
# Backend API
BACKEND_API_URL=https://backend-production-219b.up.railway.app

# n8n Basic Auth
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=<sizning-xavfsiz-parol>

# n8n Host
N8N_HOST=0.0.0.0
N8N_PORT=$PORT

# n8n Protocol (agar custom domain bo'lsa)
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

#### Yoki `railway-n8n.json` ishlatish:
Service'da **Settings** → **Service Settings** → **Use Configuration File** → `railway-n8n.json` tanlang.

---

### 3. Nixpacks npm Undefined Variable Xatosi

Frontend build paytida quyidagi xato bo'lsa:
```
error: undefined variable 'npm'
at /app/.nixpacks/nixpkgs-...nix:19:19
nodejs_18 npm
```

**Yechim**: `nixpacks.toml` faylida `npm` ni olib tashlash. `nodejs_18` paketiga `npm` allaqachon kiritilgan.

```toml
[phases.setup]
nixPkgs = ["nodejs_18"]  # npm ni olib tashlash - nodejs_18 npm ni o'z ichiga oladi
```

---

### 3.1. Nixpacks EBUSY Cache Xatosi

Frontend build paytida quyidagi xato bo'lsa:
```
npm error EBUSY: resource busy or locked, rmdir '/app/node_modules/.cache'
```

**Sabab**: Build phase'da `npm ci` qayta ishga tushadi va cache mount bilan conflict yuzaga keladi.

**Yechim**: 
1. `railway-frontend.json` yoki Dashboard'da build command'da `npm ci` ni olib tashlash
2. Build command faqat `npm run build` bo'lishi kerak

**Dashboard'da**:
- **Build Command**: `npm run build` (npm ci ni olib tashlash)
- **Pre-deploy Command**: bo'sh qoldirish (frontend uchun kerak emas)

**railway-frontend.json**:
```json
{
  "build": {
    "buildCommand": "npm run build"
  }
}
```

**Eslatma**: Railway avtomatik install phase'ni ishlatadi (`nixpacks.toml` da `[phases.install]`), shuning uchun build command'da `npm ci` kerak emas.

---

### 4. Frontend npm Dependency Muammosi

Frontend build paytida dependency conflict bo'lsa:

#### Yechim A: `package.json` ga qo'shing:
```json
{
  "scripts": {
    "install": "npm install --legacy-peer-deps",
    "build": "npm run install && npm run build:prod",
    "build:prod": "tsc -b && vite build"
  }
}
```

#### Yechim B: `.npmrc` fayl yaratish:
```
legacy-peer-deps=true
```

#### Yechim C: Railway Build Command'da:
```
npm ci --legacy-peer-deps && npm run build
```

---

### 5. Backend CORS Sozlash

Frontend URL'ni backend CORS'ga qo'shing:

Backend service → **Variables**:
```
CORS_ORIGINS=https://app-production-e8ad.up.railway.app,https://web.telegram.org
```

---

## Qadamlar

### Frontend Deploy:
1. Frontend service'ni oching
2. Settings → Deploy → Build Command: `npm run build` (npm ci kerak emas - install phase'da allaqachon qilingan)
3. Settings → Deploy → Start Command: `npx serve -s dist -l $PORT`
4. Settings → Deploy → Pre-deploy Command: (bo'sh qoldirish - frontend uchun kerak emas)
5. Variables → `VITE_API_URL` qo'shing
6. Redeploy

**Eslatma**: Agar EBUSY cache xatosi bo'lsa, [docs/NIXPACKS_EBUSY_FIX.md](docs/NIXPACKS_EBUSY_FIX.md) ga qarang.

### n8n Deploy:
1. New → GitHub Repo
2. Repository tanlang
3. Root Directory: `n8n`
4. Environment variables qo'shing
5. Deploy

---

## Test

### Backend:
```
https://backend-production-219b.up.railway.app/health
https://backend-production-219b.up.railway.app/docs
```

### Frontend (deploy qilingandan keyin):
```
https://app-production-e8ad.up.railway.app
```

### n8n (deploy qilingandan keyin):
```
https://your-n8n.railway.app
```

---

## Troubleshooting

### Frontend build xatosi:
- `--legacy-peer-deps` flag'ni qo'shing
- `.npmrc` fayl yaratish
- `node_modules` va `package-lock.json` ni o'chirib qayta install qilish

### n8n ishlamayapti:
- Root Directory `n8n` ekanligini tekshiring
- pnpm o'rnatilganini tekshiring
- PORT environment variable mavjudligini tekshiring

### CORS xatosi:
- Frontend URL backend CORS_ORIGINS'da mavjudligini tekshiring
- Telegram web app domain qo'shilganini tekshiring

