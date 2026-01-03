# AI va Algoritmlar Funksiyalari

Bu hujjat backend'ga qo'shilgan AI va algoritmlar funksiyalarini tushuntirib beradi.

## 📦 O'rnatilgan Kutubxonalar

- `scikit-learn` - Machine Learning algoritmlari
- `pandas` - Ma'lumotlar tahlili
- `numpy` - Sonli hisoblar
- `scipy` - Ilmiy hisoblar
- `spacy` - NLP (tabiiy til qayta ishlash)
- `prophet` - Time series bashorat
- `statsmodels` - Statistika va ekonometrika
- `joblib` - Model serialization

## 🤖 AI/ML Servicelar

### 1. Task Priority Service
**Fayl**: `app/services/ai/task_priority_service.py`

Vazifalar prioritetini avtomatik aniqlash:
- Foydalanuvchi tarixiga asoslangan bashorat
- Random Forest model
- Fallback logika (ML ishlamasa)

**API**: `POST /api/ai/tasks/predict-priority`

### 2. Recommendation Service
**Fayl**: `app/services/ai/recommendation_service.py`

Tavsiyalar berish:
- Vazifalar uchun tavsiyalar (kategoriya, muddat, prioritet)
- Odatlar uchun tavsiyalar (streak, muvaffaqiyat)

**API**: 
- `GET /api/ai/recommendations/tasks`
- `GET /api/ai/recommendations/habits`

### 3. Anomaly Detection Service
**Fayl**: `app/services/ai/anomaly_detection_service.py`

Anomaliyalarni aniqlash:
- Xarajatlar anomaliyalari (Isolation Forest)
- Odatlar bajarilishida anomaliyalar

**API**:
- `GET /api/ai/anomalies/expenses`
- `GET /api/ai/anomalies/habits`

### 4. Insights Service
**Fayl**: `app/services/ai/insights_service.py`

Aqlli xulosa generatsiya qilish:
- Kunlik xulosa
- Haftalik xulosa
- Oylik xulosa

**API**:
- `GET /api/ai/insights/daily`
- `GET /api/ai/insights/weekly`
- `GET /api/ai/insights/monthly`

## 📊 Analytics Servicelar

### 1. Time Series Service
**Fayl**: `app/services/analytics/time_series_service.py`

Time series tahlili:
- Produktivlik tendentsiyalari
- Xarajatlar tendentsiyalari
- Prophet bilan bashorat

**API**:
- `GET /api/analytics/trends/productivity`
- `GET /api/analytics/trends/expenses`
- `GET /api/analytics/forecast/productivity`
- `GET /api/analytics/forecast/expenses`

### 2. Trend Analyzer
**Fayl**: `app/services/analytics/trend_analyzer.py`

Trend tahlili:
- Vazifalar bajarilish tendentsiyalari
- Odatlar streak tendentsiyalari
- Xarajatlar kategoriyalari tendentsiyalari

### 3. Statistical Reports
**Fayl**: `app/services/analytics/statistical_reports.py`

Statistika hisobotlari:
- Kategoriyalar bo'yicha taqsimot
- Korrelyatsiya tahlili
- Regression tahlili

**API**:
- `GET /api/analytics/correlation`
- `GET /api/analytics/distribution/{entity_type}`
- `GET /api/analytics/regression`

## ⚙️ Optimization Servicelar

### 1. Task Scheduler
**Fayl**: `app/services/optimization/task_scheduler.py`

Vazifalarni optimal tartibda joylashtirish:
- Priority va deadline bo'yicha saralash
- Vaqt boshqaruvi optimizatsiyasi

**API**:
- `POST /api/optimization/tasks/schedule`
- `POST /api/optimization/tasks/optimize-order`
- `GET /api/optimization/tasks/{task_id}/suggest-timing`

### 2. Budget Optimizer
**Fayl**: `app/services/optimization/budget_optimizer.py`

Byudjet optimizatsiyasi:
- Byudjet taqsimotini tavsiya qilish
- Mavjud byudjetni optimallashtirish

**API**:
- `POST /api/optimization/budget/suggest`
- `POST /api/optimization/budget/{budget_id}/optimize`

## 💬 NLP Servicelar

### 1. Task Parser
**Fayl**: `app/services/nlp/task_parser.py`

Tabiiy til bilan vazifa yaratish:
- Kategoriya avtomatik aniqlash
- Muddat va prioritetni avtomatik aniqlash

**API**: `POST /api/ai/nlp/parse-task`

### 2. Text Classifier
**Fayl**: `app/services/nlp/text_classifier.py`

Matn klassifikatsiyasi:
- Tranzaksiya kategoriyalarini aniqlash
- Sentiment analysis

## 🔄 Background Tasks

**Fayl**: `app/services/background/ai_tasks.py`

Background vazifalar:
- Kunlik xulosa generatsiya qilish
- Model retraining
- Anomaliya tekshiruvi

## 🎯 Model Training

**Fayl**: `scripts/train_models.py`

ML modellarni train qilish:
```bash
python scripts/train_models.py
python scripts/train_models.py --user-id <user_id>
```

## ⚙️ Konfiguratsiya

**Fayl**: `app/config/ai_config.py`

AI sozlamalari:
- Model parametrlari
- Training parametrlari
- Feature engineering sozlamalari

Environment variables:
- `AI_ENABLE_ML` - ML funksiyalarni yoqish/o'chirish
- `AI_ENABLE_NLP` - NLP funksiyalarni yoqish/o'chirish
- `AI_MODEL_DIR` - Model fayllar papkasi

## 📝 Eslatmalar

1. **spaCy model**: Birinchi marta ishlatilganda spaCy modelini yuklash kerak:
   ```bash
   python -m spacy download en_core_web_sm
   ```

2. **Prophet**: Prophet kutubxonasi ba'zi tizimlarda muammo berishi mumkin. Agar muammo bo'lsa, oddiy bashorat ishlatiladi.

3. **Model Training**: Birinchi marta model train qilish uchun yetarli ma'lumotlar kerak (kamida 10-20 bajarilgan vazifalar).

4. **Performance**: ML funksiyalar background task sifatida ishlatilishi tavsiya etiladi.

