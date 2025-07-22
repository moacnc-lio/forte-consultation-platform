from pydantic_settings import BaseSettings
from typing import List
import os
from dotenv import load_dotenv

# 프로젝트 루트의 .env 파일 로드 (일원화된 환경설정)
current_dir = os.path.dirname(__file__)  # config.py가 있는 디렉토리
backend_dir = os.path.dirname(os.path.dirname(current_dir))  # backend 디렉토리
project_root = os.path.dirname(backend_dir)  # 프로젝트 루트
root_env_file = os.path.join(project_root, ".env")

if os.path.exists(root_env_file):
    load_dotenv(root_env_file)
    print(f"환경설정 로드: {root_env_file}")
else:
    # 백엔드 로컬 .env 파일 로드 (fallback)
    env = os.getenv("APP_ENV", "development")
    env_file = f".env.{env}"
    
    if os.path.exists(env_file):
        load_dotenv(env_file)
        print(f"환경설정 로드: {env_file}")
    else:
        load_dotenv()  # 기본 .env 파일 로드
        print("기본 .env 파일 로드")

class Settings(BaseSettings):
    # 애플리케이션 기본 설정
    APP_NAME: str = os.getenv("APP_NAME", "Forte Consultation Platform")
    APP_VERSION: str = os.getenv("APP_VERSION", "1.0.0")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    APP_ENV: str = os.getenv("APP_ENV", "development")
    
    # 포트 설정 (환경별)
    @property
    def PORT(self) -> int:
        # Cloud Run에서는 PORT 환경변수 자동 설정
        if self.APP_ENV == "production":
            return int(os.getenv("PORT", "8080"))
        # 로컬 개발환경에서는 8000 포트 사용
        else:
            return int(os.getenv("PORT", "8000"))
    
    # GCP 설정
    GCP_PROJECT: str = os.getenv("GCP_PROJECT", "forte-consultation-platform")
    GCP_REGION: str = os.getenv("GCP_REGION", "asia-northeast3")
    DB_INSTANCE: str = os.getenv("DB_INSTANCE", "forte-db")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "forte123")
    
    # 데이터베이스 설정 (환경별 동적 생성)
    @property
    def DATABASE_URL(self) -> str:
        # Cloud Run 환경에서는 Cloud SQL 소켓 사용
        if self.APP_ENV == "production" and self.GCP_PROJECT != "forte-consultation-platform":
            return f"postgresql://forte:{self.DB_PASSWORD}@/forte_db?host=/cloudsql/{self.GCP_PROJECT}:{self.GCP_REGION}:{self.DB_INSTANCE}"
        # 로컬 개발 환경에서는 기본 연결 사용
        else:
            return os.getenv("DATABASE_URL", "postgresql://forte:forte123@localhost:5432/forte_db")
    
    # JWT 설정
    SECRET_KEY: str = os.getenv("SECRET_KEY", "forte-secret-key-change-in-production")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    
    # AI API 설정
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
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
    
    # 환경별 로깅 설정
    @property
    def LOG_LEVEL(self) -> str:
        return "DEBUG" if self.DEBUG else "INFO"
    
    class Config:
        case_sensitive = True

settings = Settings()