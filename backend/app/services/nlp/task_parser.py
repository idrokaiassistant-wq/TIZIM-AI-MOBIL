from typing import Dict, Optional
import re
from datetime import datetime, timedelta
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


class TaskParser:
    """Tabiiy til bilan vazifa yaratish parser"""
    
    def __init__(self):
        self.nlp = nlp_model if SPACY_AVAILABLE else None
        
        # Kategoriya kalit so'zlari
        self.category_keywords = {
            "Ish": ["ish", "work", "job", "meeting", "meeting", "loyiha", "project"],
            "Shaxsiy": ["shaxsiy", "personal", "o'zim", "myself"],
            "O'qish": ["o'qish", "read", "kitob", "book", "study", "o'quv"],
            "Salomatlik": ["salomatlik", "health", "sog'liq", "doktor", "doctor"],
            "Sport": ["sport", "jismoniy", "physical", "mashq", "exercise"]
        }
        
        # Prioritet kalit so'zlari
        self.priority_keywords = {
            "high": ["muhim", "important", "urgent", "shoshilinch", "zarur", "critical"],
            "medium": ["o'rta", "medium", "normal"],
            "low": ["past", "low", "kam", "keyinroq", "later"]
        }
    
    def parse_task_text(
        self,
        text: str
    ) -> Dict:
        """Matnni tahlil qilib vazifa ma'lumotlarini ajratish"""
        result = {
            "title": text,
            "category": "Ish",
            "priority": "medium",
            "due_date": None,
            "description": None
        }
        
        # Title ajratish (birinchi jumla)
        sentences = re.split(r'[.!?]\s+', text)
        if sentences:
            result["title"] = sentences[0].strip()
            if len(sentences) > 1:
                result["description"] = " ".join(sentences[1:]).strip()
        
        # Kategoriya aniqlash
        result["category"] = self._extract_category(text)
        
        # Prioritet aniqlash
        result["priority"] = self._extract_priority(text)
        
        # Muddat aniqlash
        result["due_date"] = self._extract_due_date(text)
        
        return result
    
    def _extract_category(self, text: str) -> str:
        """Kategoriyani ajratish"""
        text_lower = text.lower()
        
        # Kategoriya kalit so'zlari bo'yicha tekshirish
        category_scores = {}
        for category, keywords in self.category_keywords.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            if score > 0:
                category_scores[category] = score
        
        if category_scores:
            return max(category_scores.items(), key=lambda x: x[1])[0]
        
        # NLP bilan (agar mavjud bo'lsa)
        if self.nlp:
            try:
                doc = self.nlp(text)
                # Oddiy kategoriya aniqlash (keyinchalik yaxshilash mumkin)
                for token in doc:
                    if token.pos_ == "NOUN":
                        # Kategoriya kalit so'zlari bilan solishtirish
                        for category, keywords in self.category_keywords.items():
                            if token.text.lower() in keywords:
                                return category
            except Exception:
                pass
        
        return "Ish"  # Default
    
    def _extract_priority(self, text: str) -> str:
        """Prioritetni ajratish"""
        text_lower = text.lower()
        
        # Prioritet kalit so'zlari
        for priority, keywords in self.priority_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                return priority
        
        # Muddatga asoslangan prioritet
        due_date = self._extract_due_date(text)
        if due_date:
            days_until = (due_date.date() - datetime.now().date()).days
            if days_until < 1:
                return "high"
            elif days_until < 3:
                return "medium"
        
        return "medium"  # Default
    
    def _extract_due_date(self, text: str) -> Optional[datetime]:
        """Muddatni ajratish"""
        text_lower = text.lower()
        today = datetime.now()
        
        # "Bugun", "ertaga" kabi so'zlar
        if "bugun" in text_lower or "today" in text_lower:
            return today
        
        if "ertaga" in text_lower or "tomorrow" in text_lower:
            return today + timedelta(days=1)
        
        # "X kun keyin"
        match = re.search(r'(\d+)\s*(kun|day|days)\s*(keyin|later|after)', text_lower)
        if match:
            days = int(match.group(1))
            return today + timedelta(days=days)
        
        # "X hafta keyin"
        match = re.search(r'(\d+)\s*(hafta|week|weeks)\s*(keyin|later|after)', text_lower)
        if match:
            weeks = int(match.group(1))
            return today + timedelta(weeks=weeks)
        
        # Sana formatlari (DD.MM.YYYY, YYYY-MM-DD)
        date_patterns = [
            r'(\d{1,2})\.(\d{1,2})\.(\d{4})',  # DD.MM.YYYY
            r'(\d{4})-(\d{1,2})-(\d{1,2})',  # YYYY-MM-DD
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, text)
            if match:
                try:
                    if '.' in match.group(0):
                        day, month, year = map(int, match.groups())
                        return datetime(year, month, day)
                    else:
                        year, month, day = map(int, match.groups())
                        return datetime(year, month, day)
                except ValueError:
                    continue
        
        return None

