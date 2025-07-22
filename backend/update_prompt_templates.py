#!/usr/bin/env python3
"""
프롬프트 템플릿 업데이트 스크립트 - 기존 템플릿을 새로운 버전으로 업데이트
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

def update_prompt_templates():
    """프롬프트 템플릿 업데이트"""
    session = SessionLocal()
    
    try:
        # 새로운 개선된 프롬프트 템플릿
        new_template_text = """
다음은 고객과의 상담 녹취록입니다.
고객의 성향, 고민, 시술 선택 과정을 정리하고, 상담자의 말투·전달력 평가까지 포함해 병원용 상담일지로 요약해줘.

---
{input_text}
---

아래 항목을 기준으로 요약해줘:

## 1. 🧑 고객 정보 요약
- 이름(알려진 경우), 연령대, 피부 타입
- 내원 목적 / 주요 피부 고민

## 2. 🧠 고객 성격 및 상담 태도
- 말투, 결정을 내리는 방식, 시술에 대한 태도
- 예민한 점 또는 특별히 주의할 점

## 3. 💉 관심 시술 및 실제 제안 시술
- 고객이 직접 언급한 시술
- 상담자가 제안한 시술
- 그에 대한 고객 반응 (긍정/부정 여부 포함)

## 4. ✅ 상담 결과 및 결정 사항
- 실제 선택한 시술
- 패키지, 업그레이드 여부
- 상담 중 발생한 사전 약속 (예: 서비스 제공, 리뷰 조건, 무통 등 포함)

## 5. 🔁 다음 상담 시 참고사항
- 고객 특성상 주의할 포인트
- 이어서 설명하거나 제안해야 할 항목
- 고객이 보류한 항목 (향후 제안 가능성 있는 항목)

## 6. 🗣 고객 워딩 및 인상적인 피드백
- 실제 발언 중 기억해둘 문장
- 상담자에게 준 반응 중 특징적인 표현

## 7. 🎤 상담자 전달력 및 커뮤니케이션 평가
※ AI는 다음 항목을 기준으로 상담자의 전달력 및 커뮤니케이션을 객관 평가해줘:
- 상담자의 전반적인 태도 (친절함, 공감도, 리드력 등)
- 말투의 안정성 (불필요한 추임새/버벅임 유무)
- 말속도 및 템포 (빠르거나 느린 부분, 고객이 이해했는지 여부)
- 전달력 (내용이 체계적으로 정리되어 있었는지, 반복 설명 여부 등)
- 정적 여부 (불필요한 공백, 망설임, 설명의 흐름 끊김 등)

📌 상담자 평가 항목은 구체적 수치 없이, 정성적 묘사로 표현해줘 (예: "전달은 명확했으나 말속도가 빠른 편", "중간중간 정적 있음", "고객 질문에 반복 대응하여 공감도 좋았음" 등).

※ 핵심은 '고객의 말', '성격', '결정 과정' 위주로 정리해줘.
※ 병원 기록용 상담일지로 사용될 예정이므로, 간결하고 실무적으로 작성해줘.
        """.strip()
        
        # 기존 기본 템플릿 찾기
        basic_template = session.query(PromptTemplate).filter(
            PromptTemplate.name == "기본 상담 요약 템플릿"
        ).first()
        
        if basic_template:
            # 기존 템플릿 업데이트
            basic_template.template_text = new_template_text
            basic_template.version = "2.0"
            print("✅ 기본 상담 요약 템플릿 업데이트 완료")
        else:
            # 새로 생성
            new_template = PromptTemplate(
                name="기본 상담 요약 템플릿",
                version="2.0",
                template_text=new_template_text,
                source_language="ja",
                target_language="ko",
                is_active=True,
                created_from_guide=True
            )
            session.add(new_template)
            print("✅ 기본 상담 요약 템플릿 새로 생성")
            
        session.commit()
        print("🎉 프롬프트 템플릿 업데이트 완료!")
        
    except Exception as e:
        session.rollback()
        print(f"❌ 오류 발생: {str(e)}")
        raise
    finally:
        session.close()

if __name__ == "__main__":
    print("🚀 프롬프트 템플릿 업데이트 중...")
    update_prompt_templates()