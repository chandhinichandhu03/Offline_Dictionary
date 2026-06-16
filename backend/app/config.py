import os

SECRET_KEY = os.getenv("SECRET_KEY", "lexilearn-super-secret-key-change-in-production-2024")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'lexilearn.db')}"
DATASETS_DIR = os.path.join(BASE_DIR, "datasets")
ML_MODELS_DIR = os.path.join(BASE_DIR, "ml_models")

os.makedirs(ML_MODELS_DIR, exist_ok=True)
