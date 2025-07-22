from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .core.config import settings
from .core.database import engine, Base
from .api import procedures, summaries
import logging

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# FastAPI 앱 생성
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="포르테 시술 상담 지원 플랫폼 API",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 데이터베이스 테이블 생성
Base.metadata.create_all(bind=engine)

# API 라우터 등록
app.include_router(procedures.router)
app.include_router(summaries.router)

# 헬스체크 엔드포인트
@app.get("/")
async def root():
    return {
        "message": "포르테 시술 상담 지원 플랫폼 API",
        "version": settings.APP_VERSION,
        "status": "healthy"
    }

@app.get("/health")
async def health_check():
    """헬스체크"""
    try:
        return {
            "status": "healthy",
            "app_name": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "database": "connected"
        }
    except Exception as e:
        logger.error(f"헬스체크 실패: {str(e)}")
        raise HTTPException(status_code=503, detail="서비스 사용 불가")

# 데이터베이스 초기화 엔드포인트
@app.post("/api/init-db")
async def init_database():
    """데이터베이스 초기화 및 시드 데이터 생성"""
    try:
        from .models import Procedure, PromptTemplate
        from .core.database import SessionLocal
        import subprocess
        import os
        
        # 프로시저 시드 데이터 실행
        seed_procedures_path = os.path.join(os.path.dirname(__file__), "..", "seed_procedures.py")
        if os.path.exists(seed_procedures_path):
            subprocess.run(["python", seed_procedures_path], check=True)
            
        # 프롬프트 템플릿 시드 데이터 실행
        seed_templates_path = os.path.join(os.path.dirname(__file__), "..", "seed_prompt_templates.py")
        if os.path.exists(seed_templates_path):
            subprocess.run(["python", seed_templates_path], check=True)
            
        return {
            "status": "success",
            "message": "데이터베이스 초기화 완료",
            "procedures_seeded": True,
            "templates_seeded": True
        }
    except Exception as e:
        logger.error(f"데이터베이스 초기화 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"데이터베이스 초기화 실패: {str(e)}")

# 글로벌 예외 처리
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"예상치 못한 오류: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "내부 서버 오류가 발생했습니다"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=settings.DEBUG
    )