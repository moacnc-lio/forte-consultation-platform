#!/usr/bin/env python3
"""
간단 상담 요약 템플릿 완전 삭제
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models import PromptTemplate

# 데이터베이스 설정
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def delete_simple_template():
    """간단 상담 요약 템플릿 완전 삭제"""
    session = SessionLocal()
    
    try:
        # 간단 템플릿 조회
        template = session.query(PromptTemplate).filter(
            PromptTemplate.name == "간단 상담 요약 템플릿"
        ).first()
        
        if template:
            session.delete(template)
            session.commit()
            print("✅ 간단 상담 요약 템플릿 완전 삭제 완료")
        else:
            print("❌ 간단 상담 요약 템플릿을 찾을 수 없습니다")
            
    except Exception as e:
        session.rollback()
        print(f"❌ 오류 발생: {str(e)}")
        raise
    finally:
        session.close()

if __name__ == "__main__":
    print("🚀 간단 상담 요약 템플릿 삭제 중...")
    delete_simple_template()