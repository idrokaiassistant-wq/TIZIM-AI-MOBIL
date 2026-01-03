# n8n Service Tez Yaratish - Qadam-baqadam

## ⚠️ Muhim: Service Tanlash Emas, Yangi Service Yaratish!

Modal oynada "n8n" yozib topilmayapti, chunki **n8n service hali yaratilmagan**.

## ✅ To'g'ri Yo'l:

### Qadam 1: Create Tugmasini Bosing

1. Railway Dashboard'da (sahifaning yuqori o'ng burchagida) **"Create"** tugmasini bosing
   - Yoki **"New"** tugmasini bosing (service'lar ro'yxati yonida)

### Qadam 2: GitHub Repo Tanlang

1. Modal oynada **"GitHub Repo"** ni tanlang
2. Repository ro'yxatidan **`idrokaiassistant-wq/TIZIM-AI-MOBIL`** ni tanlang
3. **"Deploy"** yoki **"Add Service"** tugmasini bosing

### Qadam 3: Service Nomini O'zgartiring

1. Yangi service yaratilgandan keyin, service nomiga bosing
2. Yoki **Settings** → Service nomini **"n8n"** ga o'zgartiring

### Qadam 4: Root Directory Sozlang

1. **Settings** → **Source** bo'limiga kiring
2. **Root Directory** maydoniga: **`n8n`** yozing
3. **Update** tugmasini bosing

### Qadam 5: Build va Start Command

**Settings** → **Deploy** bo'limiga kiring:

- **Build Command**: `pnpm install`
- **Start Command**: `pnpm start`

### Qadam 6: Environment Variables

**Variables** bo'limiga kiring va qo'shing:

```
BACKEND_API_URL=https://backend-production-219b.up.railway.app
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=<xavfsiz-parol>
N8N_HOST=0.0.0.0
N8N_PORT=$PORT
```

---

## 📸 Screenshot Yo'riqnomasi

1. **"Create"** tugmasi → **"GitHub Repo"**
2. Repository tanlang → **"Deploy"**
3. Service nomini **"n8n"** ga o'zgartiring
4. **Settings** → **Source** → Root Directory: **`n8n`**
5. **Settings** → **Deploy** → Build/Start command'lar
6. **Variables** → Environment variables qo'shing

---

## ❌ Noto'g'ri Yo'l:

- ❌ Modal oynada "Select a service" dan "n8n" yozish (chunki service hali yo'q)
- ❌ Mavjud service'ni o'zgartirish (yangi service kerak)

---

## ✅ To'g'ri Yo'l:

- ✅ "Create" → "GitHub Repo" → Repository tanlang → Yangi service yaratiladi
- ✅ Keyin service nomini va sozlamalarni o'zgartiring

---

**Batafsil**: [docs/N8N_SERVICE_SETUP.md](docs/N8N_SERVICE_SETUP.md)

