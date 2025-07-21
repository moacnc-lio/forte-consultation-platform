from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, JSON
from sqlalchemy.sql import func
from ..core.database import Base

class Procedure(Base):
    __tablename__ = "procedures"
    
    id = Column(Integer, primary_key=True, index=True)
    procedure_number = Column(Integer, unique=True, nullable=False, index=True)
    korean_name = Column(String(100), nullable=False)
    english_name = Column(String(100))
    category = Column(String(50), index=True)  # A:주사, B:레이저/RF, C:리프팅, D:재생/체형
    brand_info = Column(Text)
    description = Column(Text)
    target_areas = Column(Text)
    duration_info = Column(String(100))
    effects = Column(Text)
    side_effects = Column(Text)
    precautions = Column(Text)
    price_info = Column(Text)
    additional_info = Column(JSON)  # RTF에서 파싱된 추가 정보
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    updated_by = Column(String(100))
    version = Column(Integer, default=1)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ProcedureHistory(Base):
    __tablename__ = "procedure_history"
    
    id = Column(Integer, primary_key=True, index=True)
    procedure_id = Column(Integer, nullable=False, index=True)
    field_name = Column(String(100))
    old_value = Column(Text)
    new_value = Column(Text)
    updated_by = Column(String(100))
    updated_at = Column(DateTime(timezone=True), server_default=func.now())