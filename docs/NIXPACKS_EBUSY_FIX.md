# Nixpacks EBUSY Cache Xatosi - Hal Qilish

## Muammo

Frontend build paytida quyidagi xato:

```
npm error EBUSY: resource busy or locked, rmdir '/app/node_modules/.cache'
npm error A complete log of this run can be found in: /root/.npm/_logs/...
```

## Sabab

Nixpacks ikkita `npm ci` jarayonini ishlatmoqda:
1. **Install phase** (`nixpacks.toml`): `npm ci --legacy-peer-deps` ✅
2. **Build phase** (Dashboard yoki config): `npm ci --legacy-peer-deps && npm run build` ❌

Build phase'da `npm ci` qayta ishga tushadi va cache mount (`/app/node_modules/.cache`) bilan conflict yuzaga keladi.

## Yechim

Build command'da `npm ci` ni olib tashlash. Railway avtomatik install phase'ni ishlatadi (`nixpacks.toml` da `[phases.install]`), shuning uchun build command'da install kerak emas.

### Qadam 1: Railway Dashboard'da Build Command O'zgartirish

1. Railway Dashboard → Frontend service → **Settings** → **Build**
2. **Build Command** maydoniga kiring
3. Hozirgi: `npm ci --legacy-peer-deps && npm run build`
4. Yangi: `npm run build`
5. **Save** tugmasini bosing

### Qadam 2: Pre-deploy Command O'chirish

1. **Settings** → **Deploy** bo'limiga kiring
2. **Pre-deploy Command** maydoniga kiring
3. `npm run migrate` ni olib tashlang (yoki bo'sh qoldiring)
4. **Save** tugmasini bosing

**Eslatma**: `npm run migrate` backend uchun, frontend uchun kerak emas.

### Qadam 3: railway-frontend.json (Agar ishlatilayotgan bo'lsa)

Agar service'da config file ishlatilayotgan bo'lsa:

```json
{
  "build": {
    "buildCommand": "npm run build"
  }
}
```

## To'liq nixpacks.toml Misoli

```toml
[phases.setup]
nixPkgs = ["nodejs_18"]

[phases.install]
cmds = ["npm ci --legacy-peer-deps"]

[phases.build]
cmds = ["npm run build"]  # npm ci kerak emas - install phase'da allaqachon qilingan

[start]
cmd = "npx serve -s dist -l ${PORT:-3000}"

[staticAssets]
"dist" = "/"
```

## Qadamlar

1. ✅ Dashboard'da Build Command: `npm ci --legacy-peer-deps && npm run build` → `npm run build`
2. ✅ Pre-deploy Command: `npm run migrate` → (bo'sh)
3. ✅ Redeploy qiling
4. ✅ Build natijasini tekshiring

## Tekshirish

Deploy muvaffaqiyatli bo'lgandan keyin:
- Build loglarida EBUSY xatosi bo'lmasligi kerak
- Frontend muvaffaqiyatli build qilinishi kerak
- Service ishga tushishi kerak

---

**Batafsil**: [docs/RAILWAY_FIX.md](docs/RAILWAY_FIX.md)

