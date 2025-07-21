#!/usr/bin/env python3
"""
프롬프트 템플릿 시드 데이터 생성 스크립트
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

def create_prompt_templates():
    """프롬프트 템플릿 생성"""
    session = SessionLocal()
    
    try:
        # 기본 상담 요약 템플릿
        basic_template = PromptTemplate(
            name="기본 상담 요약 템플릿",
            version="1.0",
            template_text="""
다음 일본어 상담 내용을 한국어로 번역하고 체계적으로 요약해주세요:

---
{input_text}
---

다음 형식으로 요약해주세요:

## 🧑 고객 정보 요약
- 연령대: [추정 연령대]
- 주요 피부 고민: [주요 관심사]

## 🧠 고객 성격 및 상담 태도
- [고객의 말투, 태도, 성향 분석]

## 💉 관심 시술 및 실제 제안 시술
- 고객이 직접 언급한 시술: [구체적 시술명]
- 주요 관심 부위: [얼굴 부위 또는 신체 부위]
- 고객 반응: [긍정적/부정적/중립적]

## ✅ 상담 결과 및 결정 사항
- [상담 결과 요약]
- [고객의 최종 결정 사항]

## 🔁 다음 상담 시 참고사항
- [다음 상담 시 고려해야 할 사항들]

## 🗣 고객 워딩 및 인상적인 피드백
- [고객이 한 말 중 중요한 것들을 인용]

## 🎤 상담자 전달력 및 커뮤니케이션 평가
- [상담자의 설명력, 친절도, 전문성 평가]

번역과 요약을 정확하고 자세하게 해주세요.
            """.strip(),
            source_language="ja",
            target_language="ko",
            is_active=True,
            created_from_guide=True
        )
        
        # 간단한 요약 템플릿
        simple_template = PromptTemplate(
            name="간단 상담 요약 템플릿",
            version="1.0",
            template_text="""
다음 일본어 상담 내용을 한국어로 번역하고 간단히 요약해주세요:

---
{input_text}
---

다음 형식으로 간단히 요약해주세요:

## 주요 내용
- 고객 관심사: [주요 관심 시술이나 고민]
- 상담 결과: [상담 결과 요약]
- 다음 단계: [향후 계획이나 추가 상담 필요사항]

## 고객 특징
- [고객의 성향이나 특별한 요구사항]

간결하고 핵심적인 내용 위주로 요약해주세요.
            """.strip(),
            source_language="ja", 
            target_language="ko",
            is_active=True,
            created_from_guide=True
        )
        
        # 기존 템플릿 확인
        existing_basic = session.query(PromptTemplate).filter(
            PromptTemplate.name == "기본 상담 요약 템플릿"
        ).first()
        
        existing_simple = session.query(PromptTemplate).filter(
            PromptTemplate.name == "간단 상담 요약 템플릿"
        ).first()
        
        # 기본 템플릿이 없으면 추가
        if not existing_basic:
            session.add(basic_template)
            print("✅ 기본 상담 요약 템플릿 생성")
        else:
            print("ℹ️  기본 상담 요약 템플릿이 이미 존재합니다")
            
        # 간단 템플릿이 없으면 추가
        if not existing_simple:
            session.add(simple_template)
            print("✅ 간단 상담 요약 템플릿 생성")
        else:
            print("ℹ️  간단 상담 요약 템플릿이 이미 존재합니다")
            
        session.commit()
        print("🎉 프롬프트 템플릿 시드 데이터 생성 완료!")
        
    except Exception as e:
        session.rollback()
        print(f"❌ 오류 발생: {str(e)}")
        raise
    finally:
        session.close()

if __name__ == "__main__":
    print("🚀 프롬프트 템플릿 시드 데이터 생성 중...")
    create_prompt_templates()