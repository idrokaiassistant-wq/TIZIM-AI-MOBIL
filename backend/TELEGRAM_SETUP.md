# Telegram Bot Setup

Telegram Bot orqali autentifikatsiya uchun quyidagi qadamlarni bajaring:

## 1. Telegram Bot Yaratish

1. Telegram'da [@BotFather](https://t.me/BotFather) bot'iga kiring
2. `/newbot` buyrug'ini yuboring
3. Bot uchun nom va username tanlang
4. BotFather sizga token beradi (masalan: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

## 2. Token'ni Sozlash

### Local Development (.env faylida):

1. `backend/` papkasida `.env` faylini yarating (agar mavjud bo'lmasa):
```bash
cp env.example .env
```

2. `.env` faylida `TELEGRAM_BOT_TOKEN` ni o'z token'ingiz bilan almashtiring:
```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
```

### Production (Railway yoki boshqa platform):

Environment variable sifatida qo'shing:
```bash
TELEGRAM_BOT_TOKEN=your-token-here
```

## 3. Telegram Bot'ni Ishlatish

**Muhim eslatma:** Hozirgi implementatsiyada kod log qilinadi (development uchun). Production'da quyidagilardan birini tanlang:

### Variant 1: Telegram Login Widget (Tavsiya etiladi)
- Web ilova uchun eng oson yechim
- Foydalanuvchi Telegram'da avtorizatsiya qiladi
- Token'ni web ilovaga o'tkazadi

### Variant 2: Telegram Bot API (Murakkabroq)
- Foydalanuvchi bot'ga telefon raqamini yuboradi
- Bot foydalanuvchiga kod yuboradi
- Foydalanuvchi kodni web'ga kiradi

**Hozirgi holat:** Kod log qilinadi. Production uchun `telegram_service.py` faylida `send_telegram_message` funksiyasini to'ldiring.

## 4. Test Qilish

1. Backend server'ni ishga tushiring:
```bash
cd backend
uvicorn app.main:app --reload
```

2. Frontend'da Telegram login'ni tanlang
3. Telefon raqamini kiriting
4. Backend log'larida kod ko'rinadi (development)

## Qo'shimcha Sozlamalar

`.env` faylida quyidagi sozlamalarni o'zgartirish mumkin:

- `TELEGRAM_CODE_EXPIRE_MINUTES=10` - Kod necha daqiqadan keyin eskiradi (default: 10)
- `TELEGRAM_CODE_ATTEMPTS=3` - Kodni necha marta noto'g'ri kiritish mumkin (default: 3)
- `TELEGRAM_CODE_RATE_LIMIT_MINUTES=1` - Necha daqiqada 1 marta kod yuborish mumkin (default: 1)

