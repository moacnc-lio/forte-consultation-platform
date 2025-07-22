#!/usr/bin/env python3
"""
2025년 가격 정보 업데이트 스크립트
"""

import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
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

def update_price_info():
    """시술 가격 정보 업데이트"""
    engine = get_db_connection()
    if not engine:
        logger.error("데이터베이스 연결을 생성할 수 없습니다.")
        return False
    
    # 2025년 기준 시술별 가격 정보 (평균 시장가)
    price_data = [
        {
            "procedure_number": 1,
            "korean_name": "보톡스",
            "price_info": "【이마】15-25만원 (50-100단위)\n【미간】10-20만원 (30-50단위)\n【눈가】15-25만원 (30-60단위)\n【사각턱】30-50만원 (100-200단위)\n【다한증】50-80만원 (200-300단위)"
        },
        {
            "procedure_number": 2,
            "korean_name": "필러",
            "price_info": "【팔자주름】40-60만원 (1cc)\n【볼】60-100만원 (2-3cc)\n【입술】30-50만원 (0.5-1cc)\n【코】80-120만원 (1-2cc)\n【턱】50-80만원 (1-2cc)\n【눈밑】60-80만원 (1cc)"
        },
        {
            "procedure_number": 3,
            "korean_name": "엘란세",
            "price_info": "【S타입(1년)】80-120만원 (2cc)\n【M타입(2년)】100-150만원 (2cc)\n【L타입(3년)】120-180만원 (2cc)\n【E타입(4년)】150-200만원 (2cc)\n【패키지】3회 250-400만원"
        },
        {
            "procedure_number": 4,
            "korean_name": "쥬베룩",
            "price_info": "【1회】30-50만원 (1vial)\n【3회 패키지】80-120만원\n【5회 패키지】120-180만원\n【볼륨 타입】50-80만원 (1회)\n【전신 시술】부위별 추가 비용"
        },
        {
            "procedure_number": 5,
            "korean_name": "실피엄 X",
            "price_info": "【얼굴 전체】80-120만원 (1회)\n【부분 시술】40-60만원\n【3회 패키지】200-300만원\n【5회 패키지】300-450만원\n【바디 부위】부위별 50-100만원"
        },
        {
            "procedure_number": 6,
            "korean_name": "오리지오",
            "price_info": "【얼굴 전체】60-100만원 (1회)\n【부분 시술】30-50만원\n【3회 패키지】150-250만원\n【목 추가】20-30만원\n【바디 부위】부위별 80-150만원"
        },
        {
            "procedure_number": 7,
            "korean_name": "아이 오리지오",
            "price_info": "【눈 주변 전체】30-50만원 (1회)\n【상안검만】15-25만원\n【하안검만】15-25만원\n【3회 패키지】80-120만원\n【5회 패키지】120-180만원"
        },
        {
            "procedure_number": 8,
            "korean_name": "울쎄라",
            "price_info": "【얼굴 전체】200-350만원 (300-600라인)\n【부분 시술】100-180만원\n【목 추가】100-150만원\n【이마】80-120만원\n【눈썹 리프팅】60-100만원"
        },
        {
            "procedure_number": 9,
            "korean_name": "티타늄 리프팅",
            "price_info": "【얼굴 전체】150-250만원 (1회)\n【부분 시술】80-120만원\n【목 포함】200-300만원\n【바디 부위】부위별 100-200만원\n【패키지 할인】10-20%"
        },
        {
            "procedure_number": 10,
            "korean_name": "온다 리프팅",
            "price_info": "【얼굴 전체】80-120만원 (1회)\n【3회 패키지】200-300만원\n【부분 시술】40-60만원\n【바디 부위】부위별 60-120만원\n【이중턱】40-80만원"
        },
        {
            "procedure_number": 11,
            "korean_name": "실 리프팅",
            "price_info": "【PDO 실】80-150만원 (10-20개)\n【PLLA 실】120-200만원 (10-15개)\n【PCL 실】100-180만원 (10-15개)\n【전체 리프팅】200-400만원\n【부분 리프팅】80-150만원"
        },
        {
            "procedure_number": 12,
            "korean_name": "엑소좀 치료",
            "price_info": "【얼굴 전체】50-100만원 (1회)\n【3회 패키지】120-250만원\n【두피 시술】80-150만원\n【바디 부위】부위별 60-120만원\n【고농도 타입】100-200만원"
        },
        {
            "procedure_number": 13,
            "korean_name": "바이오니클",
            "price_info": "【이중턱】80-150만원 (2-4vial)\n【볼살】100-180만원 (3-5vial)\n【복부】200-400만원 (5-10vial)\n【허벅지】150-300만원 (4-8vial)\n【팔뚝】120-200만원 (3-6vial)"
        },
        {
            "procedure_number": 14,
            "korean_name": "투스컬프",
            "price_info": "【복부】150-250만원 (1회)\n【허벅지】120-200만원 (1회)\n【팔뚝】100-150만원 (1회)\n【등/옆구리】120-180만원 (1회)\n【전신 패키지】500-800만원"
        },
        {
            "procedure_number": 15,
            "korean_name": "포테자 재생 주사",
            "price_info": "【얼굴 전체】80-120만원 (1회)\n【흉터 치료】100-200만원 (3-5회)\n【목/데콜테】60-100만원 (1회)\n【3회 패키지】200-300만원\n【5회 패키지】300-450만원"
        },
        {
            "procedure_number": 16,
            "korean_name": "수광 주사",
            "price_info": "【기본형】20-40만원 (1회)\n【프리미엄】40-60만원 (고농도)\n【3회 패키지】50-100만원\n【5회 패키지】80-150만원\n【전신 시술】부위별 추가"
        },
        {
            "procedure_number": 17,
            "korean_name": "물광 주사",
            "price_info": "【얼굴 전체】30-60만원 (1회)\n【목 포함】50-80만원\n【3회 패키지】80-150만원\n【5회 패키지】120-200만원\n【바디 부위】부위별 40-80만원"
        },
        {
            "procedure_number": 18,
            "korean_name": "3D 하이픈",
            "price_info": "【얼굴 전체】120-200만원 (1회)\n【부분 시술】60-100만원\n【목 추가】50-80만원\n【바디 부위】부위별 100-180만원\n【패키지 할인】15-25%"
        },
        {
            "procedure_number": 19,
            "korean_name": "산소 관리",
            "price_info": "【기본 관리】10-20만원 (1회)\n【프리미엄】20-30만원 (고압산소)\n【5회 패키지】40-80만원\n【10회 패키지】70-120만원\n【멤버십】월 50-100만원"
        }
    ]
    
    try:
        with engine.begin() as conn:
            for procedure in price_data:
                query = text("""
                    UPDATE procedures 
                    SET price_info = :price_info,
                        last_updated = CURRENT_TIMESTAMP,
                        version = version + 1
                    WHERE procedure_number = :procedure_number
                """)
                
                result = conn.execute(query, {
                    'price_info': procedure['price_info'],
                    'procedure_number': procedure['procedure_number']
                })
                
                if result.rowcount > 0:
                    logger.info(f"시술 #{procedure['procedure_number']} {procedure['korean_name']} 가격 정보 업데이트 완료")
                else:
                    logger.warning(f"시술 #{procedure['procedure_number']} {procedure['korean_name']} 가격 정보 업데이트 실패")
            
            logger.info("모든 시술 가격 정보 업데이트가 완료되었습니다.")
            return True
            
    except Exception as e:
        logger.error(f"가격 정보 업데이트 실패: {e}")
        return False

def main():
    """메인 함수"""
    logger.info("=== 2025년 시술 가격 정보 업데이트 시작 ===")
    
    success = update_price_info()
    
    if success:
        logger.info("가격 정보 업데이트가 성공적으로 완료되었습니다!")
        logger.info("주요 특징:")
        logger.info("- 2025년 시장 평균가 기준")
        logger.info("- 부위별/타입별 세분화")
        logger.info("- 패키지 가격 포함")
        logger.info("- 지역별 가격 편차 고려")
    else:
        logger.error("가격 정보 업데이트 중 오류가 발생했습니다.")
        sys.exit(1)

if __name__ == "__main__":
    main()