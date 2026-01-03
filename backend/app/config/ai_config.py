from pydantic_settings import BaseSettings
from typing import Optional


class AIConfig(BaseSettings):
    """AI va Machine Learning konfiguratsiyasi"""
    
    # Model parametrlari
    model_dir: str = "backend/models"
    enable_ml: bool = True
    enable_nlp: bool = True
    
    # Task Priority Model
    task_priority_model_path: str = "backend/models/task_priority_model.joblib"
    task_priority_retrain_days: int = 7
    
    # Recommendation Engine
    recommendation_top_k: int = 5
    recommendation_min_similarity: float = 0.3
    
    # Anomaly Detection
    anomaly_contamination: float = 0.1  # 10% anomaliya kutilmoqda
    anomaly_threshold: float = 0.5
    
    # NLP
    nlp_model: str = "en_core_web_sm"  # spaCy model
    nlp_confidence_threshold: float = 0.7
    
    # Time Series
    forecast_days: int = 30
    time_series_seasonality: str = "multiplicative"
    
    # Caching
    cache_ttl_seconds: int = 3600  # 1 soat
    enable_caching: bool = True
    
    # Performance
    max_features: int = 50
    batch_size: int = 32
    
    class Config:
        env_file = ".env"
        env_prefix = "AI_"
        case_sensitive = False


ai_config = AIConfig()

