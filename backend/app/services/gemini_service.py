import google.generativeai as genai
from typing import Dict, Any, Optional
import logging
from ..core.config import settings

logger = logging.getLogger(__name__)

class GeminiSummaryService:
    def __init__(self):
        self.use_real_api = bool(settings.GEMINI_API_KEY)
        
        if self.use_real_api:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.model = genai.GenerativeModel('gemini-1.5-pro')
        else:
            logger.warning("GEMINI_API_KEY가 설정되지 않아 개발용 더미 응답을 사용합니다.")
            self.model = None
    
    async def summarize_japanese_to_korean(
        self, 
        japanese_text: str, 
        prompt_template: str
    ) -> Dict[str, Any]:
        """
        일본어 상담 내용을 한국어로 요약
        """
        try:
            if not self.use_real_api:
                # 개발용 더미 응답
                return self._generate_dummy_response(japanese_text)
            
            # 프롬프트 템플릿에 일본어 텍스트 삽입
            full_prompt = prompt_template.format(input_text=japanese_text)
            
            # Gemini API 호출 (최신 모델 최적화 설정)
            response = self.model.generate_content(
                full_prompt,
                generation_config={
                    "temperature": 0.2,  # 더 일관성 있는 요약을 위해 낮은 값
                    "max_output_tokens": 4000,  # Pro 모델이므로 더 많은 토큰 허용
                    "top_p": 0.8,
                    "top_k": 40,
                    "candidate_count": 1,
                    "stop_sequences": []
                },
                safety_settings=[
                    {
                        "category": "HARM_CATEGORY_HARASSMENT",
                        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        "category": "HARM_CATEGORY_HATE_SPEECH",
                        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                    }
                ]
            )
            
            korean_summary = response.text
            
            logger.info(f"AI 요약 생성 성공: {len(japanese_text)} -> {len(korean_summary)} 글자")
            
            return {
                "success": True,
                "original_text": japanese_text,
                "summary": korean_summary,
                "source_language": "ja",
                "target_language": "ko",
                "model_used": "gemini-1.5-pro"
            }
            
        except Exception as e:
            logger.error(f"Gemini API 호출 실패: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "original_text": japanese_text
            }
    
    def _generate_dummy_response(self, japanese_text: str) -> Dict[str, Any]:
        """
        개발용 더미 응답 생성
        """
        # 간단한 더미 요약 생성
        dummy_summary = f"""
## 🧑 고객 정보 요약
- 연령대: 30대 추정
- 주요 피부 고민: 이마 주름, 표정 주름

## 🧠 고객 성격 및 상담 태도
- 차분하고 정중한 말투
- 시술에 대해 신중한 접근
- 자연스러운 결과를 원하는 성향

## 💉 관심 시술 및 실제 제안 시술
- 고객이 직접 언급한 시술: 보톡스 시술
- 주요 관심 부위: 이마, 표정 주름
- 고객 반응: 긍정적, 추가 정보 요청

## ✅ 상담 결과 및 결정 사항
- 보톡스 시술 검토 중
- 효과 지속 기간 및 부작용에 대한 추가 설명 필요

## 🔁 다음 상담 시 참고사항
- 자연스러운 결과를 중시하는 고객
- 안전성에 대한 우려 해소 필요
- 시술 후 관리 방법 안내 필요

## 🗣 고객 워딩 및 인상적인 피드백
- "자연스러운 결과를 원합니다"
- "부작용이 걱정됩니다"

## 🎤 상담자 전달력 및 커뮤니케이션 평가
- 전반적으로 친절하고 전문적인 상담 진행
- 고객의 우려사항에 대한 충분한 설명 제공
- 안정적인 말투로 신뢰감 조성

※ 개발용 더미 응답입니다. 실제 AI 분석 결과가 아닙니다.
        """
        
        logger.info(f"더미 요약 생성: {len(japanese_text)} -> {len(dummy_summary)} 글자")
        
        return {
            "success": True,
            "original_text": japanese_text,
            "summary": dummy_summary.strip(),
            "source_language": "ja",
            "target_language": "ko",
            "model_used": "dummy-for-development"
        }
    
    def validate_api_key(self) -> bool:
        """
        API 키 유효성 검증
        """
        if not self.use_real_api:
            return False
            
        try:
            # 간단한 테스트 요청
            response = self.model.generate_content(
                "Hello",
                generation_config={"max_output_tokens": 10}
            )
            return True
        except Exception as e:
            logger.error(f"API 키 유효성 검증 실패: {str(e)}")
            return False