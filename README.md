# 포르테 시술 상담 지원 플랫폼

PC 기반 의료/미용 시술 전문가용 통합 상담 지원 시스템

## 프로젝트 개요

- **목적**: 시술 가이드 참조 및 AI 기반 일본어→한국어 상담 요약
- **대상**: 의료/미용 시술 전문가, 상담 코디네이터
- **특징**: PC 최적화 데스크톱 웹 애플리케이션

## 기술 스택

### 백엔드
- Python 3.9+ / FastAPI
- PostgreSQL (GCP Cloud SQL)
- OpenAI GPT-4o API
- JWT 인증

### 프론트엔드
- React 18+ / TypeScript
- Material-UI (MUI) v5
- React Query + Zustand
- PC 최적화 레이아웃

### 인프라
- Google Cloud Platform (GCP)
- Docker + Cloud Run
- 수동 배포 스크립트

## 주요 기능

### 1. 시술 가이드 시스템
- 19개 시술 정보 데이터베이스 (시술.rtf 기반)
- 카테고리별 분류 (A: 주사, B: 레이저/RF, C: 리프팅, D: 재생/체형)
- 실시간 검색 및 필터링
- 시술 정보 CRUD 관리

### 2. AI 상담 요약
- 일본어 상담 내용 → 한국어 요약 (OpenAI GPT-4o)
- promptguide/guide.md 기반 프롬프트 관리
- 요약 히스토리 관리

## 프로젝트 구조

```
forte-consultation-platform/
├── backend/                    # FastAPI 백엔드
│   ├── app/
│   │   ├── api/               # API 라우터
│   │   ├── core/              # 핵심 설정
│   │   ├── models/            # 데이터베이스 모델
│   │   └── services/          # 비즈니스 로직
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                   # React 프론트엔드
│   ├── src/
│   │   ├── components/        # 재사용 컴포넌트
│   │   ├── pages/            # 페이지 컴포넌트
│   │   ├── services/         # API 서비스
│   │   └── stores/           # 상태 관리
│   ├── package.json
│   └── Dockerfile
├── deploy/                    # 배포 스크립트
├── docker-compose.yml         # 로컬 개발 환경
└── README.md
```

## 개발 환경 설정

### 1. 사전 요구사항
- Node.js 18+
- Python 3.9+
- Docker & Docker Compose
- PostgreSQL (로컬 또는 Docker)

### 2. 환경 변수 설정

⚠️ **보안 중요**: API 키와 민감한 정보는 환경 변수 파일에 저장하세요.

```bash
# .env.example을 복사해서 .env 파일 생성
cp .env.example .env

# .env 파일에 실제 값 입력
DATABASE_URL=postgresql://forte:forte123@postgres:5432/forte_db
SECRET_KEY=your-secret-key-here
GEMINI_API_KEY=your-gemini-api-key-here
OPENAI_API_KEY=your-openai-api-key-here
```

📌 **주의사항**:
- `.env` 파일은 절대 Git에 커밋하지 마세요
- API 키가 코드에 하드코딩되지 않도록 주의하세요
- 프로덕션 환경에서는 강력한 SECRET_KEY를 사용하세요

### 3. 로컬 개발 실행

#### Docker Compose 사용 (권장)
```bash
# 전체 스택 실행
docker-compose up -d

# 백엔드: http://localhost:8000
# 프론트엔드: http://localhost:3000
# PostgreSQL: localhost:5432
```

#### 개별 실행
```bash
# 백엔드
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# 프론트엔드
cd frontend
npm install
npm start
```

### 4. 데이터베이스 초기화
```bash
# PostgreSQL 데이터베이스 생성
createdb forte_db

# 스키마 적용
psql forte_db < backend/database_schema.sql
```

## API 문서

백엔드 실행 후 다음 URL에서 API 문서 확인:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 주요 API 엔드포인트

#### 시술 관련
- `GET /api/procedures/` - 시술 목록 조회
- `GET /api/procedures/{id}` - 시술 상세 조회
- `POST /api/procedures/` - 시술 생성
- `PUT /api/procedures/{id}` - 시술 수정
- `GET /api/procedures/search/` - 시술 검색

#### 상담 요약 관련
- `POST /api/summaries/generate` - AI 요약 생성
- `POST /api/summaries/` - 요약 저장
- `GET /api/summaries/` - 요약 목록 조회

## 배포 가이드

### GCP 배포 (수동)

#### 1. 사전 준비 및 환경 검증
```bash
cd deploy

# 환경 검증 (필수)
./validate-environment.sh
```

#### 2. GCP 리소스 초기 설정 (최초 1회)
```bash
# GCP 프로젝트 설정
gcloud auth login
gcloud config set project forte-consultation-platform

# GCP 리소스 생성 (Cloud SQL, Secret Manager 등)
./setup-gcp-resources.sh

# 데이터베이스 스키마 및 초기 데이터 설정
./setup-database.sh
```

#### 3. OpenAI API 키 설정 (선택적)
```bash
# AI 요약 기능을 사용하려면 OpenAI API 키 설정
echo "your-openai-api-key" | gcloud secrets create openai-api-key --data-file=-
```

#### 4. 애플리케이션 배포
```bash
# 전체 배포
./deploy-full.sh

# 또는 개별 배포
./deploy-backend.sh
./deploy-frontend.sh
```

#### 5. 배포 순서 (권장)
```bash
# 1. 백엔드 먼저 배포
./deploy-backend.sh

# 2. 백엔드 URL을 사용해 프론트엔드 배포
BACKEND_URL=$(gcloud run services describe forte-backend --region=asia-northeast1 --format="value(status.url)")
BACKEND_URL=$BACKEND_URL ./deploy-frontend.sh

# 3. CORS 설정 업데이트를 위해 백엔드 재배포
FRONTEND_URL=$(gcloud run services describe forte-frontend --region=asia-northeast1 --format="value(status.url)")
FRONTEND_URL=$FRONTEND_URL ./deploy-backend.sh
```

### 배포 후 확인
```bash
# Cloud Run 서비스 상태 확인
gcloud run services list --region=asia-northeast1

# 헬스체크
curl https://forte-backend-xxx.run.app/health
```

## 데이터 관리

### 시술 정보 초기화
RTF 파일 기반으로 시술 정보를 데이터베이스에 입력하는 프로세스는 수동으로 진행됩니다.

1. `시술.rtf` 파일 분석
2. 19개 시술별 데이터 구조화
3. API를 통한 데이터 입력
4. 카테고리별 분류 확인

### 프롬프트 관리
`promptguide/guide.md` 파일을 수정하면 상담 요약 프롬프트가 업데이트됩니다.

## 보안 고려사항

- JWT 토큰 기반 인증 (향후 구현)
- 환경 변수를 통한 민감 정보 관리
- GCP IAM 기반 권한 관리
- HTTPS 강제 (프로덕션)

## 성능 최적화

- PostgreSQL 인덱스 최적화
- React Query 캐싱
- Material-UI 코드 스플리팅
- GCP Cloud Run 자동 스케일링

## 개발 일정

- **Week 1-2**: 프로젝트 기반 구축 ✅
- **Week 3-4**: 시술 가이드 핵심 기능
- **Week 5-6**: AI 상담 요약 기본 기능

## 문의

개발 관련 문의: dev-team@forte.com