# Frontend Root Directory Tuzatish

## Muammo

Frontend service'da Root Directory `/android/app` ga o'rnatilgan, bu noto'g'ri. Bu tufayli:
- Railpack builder npm topa olmayapti
- Build jarayoni muvaffaqiyatsiz bo'ladi
- Frontend deploy qilinmaydi

## Yechim

### Qadam 1: Railway Dashboard'da Root Directory O'zgartirish

1. Railway Dashboard'ga kiring: https://railway.app/dashboard
2. Project → **app** service'ni tanlang
3. **Settings** → **Source** bo'limiga kiring
4. **Root Directory** maydonini toping
5. Hozirgi qiymat: `/android/app`
6. Yangi qiymat: `/` (yoki bo'sh qoldirish - default)
7. **Update** tugmasini bosing

### Qadam 2: Build va Start Command Tekshirish

**Settings** → **Deploy** bo'limida quyidagilar bo'lishi kerak:

- **Build Command**: `npm ci --legacy-peer-deps && npm run build`
- **Start Command**: `npx serve -s dist -l $PORT`

Agar bular to'g'ri bo'lmasa, o'zgartiring.

### Qadam 3: Redeploy

1. **Deployments** bo'limiga kiring
2. **Redeploy** tugmasini bosing
3. Build jarayonini kuzatib turing

## Tekshirish

Deploy muvaffaqiyatli bo'lgandan keyin:

```bash
curl https://app-production-e8ad.up.railway.app
```

Frontend ishlayotganini ko'rish kerak.

## Qo'shimcha Ma'lumot

- Root Directory `/` bo'lishi kerak, chunki `package.json` va `vite.config.ts` loyiha ildizida joylashgan
- `/android/app` papkasi faqat Android build uchun, Railway deploy uchun emas
- `nixpacks.toml` va `railway-frontend.json` fayllari avtomatik ishlatiladi

## Muammo Davom Etsa

Agar muammo davom etsa:

1. Service'ni o'chirib, qayta yarating
2. Root Directory `/` ga o'rnating
3. Build va Start command'larni to'g'ri sozlang
4. Environment variable `VITE_API_URL` mavjudligini tekshiring

