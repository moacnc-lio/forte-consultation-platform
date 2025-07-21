from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ..core.database import get_db
from ..models import Procedure, ProcedureHistory
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/procedures", tags=["procedures"])

# Pydantic 모델 정의
class ProcedureBase(BaseModel):
    korean_name: str
    english_name: Optional[str] = None
    category: Optional[str] = None
    brand_info: Optional[str] = None
    description: Optional[str] = None
    target_areas: Optional[str] = None
    duration_info: Optional[str] = None
    effects: Optional[str] = None
    side_effects: Optional[str] = None
    precautions: Optional[str] = None
    price_info: Optional[str] = None
    additional_info: Optional[dict] = None

class ProcedureCreate(ProcedureBase):
    procedure_number: int

class ProcedureUpdate(ProcedureBase):
    korean_name: Optional[str] = None

class ProcedureResponse(ProcedureBase):
    id: int
    procedure_number: int
    version: int
    is_active: bool
    created_at: datetime
    last_updated: datetime
    
    class Config:
        from_attributes = True

# API 엔드포인트들
@router.get("/", response_model=List[ProcedureResponse])
def get_procedures(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = Query(None, description="카테고리 필터 (A, B, C, D)"),
    active_only: bool = Query(True, description="활성 시술만 조회"),
    db: Session = Depends(get_db)
):
    """시술 목록 조회"""
    query = db.query(Procedure)
    
    if active_only:
        query = query.filter(Procedure.is_active == True)
    
    if category:
        query = query.filter(Procedure.category == category)
    
    procedures = query.order_by(Procedure.procedure_number).offset(skip).limit(limit).all()
    return procedures

@router.get("/{procedure_id}", response_model=ProcedureResponse)
def get_procedure(procedure_id: int, db: Session = Depends(get_db)):
    """특정 시술 상세 조회"""
    procedure = db.query(Procedure).filter(Procedure.id == procedure_id).first()
    if not procedure:
        raise HTTPException(status_code=404, detail="시술 정보를 찾을 수 없습니다")
    return procedure

@router.get("/number/{procedure_number}", response_model=ProcedureResponse)
def get_procedure_by_number(procedure_number: int, db: Session = Depends(get_db)):
    """시술 번호로 조회"""
    procedure = db.query(Procedure).filter(Procedure.procedure_number == procedure_number).first()
    if not procedure:
        raise HTTPException(status_code=404, detail="해당 번호의 시술 정보를 찾을 수 없습니다")
    return procedure

@router.post("/", response_model=ProcedureResponse)
def create_procedure(procedure: ProcedureCreate, db: Session = Depends(get_db)):
    """새 시술 정보 생성"""
    # 중복 번호 확인
    existing = db.query(Procedure).filter(Procedure.procedure_number == procedure.procedure_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="이미 존재하는 시술 번호입니다")
    
    # 기본값 설정
    procedure_data = procedure.dict()
    procedure_data['version'] = 1
    procedure_data['is_active'] = True
    procedure_data['updated_by'] = 'admin'
    
    db_procedure = Procedure(**procedure_data)
    db.add(db_procedure)
    db.commit()
    db.refresh(db_procedure)
    
    logger.info(f"새 시술 정보 생성: [{procedure.procedure_number}] {procedure.korean_name}")
    return db_procedure

@router.put("/{procedure_id}", response_model=ProcedureResponse)
def update_procedure(
    procedure_id: int,
    procedure_update: ProcedureUpdate,
    updated_by: str = "system",
    db: Session = Depends(get_db)
):
    """시술 정보 수정"""
    db_procedure = db.query(Procedure).filter(Procedure.id == procedure_id).first()
    if not db_procedure:
        raise HTTPException(status_code=404, detail="시술 정보를 찾을 수 없습니다")
    
    # 변경 이력 저장
    update_data = procedure_update.dict(exclude_unset=True)
    for field, new_value in update_data.items():
        if hasattr(db_procedure, field):
            old_value = getattr(db_procedure, field)
            if old_value != new_value:
                history = ProcedureHistory(
                    procedure_id=procedure_id,
                    field_name=field,
                    old_value=str(old_value) if old_value else None,
                    new_value=str(new_value) if new_value else None,
                    updated_by=updated_by
                )
                db.add(history)
    
    # 시술 정보 업데이트
    for field, value in update_data.items():
        setattr(db_procedure, field, value)
    
    db_procedure.updated_by = updated_by
    db_procedure.version += 1
    
    db.commit()
    db.refresh(db_procedure)
    
    logger.info(f"시술 정보 수정: [{db_procedure.procedure_number}] {db_procedure.korean_name}")
    return db_procedure

@router.delete("/{procedure_id}")
def delete_procedure(procedure_id: int, db: Session = Depends(get_db)):
    """시술 정보 삭제 (비활성화)"""
    db_procedure = db.query(Procedure).filter(Procedure.id == procedure_id).first()
    if not db_procedure:
        raise HTTPException(status_code=404, detail="시술 정보를 찾을 수 없습니다")
    
    db_procedure.is_active = False
    db.commit()
    
    logger.info(f"시술 정보 비활성화: [{db_procedure.procedure_number}] {db_procedure.korean_name}")
    return {"message": "시술 정보가 비활성화되었습니다"}

@router.get("/search/", response_model=List[ProcedureResponse])
def search_procedures(
    q: str = Query(..., description="검색어", min_length=1),
    category: Optional[str] = Query(None, description="카테고리 필터"),
    db: Session = Depends(get_db)
):
    """시술 검색"""
    query = db.query(Procedure).filter(Procedure.is_active == True)
    
    # 기본 텍스트 검색 (PostgreSQL LIKE)
    search_filter = (
        Procedure.korean_name.ilike(f"%{q}%") |
        Procedure.english_name.ilike(f"%{q}%") |
        Procedure.description.ilike(f"%{q}%") |
        Procedure.brand_info.ilike(f"%{q}%")
    )
    query = query.filter(search_filter)
    
    if category:
        query = query.filter(Procedure.category == category)
    
    procedures = query.order_by(Procedure.procedure_number).all()
    logger.info(f"시술 검색: '{q}' -> {len(procedures)}건")
    return procedures

@router.get("/categories/", response_model=List[dict])
def get_categories(db: Session = Depends(get_db)):
    """시술 카테고리 목록"""
    categories = [
        {"code": "A", "name": "주사 시술", "description": "보톡스, 필러, 엘란세"},
        {"code": "B", "name": "레이저/RF 시술", "description": "쥬베룩, 실피엄 X, 오리지오, 울쎄라"},
        {"code": "C", "name": "리프팅 시술", "description": "티타늄 리프팅, 온다 리프팅, 실 리프팅"},
        {"code": "D", "name": "재생/체형/피부 관리", "description": "엑소좀 & PRP, 바이오니클, 투스컬프"}
    ]
    return categories