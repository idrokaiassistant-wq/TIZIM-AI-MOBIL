# Tizim AI - MVP Hujjatlar

Bu papka Tizim AI loyihasining MVP (Minimum Viable Product) hujjatlarini o'z ichiga oladi.

---

## 📚 Hujjatlar Ro'yxati

### 1. [MVP Ma'lumotlar Bazasi Strukturasi](./MVP_DATABASE_SCHEMA.md)
To'liq ma'lumotlar bazasi strukturasini o'z ichiga oladi:
- Barcha jadvallar (users, tasks, habits, transactions, va h.k.)
- Triggerlar va viewlar
- Indexlar va migratsiyalar
- Seed ma'lumotlar

**Qachon qo'llash kerak**: Backend qurishdan oldin

---

### 2. [Xato Kamchiliklar Ro'yxati](./BUGS_AND_ISSUES.md)
Barcha aniqlangan xato va kamchiliklarni o'z ichiga oladi:
- P0 (Kritik) - 4 ta
- P1 (Muhim) - 6 ta
- P2 (O'rtacha) - 10 ta
- P3 (Kichik) - 10 ta

**Jami**: 30 ta muammo

**Qachon qo'llash kerak**: Har bir sprintda prioritet bo'yicha

---

### 3. [Funksiyalar va Jadval](./FEATURES_AND_FUNCTIONS.md)
Excel fayllardagi talablar asosida tuzilgan funksiyalar:
- Vazifalar Planneri - 25 ta funksiya (5 ta mavjud)
- Odatlar Planneri - 19 ta funksiya (4 ta mavjud)
- Produktivlik Planneri - 15 ta funksiya (0 ta mavjud)
- Financial Plan - 29 ta funksiya (4 ta mavjud)
- Bugun Focus - 14 ta funksiya (4 ta mavjud)
- Dashboard - 14 ta funksiya (4 ta mavjud)
- Umumiy Funksiyalar - 20 ta funksiya (0 ta mavjud)

**Jami**: 136 ta funksiya (21 ta mavjud, 115 ta qo'shilishi kerak)

**Qachon qo'llash kerak**: Feature planning vaqti

---

### 4. [Amalga Oshirish Rejasi](./IMPLEMENTATION_ROADMAP.md)
MVP ni amalga oshirish uchun batafsil reja:
- Faza 1: Asosiy Infrastruktura (2-3 hafta)
- Faza 2: Frontend Integratsiya (1-2 hafta)
- Faza 3: Qo'shimcha Funksiyalar (2-3 hafta)
- Faza 4: Yaxshilashlar (1-2 hafta)

**Jami**: 46 ta vazifa

**Qachon qo'llash kerak**: Loyiha boshida

---

## 🎯 Tezkor Boshlash

### 1. Ma'lumotlar Bazasini O'rnatish
```bash
# PostgreSQL o'rnatish (yoki SQLite)
# Keyin schema faylini ishga tushirish
psql -U postgres -d tizim_ai -f docs/MVP_DATABASE_SCHEMA.md
```

### 2. Backend API Qurish
```bash
# Backend loyihasini yaratish
# API endpoint'larni qo'shish
# Autentifikatsiyani sozlash
```

### 3. Frontend Integratsiya
```bash
# API client yaratish
# Store'ni yangilash
# Komponentlarni yangilash
```

---

## 📊 Progress Tracking

### Hozirgi Holat
- ✅ Frontend UI
- ✅ Asosiy komponentlar
- ❌ Backend API
- ❌ Ma'lumotlar bazasi
- ❌ Autentifikatsiya
- ❌ To'liq CRUD

### Keyingi Qadamlar
1. Backend texnologiyasini tanlash
2. Database provider tanlash
3. Faza 1 ni boshlash

---

## 🔗 Foydali Linklar

- [Database Schema](./MVP_DATABASE_SCHEMA.md)
- [Bugs & Issues](./BUGS_AND_ISSUES.md)
- [Features & Functions](./FEATURES_AND_FUNCTIONS.md)
- [Implementation Roadmap](./IMPLEMENTATION_ROADMAP.md)

---

## 📝 Eslatmalar

1. Barcha hujjatlar Excel fayllardagi talablar asosida tuzilgan
2. MVP uchun Faza 1 va Faza 2 majburiy
3. Har bir o'zgarishdan keyin hujjatlarni yangilash kerak
4. Har bir sprintda progress tracking qilish kerak

---

## 👥 Muallif

Tizim AI Development Team

---

## 📅 Yangilanish Sana

2025-01-13

