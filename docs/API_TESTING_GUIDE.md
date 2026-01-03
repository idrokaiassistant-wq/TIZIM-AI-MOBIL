# API Testing Guide - Swagger UI

Bu qo'llanma Swagger UI'da API endpoint'larni qanday test qilishni ko'rsatadi.

## Swagger UI'ga Kirish

1. Backend server'ni ishga tushiring:
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

2. Browser'da oching: http://127.0.0.1:8000/docs

## Test Qilish Tartibi

### 1. Authentication Test

#### 1.1. Ro'yxatdan O'tish (Register)
- **Endpoint**: `POST /api/auth/register`
- **Body**:
  ```json
  {
    "email": "test@example.com",
    "password": "test123456",
    "full_name": "Test User"
  }
  ```
- **Kutilayotgan natija**: 201 Created, user ma'lumotlari

#### 1.2. Kirish (Login)
- **Endpoint**: `POST /api/auth/login`
- **Body** (Form Data):
  - `username`: `test@example.com`
  - `password`: `test123456`
- **Kutilayotgan natija**: 200 OK, `access_token` va `token_type`

#### 1.3. Token'ni Saqlash
- Login'dan keyin `access_token` ni nusxalang
- Swagger UI'ning yuqori qismidagi **"Authorize"** tugmasini bosing
- Token'ni kiriting: `Bearer <your_token>`
- **"Authorize"** tugmasini bosing

### 2. Tasks API Test

#### 2.1. Vazifa Yaratish
- **Endpoint**: `POST /api/tasks`
- **Body**:
  ```json
  {
    "title": "Test Task",
    "description": "Test description",
    "category": "Ish",
    "priority": "high",
    "status": "pending",
    "is_focus": true,
    "start_time": "10:00",
    "end_time": "11:30",
    "color": "indigo"
  }
  ```
- **Kutilayotgan natija**: 201 Created, yaratilgan vazifa

#### 2.2. Barcha Vazifalarni Olish
- **Endpoint**: `GET /api/tasks`
- **Kutilayotgan natija**: 200 OK, vazifalar ro'yxati

#### 2.3. Vazifani Yangilash
- **Endpoint**: `PUT /api/tasks/{task_id}`
- **Body**:
  ```json
  {
    "status": "done",
    "title": "Updated Task"
  }
  ```
- **Kutilayotgan natija**: 200 OK, yangilangan vazifa

#### 2.4. Vazifani Toggle Qilish
- **Endpoint**: `PATCH /api/tasks/{task_id}/toggle`
- **Kutilayotgan natija**: 200 OK, status o'zgargan vazifa

#### 2.5. Vazifani O'chirish
- **Endpoint**: `DELETE /api/tasks/{task_id}`
- **Kutilayotgan natija**: 204 No Content

### 3. Habits API Test

#### 3.1. Odat Yaratish
- **Endpoint**: `POST /api/habits`
- **Body**:
  ```json
  {
    "title": "Kitob o'qish",
    "goal": "30 min",
    "category": "Salomatlik",
    "icon": "Book",
    "color": "text-blue-500",
    "bg_color": "bg-blue-100"
  }
  ```
- **Kutilayotgan natija**: 201 Created, yaratilgan odat

#### 3.2. Odatni Bajarilgan Deb Belgilash
- **Endpoint**: `POST /api/habits/{habit_id}/complete`
- **Body**:
  ```json
  {
    "completion_date": "2025-01-13",
    "progress": 100,
    "notes": "Done!"
  }
  ```
- **Kutilayotgan natija**: 200 OK, completion ma'lumotlari

#### 3.3. Odat Bajarilish Tarixini Olish
- **Endpoint**: `GET /api/habits/{habit_id}/completions`
- **Kutilayotgan natija**: 200 OK, completion ro'yxati

### 4. Transactions API Test

#### 4.1. Tranzaksiya Yaratish
- **Endpoint**: `POST /api/transactions`
- **Body**:
  ```json
  {
    "title": "Korzinka",
    "category": "Oziq-ovqat",
    "amount": 125500,
    "transaction_type": "expense",
    "transaction_date": "2025-01-13",
    "icon": "ShoppingBag",
    "color": "bg-orange-100 text-orange-600"
  }
  ```
- **Kutilayotgan natija**: 201 Created, yaratilgan tranzaksiya

#### 4.2. Tranzaksiya Statistika
- **Endpoint**: `GET /api/transactions/stats/summary`
- **Kutilayotgan natija**: 200 OK, statistika ma'lumotlari

### 5. Database Tekshirish

#### 5.1. Database Fayl
- Database fayl: `backend/tizim_ai.db`
- SQLite database avtomatik yaratiladi birinchi request'da

#### 5.2. Seed Data
- Default kategoriyalar avtomatik yuklanadi
- 8 ta default kategoriya:
  - Tasks: Ish, Shaxsiy, O'qish
  - Transactions: Oziq-ovqat, Transport, Maosh
  - Habits: Salomatlik, Sport

## Xatolarni Tekshirish

### 401 Unauthorized
- Token'ni tekshiring
- "Authorize" tugmasini bosing va token'ni qayta kiriting

### 404 Not Found
- Resource ID'ni tekshiring
- Resource mavjudligini tekshiring

### 400 Bad Request
- Request body'ni tekshiring
- Required field'larni tekshiring

## Frontend Integratsiya

Frontend store API bilan integratsiya qilingan. `src/lib/store.ts` faylida:

- `fetchTasks()` - Vazifalarni API'dan olish
- `addTask()` - Yangi vazifa yaratish
- `updateTask()` - Vazifani yangilash
- `deleteTask()` - Vazifani o'chirish
- `toggleTask()` - Vazifa status'ini o'zgartirish

Xuddi shu pattern habits va transactions uchun ham mavjud.

## Keyingi Qadamlar

1. Frontend komponentlarni yangilash (API bilan ishlash uchun)
2. Error handling yaxshilash
3. Loading states qo'shish
4. Offline support (keyinchalik)


