from typing import Dict, List
from app.config.ai_config import ai_config

try:
    import spacy
    SPACY_AVAILABLE = True
    try:
        nlp_model = spacy.load(ai_config.nlp_model)
    except OSError:
        SPACY_AVAILABLE = False
        nlp_model = None
except ImportError:
    SPACY_AVAILABLE = False
    nlp_model = None


class TextClassifier:
    """Matn klassifikatsiyasi servisi"""
    
    def __init__(self):
        self.nlp = nlp_model if SPACY_AVAILABLE else None
        
        # Tranzaksiya kategoriya kalit so'zlari
        self.transaction_categories = {
            "Oziq-ovqat": ["oziq", "ovqat", "food", "restaurant", "cafe", "taom", "non", "sut"],
            "Transport": ["transport", "taxi", "metro", "avtobus", "bus", "yo'l", "yolovchi"],
            "Maosh": ["maosh", "salary", "ish haqi", "daromad", "income"],
            "Kiyim": ["kiyim", "clothes", "dress", "shoes", "oyoq kiyim"],
            "Uy": ["uy", "house", "kvartira", "rent", "ijara", "kommunal"],
            "Telefon": ["telefon", "phone", "internet", "aloqa", "communication"],
            "Sog'liq": ["sog'liq", "health", "doktor", "doctor", "shifoxona", "hospital"],
            "Ta'lim": ["ta'lim", "education", "maktab", "school", "universitet", "university"]
        }
    
    def classify_transaction(
        self,
        description: str,
        title: str = ""
    ) -> str:
        """Tranzaksiya tavsifini kategoriyaga ajratish"""
        text = f"{title} {description}".lower()
        
        # Kategoriya kalit so'zlari bo'yicha tekshirish
        category_scores = {}
        for category, keywords in self.transaction_categories.items():
            score = sum(1 for keyword in keywords if keyword in text)
            if score > 0:
                category_scores[category] = score
        
        if category_scores:
            return max(category_scores.items(), key=lambda x: x[1])[0]
        
        # NLP bilan (agar mavjud bo'lsa)
        if self.nlp:
            try:
                doc = self.nlp(text)
                # Noun va proper noun so'zlarni tekshirish
                for token in doc:
                    if token.pos_ in ["NOUN", "PROPN"]:
                        for category, keywords in self.transaction_categories.items():
                            if token.text.lower() in keywords:
                                return category
            except Exception:
                pass
        
        return "Boshqa"  # Default kategoriya
    
    def analyze_sentiment(
        self,
        text: str
    ) -> Dict:
        """Sentiment analysis (kayfiyat tahlili)"""
        # Oddiy sentiment analysis (keyinchalik yaxshilash mumkin)
        positive_words = ["yaxshi", "ajoyib", "zo'r", "a'lo", "muvaffaqiyatli", "good", "great", "excellent"]
        negative_words = ["yomon", "yaxshi emas", "qoniqarsiz", "bad", "terrible", "awful"]
        
        text_lower = text.lower()
        
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
        if positive_count > negative_count:
            sentiment = "positive"
            score = min(0.5 + (positive_count * 0.1), 1.0)
        elif negative_count > positive_count:
            sentiment = "negative"
            score = max(0.0, 0.5 - (negative_count * 0.1))
        else:
            sentiment = "neutral"
            score = 0.5
        
        return {
            "sentiment": sentiment,
            "score": round(score, 2),
            "confidence": "low"  # Oddiy versiya uchun
        }

