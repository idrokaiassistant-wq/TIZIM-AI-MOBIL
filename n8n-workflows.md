# n8n Workflows - Tizim AI Automation

Bu hujjat Tizim AI dasturi uchun n8n workflow'larini tushuntirib beradi.

## 📋 Workflow'lar Ro'yxati

### 1. Kunlik Xulosa Email (Daily Summary)

**Maqsad**: Har kuni ertalab foydalanuvchiga kunlik xulosa email jo'natish

**Trigger**: Schedule (Har kuni ertalab 8:00)

**Steplar**:
1. HTTP Request → Backend API `/api/ai/insights/daily`
2. Data Transform → Email uchun formatlash
3. Email → Foydalanuvchiga jo'natish

**n8n Nodes**:
- Schedule Trigger
- HTTP Request
- Function (Data Transform)
- Email (SMTP)

**API Endpoints**:
```
GET /api/ai/insights/daily
GET /api/tasks?status=completed&date=today
GET /api/habits?date=today
```

---

### 2. Vazifa Eslatmalari (Task Reminders)

**Maqsad**: Muddati yaqinlashayotgan vazifalarni eslatish

**Trigger**: Schedule (Har soat)

**Steplar**:
1. HTTP Request → `/api/tasks?status=pending&due_soon=true`
2. Filter → Muddat 24 soat ichida bo'lgan vazifalar
3. Telegram → Bot orqali eslatma jo'natish

**n8n Nodes**:
- Schedule Trigger
- HTTP Request
- IF Node (Filter)
- Telegram Bot

**API Endpoints**:
```
GET /api/tasks?status=pending&deadline_soon=true
```

---

### 3. Byudjet Ogohlantirishlari (Budget Alerts)

**Maqsad**: Byudjet chegarasiga yaqinlashganda ogohlantirish

**Trigger**: Schedule (Kunlik, kechqurun)

**Steplar**:
1. HTTP Request → `/api/budgets`
2. HTTP Request → `/api/transactions/stats/summary`
3. Function → Byudjet va xarajatlarni solishtirish
4. IF → Byudjet 80%+ ishlatilgan bo'lsa
5. Telegram/Email → Ogohlantirish jo'natish

**n8n Nodes**:
- Schedule Trigger
- HTTP Request (x2)
- Function
- IF Node
- Telegram/Email

**API Endpoints**:
```
GET /api/budgets
GET /api/transactions/stats/summary
```

---

### 4. Odatlar Streak Tracking (Habit Streak Monitoring)

**Maqsad**: Odatlar streak'larini kuzatish va motivatsiya berish

**Trigger**: Schedule (Har kuni kechqurun)

**Steplar**:
1. HTTP Request → `/api/habits`
2. Function → Streak'larni tekshirish
3. IF → Streak 7+, 30+, 100+ bo'lsa
4. Telegram → Tabrik xabari

**n8n Nodes**:
- Schedule Trigger
- HTTP Request
- Function
- IF Node
- Telegram Bot

**API Endpoints**:
```
GET /api/habits
GET /api/habits/{id}/completions
```

---

### 5. Haftalik Hisobotlar (Weekly Reports)

**Maqsad**: Har hafta oxirida haftalik hisobot tayyorlash

**Trigger**: Schedule (Har yakshanba kechqurun)

**Steplar**:
1. HTTP Request → `/api/ai/insights/weekly`
2. HTTP Request → `/api/analytics/trends/productivity`
3. Function → Hisobot formatlash
4. Email → Haftalik hisobot jo'natish

**n8n Nodes**:
- Schedule Trigger
- HTTP Request (x2)
- Function
- Email

**API Endpoints**:
```
GET /api/ai/insights/weekly
GET /api/analytics/trends/productivity
GET /api/analytics/trends/expenses
```

---

### 6. Anomaliya Xabarnomalari (Anomaly Alerts)

**Maqsad**: Xarajatlar yoki odatlarda anomaliya aniqlanganda xabar berish

**Trigger**: Schedule (Kunlik)

**Steplar**:
1. HTTP Request → `/api/ai/anomalies/expenses`
2. HTTP Request → `/api/ai/anomalies/habits`
3. IF → Anomaliya topilgan bo'lsa
4. Telegram → Xabarnoma

**n8n Nodes**:
- Schedule Trigger
- HTTP Request (x2)
- IF Node
- Telegram Bot

**API Endpoints**:
```
GET /api/ai/anomalies/expenses
GET /api/ai/anomalies/habits
```

---

### 7. Telegram Bot Commands

**Maqsad**: Telegram orqali tezkor ma'lumot olish

**Trigger**: Telegram Command

**Commands**:
- `/tasks` - Bugungi vazifalar
- `/habits` - Bugungi odatlar
- `/stats` - Bugungi statistika
- `/budget` - Byudjet holati

**n8n Nodes**:
- Telegram Trigger
- Switch (Command routing)
- HTTP Request (x4)
- Telegram Reply

---

## 🔧 n8n Setup

### 1. n8n o'rnatish

```bash
cd n8n
pnpm install
pnpm dev
```

### 2. Environment Variables

n8n `.env` fayliga quyidagilarni qo'shing:

```env
# Backend API
BACKEND_API_URL=https://your-backend.railway.app
BACKEND_API_TOKEN=your-api-token-if-needed

# Telegram Bot
TELEGRAM_BOT_TOKEN=your-telegram-bot-token

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com

# n8n
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=your-password
```

### 3. Workflow Import

Har bir workflow'ni n8n UI'da import qiling yoki JSON fayl sifatida saqlang.

---

## 📊 API Authentication

Backend API'ga murojaat qilish uchun JWT token kerak:

1. Login endpoint'dan token olish:
```
POST /api/auth/login
Body: username=test@example.com&password=test123456
```

2. Har bir request'da header'da token jo'natish:
```
Authorization: Bearer <token>
```

n8n'da HTTP Request node'da:
- Authentication: Generic Credential Type
- Name: Bearer Token
- Token: {{ $env.BACKEND_API_TOKEN }}

---

## 🚀 Railway Deployment

### n8n Service Railway'da

1. Railway'da yangi service yarating
2. Repository'ni connect qiling (n8n papkasi)
3. Build Command: `cd n8n && pnpm install`
4. Start Command: `cd n8n && pnpm start`
5. Environment variables qo'shing
6. Port: 5678 (default n8n port)

### Docker Compose (Alternative)

```yaml
services:
  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
      - BACKEND_API_URL=${BACKEND_API_URL}
    volumes:
      - n8n_data:/home/node/.n8n
```

---

## 📝 Workflow Template JSON

Har bir workflow JSON formatida saqlanadi. Masalan:

```json
{
  "name": "Daily Summary Email",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "cronExpression",
              "expression": "0 8 * * *"
            }
          ]
        }
      },
      "type": "n8n-nodes-base.scheduleTrigger"
    }
  ]
}
```

---

## 🔗 Foydali Linklar

- [n8n Documentation](https://docs.n8n.io)
- [n8n HTTP Request Node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/)
- [n8n Schedule Trigger](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.scheduletrigger/)
- [Telegram Bot API](https://core.telegram.org/bots/api)

