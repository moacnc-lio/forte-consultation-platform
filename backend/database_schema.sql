-- 포르테 시술 상담 지원 플랫폼 데이터베이스 스키마
-- RTF 파일 기반 19개 시술 정보 관리 시스템

-- 시술 정보 테이블 (RTF 구조 기반으로 동적 생성)
CREATE TABLE procedures (
    id SERIAL PRIMARY KEY,
    procedure_number INTEGER NOT NULL UNIQUE, -- RTF 파일의 [1], [2] 번호
    korean_name VARCHAR(100) NOT NULL,
    english_name VARCHAR(100),
    category VARCHAR(50), -- RTF 분석 후 결정 (A: 주사, B: 레이저/RF, C: 리프팅, D: 재생/체형)
    brand_info TEXT, -- 브랜드 관련 정보 (Allergan, Hugel 등)
    description TEXT, -- 시술 설명
    target_areas TEXT, -- 적용 부위
    duration_info VARCHAR(100), -- 지속 기간
    effects TEXT, -- 효과
    side_effects TEXT, -- 부작용
    precautions TEXT, -- 주의사항
    price_info TEXT, -- 가격 정보
    additional_info JSON, -- RTF에서 파싱된 추가 정보
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100), -- 수정자
    version INTEGER DEFAULT 1, -- 버전 관리
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 시술 정보 수정 이력
CREATE TABLE procedure_history (
    id SERIAL PRIMARY KEY,
    procedure_id INTEGER REFERENCES procedures(id),
    field_name VARCHAR(100), -- 수정된 필드명
    old_value TEXT, -- 이전 값
    new_value TEXT, -- 새 값
    updated_by VARCHAR(100), -- 수정자
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 프롬프트 템플릿 관리 (guide.md 기반)
CREATE TABLE prompt_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    version VARCHAR(20) NOT NULL,
    template_text TEXT NOT NULL,
    source_language VARCHAR(10) DEFAULT 'ja',
    target_language VARCHAR(10) DEFAULT 'ko',
    is_active BOOLEAN DEFAULT TRUE,
    created_from_guide BOOLEAN DEFAULT TRUE, -- guide.md 기반 여부
    last_updated_from_guide TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 상담 요약 (간소화)
CREATE TABLE consultation_summaries (
    id SERIAL PRIMARY KEY,
    consultation_date DATE,
    original_text TEXT NOT NULL, -- 일본어 원문
    summary_text TEXT NOT NULL, -- 한국어 요약
    prompt_template_id INTEGER REFERENCES prompt_templates(id),
    procedures_discussed JSON, -- 논의된 시술 ID 목록
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 사용자 관리 (간소화)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user', -- admin, user
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 시술 정보 즐겨찾기
CREATE TABLE user_favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    procedure_id INTEGER REFERENCES procedures(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, procedure_id)
);

-- 검색 로그 (사용 패턴 분석용)
CREATE TABLE search_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    search_query VARCHAR(500),
    search_type VARCHAR(50), -- procedure, consultation
    results_count INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_procedures_number ON procedures(procedure_number);
CREATE INDEX idx_procedures_category ON procedures(category);
CREATE INDEX idx_procedures_active ON procedures(is_active);
CREATE INDEX idx_consultation_date ON consultation_summaries(consultation_date);
CREATE INDEX idx_prompt_templates_active ON prompt_templates(is_active);
CREATE INDEX idx_search_logs_user_date ON search_logs(user_id, created_at);

-- 기본 프롬프트 템플릿 삽입
INSERT INTO prompt_templates (name, version, template_text, created_from_guide) VALUES 
('기본 상담 요약 템플릿', 'v1.0', 
'다음은 고객과의 상담 녹취록입니다.  
고객의 성향, 고민, 시술 선택 과정을 정리하고, 상담자의 말투·전달력 평가까지 포함해 병원용 상담일지로 요약해줘.

아래 항목을 기준으로 요약해줘:

1. 🧑 고객 정보 요약  
- 이름(알려진 경우), 연령대, 피부 타입  
- 내원 목적 / 주요 피부 고민  

2. 🧠 고객 성격 및 상담 태도  
- 말투, 결정을 내리는 방식, 시술에 대한 태도  
- 예민한 점 또는 특별히 주의할 점  

3. 💉 관심 시술 및 실제 제안 시술  
- 고객이 직접 언급한 시술  
- 상담자가 제안한 시술  
- 그에 대한 고객 반응 (긍정/부정 여부 포함)  

4. ✅ 상담 결과 및 결정 사항  
- 실제 선택한 시술  
- 패키지, 업그레이드 여부  
- 상담 중 발생한 사전 약속 (예: 서비스 제공, 리뷰 조건, 무통 등 포함)  

5. 🔁 다음 상담 시 참고사항  
- 고객 특성상 주의할 포인트  
- 이어서 설명하거나 제안해야 할 항목  
- 고객이 보류한 항목 (향후 제안 가능성 있는 항목)  

6. 🗣 고객 워딩 및 인상적인 피드백  
- 실제 발언 중 기억해둘 문장  
- 상담자에게 준 반응 중 특징적인 표현  

7. 🎤 상담자 전달력 및 커뮤니케이션 평가  
※ AI는 다음 항목을 기준으로 상담자의 전달력 및 커뮤니케이션을 객관 평가해줘:  
- 상담자의 전반적인 태도 (친절함, 공감도, 리드력 등)  
- 말투의 안정성 (불필요한 추임새/버벅임 유무)  
- 말속도 및 템포 (빠르거나 느린 부분, 고객이 이해했는지 여부)  
- 전달력 (내용이 체계적으로 정리되어 있었는지, 반복 설명 여부 등)  
- 정적 여부 (불필요한 공백, 망설임, 설명의 흐름 끊김 등)

📌 상담자 평가 항목은 **구체적 수치 없이, 정성적 묘사**로 표현해줘.

상담 내용: {input_text}', 
TRUE);

-- 기본 관리자 계정 생성 (비밀번호: admin123, 실제 운영시 변경 필요)
INSERT INTO users (username, email, password_hash, role) VALUES 
('admin', 'admin@forte.com', '$2b$12$LQv3c1yqBWVHxkd0LQ4YGOg.qG5v5H5v5H5v5H5v5H5v5H5v5H5v5e', 'admin');

-- RTF 데이터 기반 시술 카테고리 정의
-- A: 주사 시술 (보톡스, 필러, 엘란세)
-- B: 레이저/RF 시술 (쥬베룩, 실피엄 X, 오리지오, 아이 오리지오, 울쎄라)  
-- C: 리프팅 시술 (티타늄 리프팅, 온다 리프팅, 실 리프팅)
-- D: 재생/체형/피부 관리 (엑소좀 & PRP, 바이오니클, 투스컬프, 기타 전문 시술들)

-- 시술 번호별 기본 카테고리 매핑 (RTF 분석 기반)
COMMENT ON COLUMN procedures.procedure_number IS '시술.rtf 파일의 [1]~[19] 번호';
COMMENT ON COLUMN procedures.category IS 'A:주사, B:레이저/RF, C:리프팅, D:재생/체형';
COMMENT ON COLUMN procedures.additional_info IS 'RTF 파싱된 JSON 데이터 (브랜드, 용량, 효과 등)';