# ✅ Railway Setup - Bajarilgan Ishlar

## 🎉 Muvaffaqiyatli Sozlandi

### 1. ✅ Environment Variables

#### Frontend Service (app):
- ✅ `VITE_API_URL=https://backend-production-219b.up.railway.app`

#### Backend Service:
- ✅ `CORS_ORIGINS=https://app-production-e8ad.up.railway.app,https://web.telegram.org`

---

## 📋 Railway Dashboard'da Qilish Kerak Bo'lgan Ishlar

### Frontend Service (app)

**Settings → Deploy:**
1. **Build Command**: `npm ci --legacy-peer-deps && npm run build`
2. **Start Command**: `npx serve -s dist -l $PORT`
3. **Output Directory**: `dist`

**Yoki `nixpacks.toml` fayli avtomatik ishlatiladi** (allaqachon mavjud)

---

### n8n Service Yaratish

1. Railway Dashboard → **New** → **GitHub Repo**
2. Repository: `idrokaiassistant-wq/TIZIM-AI-MOBIL`
3. Service nomi: `n8n`

**Settings → Source:**
- Root Directory: `n8n`

**Settings → Deploy:**
- Build Command: `pnpm install`
- Start Command: `pnpm start`

**Variables → Environment Variables:**
```env
BACKEND_API_URL=https://backend-production-219b.up.railway.app
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=<sizning-parol>
N8N_HOST=0.0.0.0
N8N_PORT=$PORT
```

**Yoki `railway-n8n.json` fayli ishlatiladi**

---

## 🔗 Service URL'lar

- **Backend**: https://backend-production-219b.up.railway.app
- **Frontend**: https://app-production-e8ad.up.railway.app
- **n8n**: (yaratilgandan keyin ko'rinadi)

---

## ✅ Test

### Backend:
```bash
curl https://backend-production-219b.up.railway.app/health
curl https://backend-production-219b.up.railway.app/docs
```

### Frontend:
Frontend deploy qilingandan keyin:
```
https://app-production-e8ad.up.railway.app
```

### Login:
- Email: `test@example.com`
- Password: `test123456`

---

## 📝 Keyingi Qadamlar

1. ✅ Frontend deploy qilinganini tekshiring
2. ✅ n8n service yarating va deploy qiling
3. ✅ n8n UI'da workflow'larni yarating (n8n-workflows.md'ga qarang)

---

**Barcha kod o'zgarishlari GitHub'ga push qilindi!** 🎉

