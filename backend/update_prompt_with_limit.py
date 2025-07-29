#!/usr/bin/env python3
"""
기존 상세 프롬프트 + 글자수 제한 (1,100자 목표)
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models import PromptTemplate
from app.core.database import Base

# 데이터베이스 설정
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def update_prompt_template():
    """기존 상세 프롬프트 + 글자수 제한"""
    session = SessionLocal()
    
    try:
        # 기존 템플릿을 비활성화
        existing_templates = session.query(PromptTemplate).filter(
            PromptTemplate.is_active == True
        ).all()
        
        for template in existing_templates:
            template.is_active = False
            print(f"🔄 기존 템플릿 '{template.name}' 비활성화")
        
        # 글자수 제한이 포함된 상세 템플릿 생성
        limited_template = PromptTemplate(
            name="글자수 제한 상담 요약 템플릿",
            version="2.3",
            template_text="""
다음은 고객과의 상담 녹취록입니다.
고객의 성향, 고민, 시술 선택 과정을 정리하고, 상담자의 말투·전달력 평가까지 포함해 병원용 상담일지로 요약해줘.

---
{input_text}
---

아래 항목을 기준으로 요약해줘:

## 1. 고객 정보 요약
- 이름(알려진 경우), 연령대, 피부 타입
- 내원 목적 / 주요 피부 고민

## 2. 고객 성격 및 상담 태도
- 말투, 결정을 내리는 방식, 시술에 대한 태도
- 예민한 점 또는 특별히 주의할 점

## 3. 관심 시술 및 실제 제안 시술
- 고객이 직접 언급한 시술
- 상담자가 제안한 시술
- 그에 대한 고객 반응 (긍정/부정 여부 포함)

## 4. 상담 결과 및 결정 사항
- 실제 선택한 시술
- 패키지, 업그레이드 여부
- 상담 중 발생한 사전 약속 (예: 서비스 제공, 리뷰 조건, 무통 등 포함)

## 5. 다음 상담 시 참고사항
- 고객 특성상 주의할 포인트
- 이어서 설명하거나 제안해야 할 항목
- 고객이 보류한 항목 (향후 제안 가능성 있는 항목)

## 6. 고객 워딩 및 인상적인 피드백
- 실제 발언 중 기억해둘 문장
- 상담자에게 준 반응 중 특징적인 표현

## 7. 상담자 전달력 및 커뮤니케이션 평가
- 전반적인 태도, 말투, 전달력을 간단히 평가

※ 중요: 전체 요약을 1,100자 이내로 작성해주세요
※ 각 섹션별 권장 분량:
  - 1~6섹션: 각 150-200자 내외
  - 7섹션(상담자평가): 70자 이내

※ 글자수 제한 내에서 핵심 정보는 모두 포함할 것
※ 병원 기록용 상담일지로 사용될 예정이므로, 간결하고 실무적으로 작성해줘.
            """.strip(),
            source_language="ja",
            target_language="ko",
            is_active=True,
            created_from_guide=True
        )
        
        session.add(limited_template)
        session.commit()
        
        print("✅ 글자수 제한 프롬프트 템플릿 생성 완료!")
        print("📏 글자수 제한: 1,100자 이내")
        print("🔧 섹션별 분량:")
        print("  - 1~6섹션: 각 150-200자")
        print("  - 7섹션(상담자평가): 70자 이내")
        print("💡 기존 상세한 내용 품질 유지하면서 글자수만 제한")
        
    except Exception as e:
        session.rollback()
        print(f"❌ 오류 발생: {str(e)}")
        raise
    finally:
        session.close()

if __name__ == "__main__":
    print("🚀 글자수 제한 프롬프트 템플릿 업데이트 중...")
    update_prompt_template()