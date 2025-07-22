#!/usr/bin/env python3
"""
상담 요약 테이블에 consultant_name, customer_name, consultation_title 컬럼 추가
"""

import os
import sys
from sqlalchemy import create_engine, text
import logging

# 환경 변수에서 데이터베이스 URL 가져오기
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://forte:forte123@postgres:5432/forte_db')

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_db_connection():
    """데이터베이스 연결 생성"""
    try:
        engine = create_engine(DATABASE_URL)
        return engine
    except Exception as e:
        logger.error(f"데이터베이스 연결 실패: {e}")
        return None

def add_summary_columns():
    """상담 요약 테이블에 새로운 컬럼들 추가"""
    engine = get_db_connection()
    if not engine:
        logger.error("데이터베이스 연결을 생성할 수 없습니다.")
        return False
    
    try:
        with engine.begin() as conn:
            # 기존 컬럼 존재 확인
            check_columns = text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'consultation_summaries' 
                AND column_name IN ('consultant_name', 'customer_name', 'consultation_title')
            """)
            
            existing_columns = [row[0] for row in conn.execute(check_columns)]
            
            # consultant_name 컬럼 추가
            if 'consultant_name' not in existing_columns:
                conn.execute(text("""
                    ALTER TABLE consultation_summaries 
                    ADD COLUMN consultant_name VARCHAR(100)
                """))
                logger.info("consultant_name 컬럼 추가 완료")
            else:
                logger.info("consultant_name 컬럼이 이미 존재합니다.")
            
            # customer_name 컬럼 추가
            if 'customer_name' not in existing_columns:
                conn.execute(text("""
                    ALTER TABLE consultation_summaries 
                    ADD COLUMN customer_name VARCHAR(100)
                """))
                logger.info("customer_name 컬럼 추가 완료")
            else:
                logger.info("customer_name 컬럼이 이미 존재합니다.")
            
            # consultation_title 컬럼 추가
            if 'consultation_title' not in existing_columns:
                conn.execute(text("""
                    ALTER TABLE consultation_summaries 
                    ADD COLUMN consultation_title VARCHAR(255)
                """))
                logger.info("consultation_title 컬럼 추가 완료")
            else:
                logger.info("consultation_title 컬럼이 이미 존재합니다.")
            
            logger.info("모든 컬럼 추가가 완료되었습니다.")
            return True
            
    except Exception as e:
        logger.error(f"컬럼 추가 실패: {e}")
        return False

def main():
    """메인 함수"""
    logger.info("=== 상담 요약 테이블 컬럼 추가 시작 ===")
    
    success = add_summary_columns()
    
    if success:
        logger.info("컬럼 추가가 성공적으로 완료되었습니다!")
        logger.info("추가된 컬럼:")
        logger.info("- consultant_name: 상담자 이름")
        logger.info("- customer_name: 고객 이름")
        logger.info("- consultation_title: 상담명")
    else:
        logger.error("컬럼 추가 중 오류가 발생했습니다.")
        sys.exit(1)

if __name__ == "__main__":
    main()