from sqlalchemy import Column, Integer, String, Text, Date, DateTime, JSON, Boolean
from sqlalchemy.sql import func
from ..core.database import Base

class ConsultationSummary(Base):
    __tablename__ = "consultation_summaries"
    
    id = Column(Integer, primary_key=True, index=True)
    consultation_date = Column(Date, index=True)
    original_text = Column(Text, nullable=False)  # 일본어 원문
    summary_text = Column(Text, nullable=False)   # 한국어 요약
    prompt_template_id = Column(Integer, index=True)
    procedures_discussed = Column(JSON)  # 논의된 시술 ID 목록
    consultant_name = Column(String(100))  # 상담자 이름
    customer_name = Column(String(100))    # 고객 이름
    consultation_title = Column(String(255))  # 상담명
    created_by = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

class PromptTemplate(Base):
    __tablename__ = "prompt_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    version = Column(String(20), nullable=False)
    template_text = Column(Text, nullable=False)
    source_language = Column(String(10), default='ja')
    target_language = Column(String(10), default='ko')
    is_active = Column(Boolean, default=True, index=True)
    created_from_guide = Column(Boolean, default=True)  # guide.md 기반 여부
    last_updated_from_guide = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())