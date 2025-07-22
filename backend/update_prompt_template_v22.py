#!/usr/bin/env python3
"""
프롬프트 템플릿을 v2.2로 업데이트 (구조화된 형식)
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

def update_prompt_template():
    """기존 프롬프트 템플릿을 v2.2로 업데이트"""
    session = SessionLocal()
    
    try:
        # 기존 템플릿 조회
        template = session.query(PromptTemplate).filter(
            PromptTemplate.name == "기본 상담 요약 템플릿"
        ).first()
        
        if template:
            # 구조화된 새로운 템플릿 텍스트
            new_template_text = """
다음은 고객과의 상담 녹취록입니다.
고객의 성향, 고민, 시술 선택 과정을 정리하고, 상담자의 말투·전달력 평가까지 포함해 병원용 상담일지로 요약해줘.

---
{input_text}
---

아래 형식을 정확히 따라서 요약해줘:

1. 고객 정보 요약
- 이름: [고객 이름 또는 호칭]
- 연령대: [추정 연령대]
- 피부 타입: [민감성, 건조함, 지성 등 구체적 특징]
- 내원 목적 / 주요 피부 고민: [구체적인 고민 사항들을 상세히 나열]

2. 고객 성격 및 상담 태도
- 말투: [차분함, 적극적 등 말하는 방식의 특징]
- 결정을 내리는 방식: [신중함, 즉석 결정 등]
- 시술에 대한 태도: [긍정적, 신중함, 두려움 등 각 시술별 반응]
- 예민한 점 또는 특별히 주의할 점: [통증, 비용, 부작용 등에 대한 민감도]

3. 관심 시술 및 실제 제안 시술
고객이 직접 언급한 시술:
- [고객이 직접 요청하거나 문의한 시술들을 구체적으로 나열]

상담자가 제안한 시술:
- [상담자가 제안한 모든 시술을 가격, 용량 등과 함께 상세히 기록]

고객 반응:
- [각 제안에 대한 고객의 구체적 반응 - 긍정적, 부정적, 보류 등]

4. 상담 결과 및 결정 사항
실제 선택한 시술:
- [최종 선택한 시술들을 구체적으로 나열]

패키지/업그레이드 여부:
- [선택한 패키지나 업그레이드 옵션들]

사전 약속:
- [무통 시스템, 리뷰 조건, 무료 서비스 등 약속된 사항들]

5. 다음 상담 시 참고사항
고객 특성상 주의할 포인트:
- [통증 민감도, 시술 선호도 등 주의사항]

이어서 설명하거나 제안해야 할 항목:
- [향후 제안 가능한 시술이나 설명이 필요한 항목들]

고객이 보류한 항목:
- [관심은 있지만 이번에 선택하지 않은 시술들]

6. 고객 워딩 및 인상적인 피드백
- [고객의 실제 발언 중 기억해둘 문장들을 인용부호와 함께 기록]
- [상담자에게 준 반응 중 특징적인 표현들]

7. 상담자 전달력 및 커뮤니케이션 평가
전반적인 태도:
- [친절함, 공감도, 리드력 등에 대한 평가]

말투의 안정성:
- [불필요한 추임새나 버벅임 여부]

말속도 및 템포:
- [적절성, 고객 이해도 등]

전달력:
- [체계성, 명확성, 반복 설명 여부 등]

정적 여부:
- [불필요한 공백이나 망설임 등]

총평: [상담자의 전반적인 커뮤니케이션에 대한 종합 평가]

※ 핵심은 '고객의 말', '성격', '결정 과정' 위주로 정리해줘.
※ 병원 기록용 상담일지로 사용될 예정이므로, 간결하고 실무적으로 작성해줘.
※ 구체적인 숫자, 가격, 시술명은 정확히 기록해줘.
            """.strip()
            
            # 템플릿 업데이트
            template.template_text = new_template_text
            template.version = "2.2"
            
            session.commit()
            print("✅ 프롬프트 템플릿을 v2.2로 업데이트 완료 (구조화된 형식)")
        else:
            print("❌ 기본 상담 요약 템플릿을 찾을 수 없습니다")
            
    except Exception as e:
        session.rollback()
        print(f"❌ 오류 발생: {str(e)}")
        raise
    finally:
        session.close()

if __name__ == "__main__":
    print("🚀 프롬프트 템플릿 v2.2 업데이트 중...")
    update_prompt_template()