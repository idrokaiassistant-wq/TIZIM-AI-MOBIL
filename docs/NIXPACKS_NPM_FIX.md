# Nixpacks npm Undefined Variable Xatosi - Hal Qilish

## Muammo

Frontend build paytida quyidagi xato:

```
error: undefined variable 'npm'
at /app/.nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix:19:19:
  18|         '')
  19|         nodejs_18 npm
            |                   ^
  20|       ];
```

## Sabab

`nixpacks.toml` faylida `npm` alohida paket sifatida ko'rsatilgan:
```toml
[phases.setup]
nixPkgs = ["nodejs_18", "npm"]  # ❌ Noto'g'ri
```

Lekin Nixpacks `npm` ni topa olmayapti, chunki `nodejs_18` paketiga `npm` allaqachon kiritilgan.

## Yechim

`nixpacks.toml` faylida `npm` ni olib tashlash:

```toml
[phases.setup]
nixPkgs = ["nodejs_18"]  # ✅ To'g'ri - nodejs_18 npm ni o'z ichiga oladi
```

## To'liq `nixpacks.toml` Misoli

```toml
[phases.setup]
nixPkgs = ["nodejs_18"]

[phases.install]
cmds = ["npm ci --legacy-peer-deps"]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "npx serve -s dist -l ${PORT:-3000}"

[staticAssets]
"dist" = "/"
```

## Qadamlar

1. `nixpacks.toml` faylida `npm` ni olib tashlash
2. GitHub'ga push qilish
3. Railway dashboard'da frontend service'ni redeploy qilish
4. Build natijasini tekshirish

## Tekshirish

Deploy muvaffaqiyatli bo'lgandan keyin:
- Build loglarida npm xatosi bo'lmasligi kerak
- Frontend muvaffaqiyatli build qilinishi kerak
- Service ishga tushishi kerak

---

**Eslatma**: `nodejs_18` paketi npm, npx va boshqa Node.js toolchain'ni o'z ichiga oladi, shuning uchun alohida ko'rsatilmasligi kerak.

