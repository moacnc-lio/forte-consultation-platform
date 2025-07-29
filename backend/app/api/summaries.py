from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime
import json
from ..core.database import get_db
from ..models import ConsultationSummary, PromptTemplate
from ..services.openai_service import OpenAISummaryService
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/summaries", tags=["summaries"])

# Pydantic 모델 정의
class SummaryCreate(BaseModel):
    consultation_date: date
    original_text: str
    prompt_template_id: Optional[int] = None
    procedures_discussed: Optional[List[int]] = None

class SummaryCreateDirect(BaseModel):
    consultation_date: date
    original_text: str
    summary_text: str
    prompt_template_id: Optional[int] = None
    procedures_discussed: Optional[List[int]] = None
    consultant_name: Optional[str] = None
    customer_name: Optional[str] = None
    consultation_title: Optional[str] = None

class SummaryUpdate(BaseModel):
    summary_text: str
    procedures_discussed: Optional[List[int]] = None

class SummaryResponse(BaseModel):
    id: int
    consultation_date: date
    original_text: str
    summary_text: str
    prompt_template_id: Optional[int]
    procedures_discussed: Optional[List[int]]
    consultant_name: Optional[str]
    customer_name: Optional[str]
    consultation_title: Optional[str]
    created_by: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class SummaryGenerateRequest(BaseModel):
    original_text: str
    consultation_date: Optional[date] = None
    prompt_template_id: Optional[int] = None

# API 엔드포인트들
@router.post("/generate", response_model=dict)
async def generate_summary(
    request: SummaryGenerateRequest,
    db: Session = Depends(get_db)
):
    """AI를 이용한 상담 요약 생성"""
    try:
        # 프롬프트 템플릿 가져오기
        if request.prompt_template_id:
            template = db.query(PromptTemplate).filter(
                PromptTemplate.id == request.prompt_template_id,
                PromptTemplate.is_active == True
            ).first()
        else:
            # 기본 활성 템플릿 사용
            template = db.query(PromptTemplate).filter(
                PromptTemplate.is_active == True
            ).order_by(PromptTemplate.created_at.desc()).first()
        
        if not template:
            raise HTTPException(status_code=404, detail="사용 가능한 프롬프트 템플릿이 없습니다")
        
        # OpenAI API를 통한 요약 생성
        openai_service = OpenAISummaryService()
        result = await openai_service.summarize_japanese_to_korean(
            japanese_text=request.original_text,
            prompt_template=template.template_text
        )
        
        if not result["success"]:
            raise HTTPException(status_code=500, detail=f"AI 요약 생성 실패: {result['error']}")
        
        logger.info(f"AI 요약 생성 완료: {len(request.original_text)} -> {len(result['summary'])} 글자")
        
        return {
            "summary": result["summary"],
            "original_text": request.original_text,
            "template_used": template.name,
            "consultation_date": request.consultation_date or date.today()
        }
        
    except Exception as e:
        logger.error(f"요약 생성 중 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate/stream")
async def generate_summary_stream(
    request: SummaryGenerateRequest,
    db: Session = Depends(get_db)
):
    """AI를 이용한 상담 요약 생성 (스트리밍)"""
    try:
        # 프롬프트 템플릿 가져오기
        if request.prompt_template_id:
            template = db.query(PromptTemplate).filter(
                PromptTemplate.id == request.prompt_template_id,
                PromptTemplate.is_active == True
            ).first()
        else:
            # 기본 활성 템플릿 사용
            template = db.query(PromptTemplate).filter(
                PromptTemplate.is_active == True
            ).order_by(PromptTemplate.created_at.desc()).first()
        
        if not template:
            raise HTTPException(status_code=404, detail="사용 가능한 프롬프트 템플릿이 없습니다")
        
        # OpenAI API를 통한 스트리밍 요약 생성
        openai_service = OpenAISummaryService()
        
        async def generate():
            try:
                # 스트리밍 응답 받기
                response = await openai_service.summarize_japanese_to_korean(
                    japanese_text=request.original_text,
                    prompt_template=template.template_text,
                    stream=True
                )
                
                full_summary = ""
                
                # 스트리밍 청크를 SSE 형식으로 전송
                for chunk in response:
                    if chunk.choices[0].delta.content is not None:
                        content = chunk.choices[0].delta.content
                        full_summary += content
                        
                        # SSE 형식으로 데이터 전송
                        data = {
                            "type": "content",
                            "content": content,
                            "accumulated": full_summary
                        }
                        yield f"data: {json.dumps(data, ensure_ascii=False)}\n\n"
                
                # 완료 신호 전송
                final_data = {
                    "type": "done",
                    "summary": openai_service._clean_markdown(full_summary),
                    "template_used": template.name,
                    "consultation_date": str(request.consultation_date or date.today())
                }
                yield f"data: {json.dumps(final_data, ensure_ascii=False)}\n\n"
                
            except Exception as e:
                error_data = {
                    "type": "error",
                    "error": str(e)
                }
                yield f"data: {json.dumps(error_data, ensure_ascii=False)}\n\n"
        
        return StreamingResponse(
            generate(),
            media_type="text/plain",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            }
        )
        
    except Exception as e:
        logger.error(f"스트리밍 요약 생성 중 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/direct", response_model=SummaryResponse)
