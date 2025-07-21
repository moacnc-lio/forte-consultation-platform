#!/usr/bin/env python3
"""
시술 정보 시드 데이터 생성 스크립트
RTF 파일 분석 기반으로 19개 시술 정보를 데이터베이스에 입력
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import Procedure
from app.core.config import settings

# 완전한 19개 시술 시드 데이터 (RTF 파일 분석 기반)
from procedures_complete_data import COMPLETE_PROCEDURES_DATA

# 데이터베이스 스키마에 맞게 변환
PROCEDURE_SEED_DATA = []

for data in COMPLETE_PROCEDURES_DATA:
    # additional_info를 JSON 문자열로 변환하지 않고 딕셔너리 그대로 저장
    procedure_data = {
        "procedure_number": data["procedure_number"],
        "korean_name": data["korean_name"],
        "english_name": data["english_name"],
        "category": data["category"],
        "brand_info": data["brand_info"],
        "description": data["description"],
        "target_areas": data["target_areas"],
        "duration_info": data["duration_info"],
        "effects": data["effects"],
        "side_effects": data["side_effects"],
        "precautions": data["precautions"],
        "additional_info": data["additional_info"]  # 딕셔너리 그대로 저장
    }
    PROCEDURE_SEED_DATA.append(procedure_data)

def seed_procedures():
    """시술 시드 데이터를 데이터베이스에 삽입"""
    # 데이터베이스 연결
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        print("시술 시드 데이터 삽입 시작...")
        
        # 기존 데이터 확인
        existing_count = db.query(Procedure).count()
        if existing_count > 0:
            print(f"기존 시술 데이터 {existing_count}개 발견. 삽입을 중단합니다.")
            return
        
        # 시드 데이터 삽입
        for data in PROCEDURE_SEED_DATA:
            procedure = Procedure(**data)
            db.add(procedure)
            print(f"[{data['procedure_number']}] {data['korean_name']} 추가")
        
        db.commit()
        print(f"총 {len(PROCEDURE_SEED_DATA)}개 시술 정보가 성공적으로 삽입되었습니다.")
        
    except Exception as e:
        db.rollback()
        print(f"시드 데이터 삽입 실패: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_procedures()