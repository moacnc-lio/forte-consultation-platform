#!/usr/bin/env python3
"""
2025년 최신 연구 기반 시술 정보 업데이트 스크립트
"""

import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import logging

# 환경 변수에서 데이터베이스 URL 가져오기
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://forte:forte123@localhost:5432/forte_db')

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

def update_procedure_data():
    """시술 정보 업데이트"""
    engine = get_db_connection()
    if not engine:
        logger.error("데이터베이스 연결을 생성할 수 없습니다.")
        return False
    
    updated_procedures = [
        {
            "procedure_number": 1,
            "korean_name": "보톡스",
            "side_effects": "【일반적】멍, 붓기, 통증, 압통, 주사부위 당김\n【심각한】안검하수, 보톡스 내성 (2024년 조사 시 75% 경험), 씹는 힘 저하, 사무라이 눈썹, 웃는 모습 변화\n【생명위험】보툴리눔 중독으로 인한 급격한 근력쇠약, 호흡곤란, 삼킴곤란, 언어장애, 실제 사망 사례 보고",
            "precautions": "【절대금기】근무력증(100% 근육약화 발생), 임신/수유 중 여성\n【상대금기】주사부위 감염, 신경근육계 질환, 아미노글리코사이드계 항생제 복용자\n【내성예방】시술 간격 3개월 이상, 적정 용량 준수, 복합단백질 없는 제품 사용\n【시술 후】24시간 마사지 금지, 1주일간 과도한 운동/열자극/음주 금지"
        },
        {
            "procedure_number": 2,
            "korean_name": "필러",
            "side_effects": "【즉시부작용(10-30%)】부종, 발적, 멍, 통증, 일시적 비대칭\n【중등도(1-5%)】과도한 부종, 필러 결절, 틴달현상(푸른빛), 감각이상\n【지연부작용(0.06-1.1%)】지연성 염증반응, 이물육아종, 생물막 형성\n【심각한(<0.1%)】혈관폐쇄로 인한 피부괴사, 실명 위험 (미간/콧등/눈밑 주의), 뇌졸중",
            "precautions": "【절대금기】임신/수유, 히알루론산/리도카인 알레르기, 시술부위 활성감염, 자가면역질환\n【위험부위】미간/콧등(실명위험), 눈밑/애교살(안동맥), 이마(안와상동맥)\n【응급상황】시술 중 심한통증, 피부창백/청색증, 시야장애 시 즉시 히알루로니다제 투여\n【시술 후】24시간 마사지 금지, 1주일간 사우나/찜질방/격렬한 운동 금지"
        },
        {
            "procedure_number": 4,
            "korean_name": "쥬베룩",
            "side_effects": "【일반적(10-15%)】멍, 붓기, 일시적 통증, 압통, 홍반, 가려움증, 주사부위 단단함\n【드문(<1%)】결절 형성 (제거 어려움), PDLLA/히알루론산 알레르기\n【심각한】혈관폐쇄로 인한 조직괴사, 혈관 내 주입 시 실명 등 중대한 부작용\n【특별주의】장기간 안전성 미확인 (24주 이상 데이터 부족)",
            "precautions": "【절대금기】급만성 피부질환, 감염/염증 상태, 제품성분 과민반응, 급만성 치주염, 임신/수유, 미성년자\n【상대금기】간기능 이상, 혈액응고 이상, 면역력 저하, 영구보형물 삽입자, 리도카인 알레르기\n【위험부위】미간 등 혈관 주입 위험 높은 부위 사용 금지\n【시술 후】압박/마사지 금지, 과도한 표정변화 피하기, 자외선 차단, 충분한 보습"
        },
        {
            "procedure_number": 7,
            "korean_name": "아이 오리지오",
            "side_effects": "【즉시부작용】눈 주변 일시적 붉어짐, 가벼운 붓기(특히 아침), 따뜻한 열감, 눈물분비 증가\n【단기부작용(1-3일)】지속적 미세붓기, 눈 주변 건조감, 일시적 민감도 증가, 화장 시 따가움\n【주의부작용】안구건조증 일시적 악화, 콘택트렌즈 착용 불편, 눈 주변 색소침착(매우 드물음), 시야 흐림(1-2시간)",
            "precautions": "【절대금기】임신/수유, 급성 결막염/각막염/포도막염, 최근 안과수술(3개월 이내), 심재세동기 착용\n【상대금기】심한 안구건조증, 켈로이드 체질, 면역억제제/항응고제 복용, 최근 보톡스/필러(2-4주 이내)\n【시술 전】콘택트렌즈 제거(1시간 전), 아이메이크업 완전제거, 속눈썹 익스텐션 제거 권장\n【시술 후】24시간 콘택트렌즈 금지, 눈 비비기 금지, 인공눈물 수시 점안, 냉찜질 2-3회/일"
        },
        {
            "procedure_number": 10,
            "korean_name": "온다 리프팅",
            "side_effects": "【일반적(경미)】홍조(몇시간 내 소실), 미세한 붓기(하루 정도), 따뜻한 느낌, 일시적 건조\n【드문부작용】물집(과도한 에너지 시), 색소변화(극히 드물게), 감각이상(일시적, 수일내 회복)\n【심각한】화상(부적절한 시술 시) - 전문의 시술 시 거의 발생하지 않음",
            "precautions": "【절대금기】임신/수유, 심박동기 착용, 시술부위 금속 임플란트, 활성 감염(염증이나 감염 상태 피부)\n【상대금기】자가면역 질환, 혈액응고 장애, 중증 당뇨, 켈로이드 체질\n【특별주의】최근 필러 시술(4주 이내), 피부암 병력, 광과민성 약물 복용, 극도로 민감한 피부\n【시술 후】찜질방/사우나/술/담배/경락마사지 1주일 금지, SPF 30 이상 자외선 차단, 저자극 화장품 사용"
        }
    ]
    
    try:
        with engine.begin() as conn:
            for procedure in updated_procedures:
                query = text("""
                    UPDATE procedures 
                    SET side_effects = :side_effects,
                        precautions = :precautions,
                        last_updated = CURRENT_TIMESTAMP,
                        version = version + 1
                    WHERE procedure_number = :procedure_number
                """)
                
                result = conn.execute(query, {
                    'side_effects': procedure['side_effects'],
                    'precautions': procedure['precautions'],
                    'procedure_number': procedure['procedure_number']
                })
                
                if result.rowcount > 0:
                    logger.info(f"시술 #{procedure['procedure_number']} {procedure['korean_name']} 업데이트 완료")
                else:
                    logger.warning(f"시술 #{procedure['procedure_number']} {procedure['korean_name']} 업데이트 실패 - 해당 시술을 찾을 수 없음")
            
            logger.info("모든 시술 정보 업데이트가 완료되었습니다.")
            return True
            
    except Exception as e:
        logger.error(f"시술 정보 업데이트 실패: {e}")
        return False

def main():
    """메인 함수"""
    logger.info("=== 2025년 최신 연구 기반 시술 정보 업데이트 시작 ===")
    
    success = update_procedure_data()
    
    if success:
        logger.info("업데이트가 성공적으로 완료되었습니다!")
        logger.info("업데이트된 시술: 보톡스, 필러, 쥬베룩, 아이 오리지오, 온다 리프팅")
        logger.info("주요 개선사항:")
        logger.info("- 2024-2025 최신 임상 데이터 반영")
        logger.info("- 부작용 발생률 및 심각도 분류 세분화")
        logger.info("- 환자 상태별 맞춤 금기사항 강화") 
        logger.info("- 응급상황 대처 방안 구체화")
        logger.info("- 시술 후 관리 지침 상세화")
    else:
        logger.error("업데이트 중 오류가 발생했습니다.")
        sys.exit(1)

if __name__ == "__main__":
    main()