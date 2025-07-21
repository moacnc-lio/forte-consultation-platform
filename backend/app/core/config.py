from pydantic_settings import BaseSettings
from typing import List
import os
from dotenv import load_dotenv

# 환경별 .env 파일 로드
env = os.getenv("APP_ENV", "development")
env_file = f".env.{env}"

# 환경 파일이 존재하는지 확인하고 로드
if os.path.exists(env_file):
    load_dotenv(env_file)
else:
    load_dotenv()  # 기본 .env 파일 로드

class Settings(BaseSettings):
    # 애플리케이션 기본 설정
    APP_NAME: str = os.getenv("APP_NAME", "Forte Consultation Platform")
    APP_VERSION: str = os.getenv("APP_VERSION", "1.0.0")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    APP_ENV: str = os.getenv("APP_ENV", "development")
    
    # 데이터베이스 설정
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://forte:forte123@localhost:5432/forte_db")
    
    # JWT 설정
    SECRET_KEY: str = os.getenv("SECRET_KEY", "forte-secret-key-change-in-production")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    
    # Google Gemini API 설정
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # CORS 설정 (환경별)
    @property
    def ALLOWED_ORIGINS(self) -> List[str]:
        origins_str = os.getenv("ALLOWED_ORIGINS", "")
        if origins_str:
            return [origin.strip() for origin in origins_str.split(",")]
        
        # 기본값 (개발 환경)
        if self.APP_ENV == "production":
            return []  # 실서버에서는 명시적으로 설정
        else:
            return [
                "http://localhost:3000",  # React 개발 서버
                "http://localhost:5173",  # Vite 개발 서버
            ]
    
    # GCP 설정
    GCP_PROJECT_ID: str = os.getenv("GCP_PROJECT_ID", "forte-consultation-platform")
    GCP_REGION: str = os.getenv("GCP_REGION", "asia-northeast1")
    
    # 환경별 로깅 설정
    @property
    def LOG_LEVEL(self) -> str:
        return "DEBUG" if self.DEBUG else "INFO"
    
    class Config:
        case_sensitive = True

settings = Settings()