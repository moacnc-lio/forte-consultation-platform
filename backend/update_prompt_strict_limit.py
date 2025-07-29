#!/usr/bin/env python3
"""
엄격한 글자수 제한 프롬프트 템플릿 (강제 1,100자)
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
    """엄격한 글자수 제한 프롬프트"""
    session = SessionLocal()
    
    try:
        # 기존 템플릿을 비활성화
        existing_templates = session.query(PromptTemplate).filter(
            PromptTemplate.is_active == True
        ).all()
        
        for template in existing_templates:
            template.is_active = False
            print(f"🔄 기존 템플릿 '{template.name}' 비활성화")
        
        # 엄격한 글자수 제한 템플릿
        strict_template = PromptTemplate(
            name="엄격한 글자수 제한 템플릿",
            version="2.4",
            template_text="""
다음 상담 녹취록을 병원용 상담일지로 요약해줘.

---
{input_text}
---

⚠️ 중요: 반드시 총 1,100자를 절대 초과하지 말고 요약하세요.
⚠️ 각 섹션은 지정된 글자수를 엄격히 준수하세요.

## 1. 고객 정보 요약 (150자 이내)
- 이름, 연령대, 피부타입, 주요 고민

## 2. 고객 성격 및 상담 태도 (150자 이내)  
- 말투, 결정방식, 주의사항

## 3. 관심 시술 및 제안 시술 (180자 이내)
- 고객 관심 시술, 상담자 제안, 반응

## 4. 상담 결과 및 결정 사항 (200자 이내)
- 선택 시술, 패키지, 특별 약속

## 5. 다음 상담 참고사항 (150자 이내)
- 보류 항목, 주의 포인트

## 6. 고객 워딩 및 피드백 (150자 이내)
- 인상적인 발언, 특징적 표현

## 7. 상담자 평가 (70자 이내)
- 태도, 전달력, 개선점 간단히

⚠️ 절대 규칙: 전체 1,100자 초과 금지
⚠️ 각 섹션별 글자수 한도를 반드시 지켜서 작성
⚠️ 글자수 초과 시 핵심만 남기고 삭제할 것
            """.strip(),
            source_language="ja",
            target_language="ko",
            is_active=True,
            created_from_guide=True
        )
        
        session.add(strict_template)
        session.commit()
        
        print("✅ 엄격한 글자수 제한 템플릿 생성 완료!")
        print("⚠️  강제 제한: 1,100자 절대 초과 금지")
        print("📏 각 섹션별 엄격한 글자수 제한 적용")
        
    except Exception as e:
        session.rollback()
        print(f"❌ 오류 발생: {str(e)}")
        raise
    finally:
        session.close()

if __name__ == "__main__":
    print("🚀 엄격한 글자수 제한 프롬프트 업데이트 중...")
    update_prompt_template()