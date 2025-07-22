from openai import OpenAI
from typing import Dict, Any, Optional
import logging
from ..core.config import settings

logger = logging.getLogger(__name__)

class OpenAISummaryService:
    def __init__(self):
        self.use_real_api = bool(settings.OPENAI_API_KEY)
        
        if self.use_real_api:
            self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        else:
            logger.error("OPENAI_API_KEY가 설정되지 않았습니다.")
            self.client = None
    
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
                # API 키가 없으면 명확한 오류 반환
                return {
                    "success": False,
                    "error": "OpenAI API 키가 설정되지 않았습니다. 관리자에게 문의하세요.",
                    "original_text": japanese_text
                }
            
            # 프롬프트 템플릿에 일본어 텍스트 삽입
            full_prompt = prompt_template.format(input_text=japanese_text)
            
            # 간소화된 시스템 프롬프트 (속도 최적화)
            system_content = "당신은 일본어를 한국어로 번역하고 의료/미용 상담 내용을 요약하는 전문가입니다.\n\n" + prompt_template

            # OpenAI API 호출 (최신 모델 사용, 스트리밍 활성화)
            response = self.client.chat.completions.create(
                model="gpt-4.1-mini-2025-04-14",  # 최신 GPT-4.1 mini 모델
                messages=[
                    {
                        "role": "system", 
                        "content": system_content
                    },
                    {
                        "role": "user", 
                        "content": f"다음 일본어 상담 내용을 요약해주세요:\n\n{japanese_text}"
                    }
                ],
                temperature=0.3,  # 빠른 응답을 위해 조정
                max_tokens=2000,  # 토큰 수 줄여서 속도 향상
                stream=True  # 스트리밍 활성화
            )
            
            # 스트리밍 응답 처리
            korean_summary = ""
            usage_info = None
            
            for chunk in response:
                if chunk.choices[0].delta.content is not None:
                    korean_summary += chunk.choices[0].delta.content
                
                # 마지막 청크에서 usage 정보 가져오기
                if hasattr(chunk, 'usage') and chunk.usage:
                    usage_info = chunk.usage
            
            # 마크다운 기호 제거
            korean_summary = self._clean_markdown(korean_summary)
            
            # 토큰 사용량 로깅 (usage 정보가 있는 경우만)
            if usage_info:
                logger.info(f"OpenAI API 사용: 입력 {usage_info.prompt_tokens} 토큰, 출력 {usage_info.completion_tokens} 토큰, 총 {usage_info.total_tokens} 토큰")
            
            logger.info(f"AI 요약 생성 성공: {len(japanese_text)} -> {len(korean_summary)} 글자")
            
            return {
                "success": True,
                "original_text": japanese_text,
                "summary": korean_summary,
                "source_language": "ja",
                "target_language": "ko",
                "model_used": "gpt-4.1-mini-2025-04-14",
                "tokens_used": {
                    "prompt_tokens": usage_info.prompt_tokens if usage_info else 0,
                    "completion_tokens": usage_info.completion_tokens if usage_info else 0,
                    "total_tokens": usage_info.total_tokens if usage_info else 0,
                    "cached_tokens": getattr(
                        getattr(usage_info, 'prompt_tokens_details', None), 
                        'cached_tokens', 
                        0
                    ) if usage_info else 0
                }
            }
            
        except Exception as e:
            logger.error(f"OpenAI API 호출 실패: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "original_text": japanese_text
            }
    
    
    def validate_api_key(self) -> bool:
        """
        API 키 유효성 검증
        """
        if not self.use_real_api:
            return False
    
    def _clean_markdown(self, text: str) -> str:
        """
        마크다운 기호 제거 및 텍스트 정리
        """
        import re
        
        # 헤더 기호 제거 (### ## #)
        text = re.sub(r'^#{1,6}\s*', '', text, flags=re.MULTILINE)
        
        # 볼드/이탤릭 기호 제거 (**text**, *text*, __text__, _text_)
        text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)
        text = re.sub(r'\*(.*?)\*', r'\1', text)
        text = re.sub(r'__(.*?)__', r'\1', text)
        text = re.sub(r'_(.*?)_', r'\1', text)
        
        # 수평선 제거 (---, ***)
        text = re.sub(r'^[-*]{3,}$', '', text, flags=re.MULTILINE)
        
        # 여러 개의 연속된 줄바꿈을 2개로 제한
        text = re.sub(r'\n{3,}', '\n\n', text)
        
        # 앞뒤 공백 제거
        text = text.strip()
        
        return text
            
        try:
            # 간단한 테스트 요청
            response = self.client.chat.completions.create(
                model="gpt-4.1-mini-2025-04-14",
                messages=[{"role": "user", "content": "Hello"}],
                max_tokens=5
            )
            return True
        except Exception as e:
            logger.error(f"OpenAI API 키 유효성 검증 실패: {str(e)}")
            return False