async def create_summary_direct(
    summary: SummaryCreateDirect,
    created_by: str = "system",
    db: Session = Depends(get_db)
):
    """상담 요약 직접 저장 (AI 생성 없이)"""
    try:
        # 프롬프트 템플릿 확인 (옵션)
        if summary.prompt_template_id:
            template = db.query(PromptTemplate).filter(
                PromptTemplate.id == summary.prompt_template_id
            ).first()
            if not template:
                raise HTTPException(status_code=404, detail="프롬프트 템플릿을 찾을 수 없습니다")
        
        # DB에 직접 저장
        db_summary = ConsultationSummary(
            consultation_date=summary.consultation_date,
            original_text=summary.original_text,
            summary_text=summary.summary_text,
            prompt_template_id=summary.prompt_template_id,
            procedures_discussed=summary.procedures_discussed,
            consultant_name=summary.consultant_name,
            customer_name=summary.customer_name,
            consultation_title=summary.consultation_title,
            created_by=created_by
        )
        
        db.add(db_summary)
        db.commit()
        db.refresh(db_summary)
        
        logger.info(f"상담 요약 직접 저장 완료: ID {db_summary.id}")
        return db_summary
        
    except Exception as e:
        db.rollback()
        logger.error(f"상담 요약 직접 저장 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=SummaryResponse)
async def create_summary(
    summary: SummaryCreate,
    created_by: str = "system",
    db: Session = Depends(get_db)
):
    """상담 요약 저장 (AI 생성 포함)"""
    try:
        # 프롬프트 템플릿 확인
        if summary.prompt_template_id:
            template = db.query(PromptTemplate).filter(
                PromptTemplate.id == summary.prompt_template_id
            ).first()
            if not template:
                raise HTTPException(status_code=404, detail="프롬프트 템플릿을 찾을 수 없습니다")
        
        # AI 요약 생성
        if summary.prompt_template_id:
            template = db.query(PromptTemplate).filter(
                PromptTemplate.id == summary.prompt_template_id
            ).first()
        else:
            template = db.query(PromptTemplate).filter(
                PromptTemplate.is_active == True
            ).order_by(PromptTemplate.created_at.desc()).first()
        
        openai_service = OpenAISummaryService()
        result = await openai_service.summarize_japanese_to_korean(
            japanese_text=summary.original_text,
            prompt_template=template.template_text
        )
        
        if not result["success"]:
            raise HTTPException(status_code=500, detail=f"AI 요약 생성 실패: {result['error']}")
        
        # DB에 저장
        db_summary = ConsultationSummary(
            consultation_date=summary.consultation_date,
            original_text=summary.original_text,
            summary_text=result["summary"],
            prompt_template_id=summary.prompt_template_id or template.id,
            procedures_discussed=summary.procedures_discussed,
            created_by=created_by
        )
        
        db.add(db_summary)
        db.commit()
        db.refresh(db_summary)
        
        logger.info(f"상담 요약 저장 완료: ID {db_summary.id}")
        return db_summary
        
    except Exception as e:
        db.rollback()
        logger.error(f"상담 요약 저장 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[SummaryResponse])
def get_summaries(
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[date] = Query(None, description="시작 날짜"),
    end_date: Optional[date] = Query(None, description="종료 날짜"),
    db: Session = Depends(get_db)
):
    """상담 요약 목록 조회"""
    query = db.query(ConsultationSummary)
    
    if start_date:
        query = query.filter(ConsultationSummary.consultation_date >= start_date)
    if end_date:
        query = query.filter(ConsultationSummary.consultation_date <= end_date)
    
    summaries = query.order_by(ConsultationSummary.consultation_date.desc())\
                    .offset(skip).limit(limit).all()
    return summaries

@router.get("/{summary_id}", response_model=SummaryResponse)
def get_summary(summary_id: int, db: Session = Depends(get_db)):
    """특정 상담 요약 조회"""
    summary = db.query(ConsultationSummary).filter(ConsultationSummary.id == summary_id).first()
    if not summary:
        raise HTTPException(status_code=404, detail="상담 요약을 찾을 수 없습니다")
    return summary

@router.put("/{summary_id}", response_model=SummaryResponse)
def update_summary(
    summary_id: int,
    summary_update: SummaryUpdate,
    db: Session = Depends(get_db)
):
    """상담 요약 수정"""
    db_summary = db.query(ConsultationSummary).filter(ConsultationSummary.id == summary_id).first()
    if not db_summary:
        raise HTTPException(status_code=404, detail="상담 요약을 찾을 수 없습니다")
    
    # 수정
    db_summary.summary_text = summary_update.summary_text
    if summary_update.procedures_discussed is not None:
        db_summary.procedures_discussed = summary_update.procedures_discussed
    
    db.commit()
    db.refresh(db_summary)
    
    logger.info(f"상담 요약 수정 완료: ID {summary_id}")
    return db_summary

@router.delete("/{summary_id}")
def delete_summary(summary_id: int, db: Session = Depends(get_db)):
    """상담 요약 삭제"""
    db_summary = db.query(ConsultationSummary).filter(ConsultationSummary.id == summary_id).first()
    if not db_summary:
        raise HTTPException(status_code=404, detail="상담 요약을 찾을 수 없습니다")
    
    db.delete(db_summary)
    db.commit()
    
    logger.info(f"상담 요약 삭제 완료: ID {summary_id}")
    return {"message": "상담 요약이 삭제되었습니다"}