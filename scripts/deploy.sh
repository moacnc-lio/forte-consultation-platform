#!/bin/bash

# Forte 상담 플랫폼 GCP 배포 스크립트
# Usage: ./deploy.sh [환경] [GCP_PROJECT_ID]
# Example: ./deploy.sh production forte-consultation-12345

set -e  # 에러 발생시 스크립트 중단

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로깅 함수
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 변수 설정
ENVIRONMENT=${1:-production}
GCP_PROJECT=${2}
GCP_REGION="asia-northeast3"  # 서울 리전
DB_INSTANCE_NAME="forte-db"
BACKEND_SERVICE_NAME="forte-api"
FRONTEND_SERVICE_NAME="forte-web"

# 프로젝트 ID 확인
if [ -z "$GCP_PROJECT" ]; then
    log_error "GCP 프로젝트 ID를 입력해주세요"
    log_info "사용법: ./deploy.sh [환경] [GCP_PROJECT_ID]"
    exit 1
fi

log_info "🚀 Forte 상담 플랫폼 배포 시작"
log_info "환경: $ENVIRONMENT"
log_info "GCP 프로젝트: $GCP_PROJECT"
log_info "리전: $GCP_REGION"

# 1. GCP 프로젝트 설정
log_info "📋 1단계: GCP 프로젝트 설정"
gcloud config set project $GCP_PROJECT
gcloud config set run/region $GCP_REGION

# 필요한 API 활성화
log_info "🔌 필요한 GCP API 활성화 중..."
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    sql-component.googleapis.com \
    sqladmin.googleapis.com \
    secretmanager.googleapis.com

# 2. Cloud SQL 인스턴스 생성 (존재하지 않는 경우)
log_info "🗄️ 2단계: Cloud SQL 설정"

if ! gcloud sql instances describe $DB_INSTANCE_NAME --quiet 2>/dev/null; then
    log_info "Cloud SQL 인스턴스 생성 중..."
    gcloud sql instances create $DB_INSTANCE_NAME \
        --database-version=POSTGRES_15 \
        --tier=db-f1-micro \
        --region=$GCP_REGION \
        --storage-type=SSD \
        --storage-size=10GB \
        --storage-auto-increase
    log_success "Cloud SQL 인스턴스 생성 완료"
else
    log_info "Cloud SQL 인스턴스가 이미 존재합니다"
fi

# 데이터베이스 생성
if ! gcloud sql databases describe forte_db --instance=$DB_INSTANCE_NAME --quiet 2>/dev/null; then
    log_info "데이터베이스 생성 중..."
    gcloud sql databases create forte_db --instance=$DB_INSTANCE_NAME
    log_success "데이터베이스 생성 완료"
fi

# 데이터베이스 사용자 생성 (비밀번호는 Secret Manager에서 관리)
if ! gcloud sql users describe forte --instance=$DB_INSTANCE_NAME --quiet 2>/dev/null; then
    log_info "데이터베이스 사용자 생성 중..."
    DB_PASSWORD=$(openssl rand -base64 32)
    gcloud sql users create forte \
        --instance=$DB_INSTANCE_NAME \
        --password=$DB_PASSWORD
    
    # Secret Manager에 비밀번호 저장
    echo -n $DB_PASSWORD | gcloud secrets create db-password --data-file=-
    log_success "데이터베이스 사용자 생성 및 비밀번호 저장 완료"
fi

# 3. Secret Manager에 환경 변수 저장
log_info "🔐 3단계: Secret Manager 설정"

# 필요한 시크릿들 확인 및 생성 (이미 존재하지 않는 경우만)
create_secret_if_not_exists() {
    local secret_name=$1
    local secret_value=$2
    
    if ! gcloud secrets describe $secret_name --quiet 2>/dev/null; then
        echo -n "$secret_value" | gcloud secrets create $secret_name --data-file=-
        log_info "시크릿 '$secret_name' 생성 완료"
    else
        log_info "시크릿 '$secret_name'이 이미 존재합니다"
    fi
}

# 기본 시크릿 생성 (실제 값은 수동으로 설정해야 함)
create_secret_if_not_exists "secret-key" "$(openssl rand -base64 64)"
create_secret_if_not_exists "openai-api-key" "sk-your-openai-key-here"
create_secret_if_not_exists "gemini-api-key" "your-gemini-key-here"

# 4. 백엔드 빌드 및 배포
log_info "🏗️ 4단계: 백엔드 빌드 및 배포"

cd backend
gcloud builds submit \
    --tag gcr.io/$GCP_PROJECT/$BACKEND_SERVICE_NAME:latest \
    --file Dockerfile.prod .

# 백엔드 Cloud Run 서비스 배포
gcloud run deploy $BACKEND_SERVICE_NAME \
    --image gcr.io/$GCP_PROJECT/$BACKEND_SERVICE_NAME:latest \
    --platform managed \
    --region $GCP_REGION \
    --allow-unauthenticated \
    --set-env-vars "APP_ENV=production" \
    --set-env-vars "GCP_PROJECT=$GCP_PROJECT" \
    --set-env-vars "GCP_REGION=$GCP_REGION" \
    --set-env-vars "INSTANCE_CONNECTION_NAME=$GCP_PROJECT:$GCP_REGION:$DB_INSTANCE_NAME" \
    --set-secrets "SECRET_KEY=secret-key:latest" \
    --set-secrets "OPENAI_API_KEY=openai-api-key:latest" \
    --set-secrets "GEMINI_API_KEY=gemini-api-key:latest" \
    --set-secrets "DB_PASSWORD=db-password:latest" \
    --add-cloudsql-instances $GCP_PROJECT:$GCP_REGION:$DB_INSTANCE_NAME \
    --memory 1Gi \
    --cpu 1 \
    --max-instances 10 \
    --concurrency 80

cd ..
log_success "백엔드 배포 완료"

# 백엔드 서비스 URL 가져오기
BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE_NAME --region=$GCP_REGION --format='value(status.url)')
log_info "백엔드 서비스 URL: $BACKEND_URL"

# 5. 프론트엔드 빌드 및 배포
log_info "🌐 5단계: 프론트엔드 빌드 및 배포"

cd frontend

# 프론트엔드용 환경 변수 파일 생성
cat > .env.production.local << EOF
REACT_APP_API_URL=$BACKEND_URL
REACT_APP_ENV=production
REACT_APP_APP_NAME=포르테 시술 상담 지원 플랫폼
REACT_APP_VERSION=1.0.0
REACT_APP_DEBUG=false
EOF

# 프론트엔드 빌드 및 배포
gcloud builds submit \
    --tag gcr.io/$GCP_PROJECT/$FRONTEND_SERVICE_NAME:latest \
    --file Dockerfile.prod .

# 프론트엔드 Cloud Run 서비스 배포
gcloud run deploy $FRONTEND_SERVICE_NAME \
    --image gcr.io/$GCP_PROJECT/$FRONTEND_SERVICE_NAME:latest \
    --platform managed \
    --region $GCP_REGION \
    --allow-unauthenticated \
    --set-env-vars "BACKEND_SERVICE_URL=$BACKEND_URL" \
    --memory 512Mi \
    --cpu 1 \
    --max-instances 5 \
    --concurrency 1000

cd ..
log_success "프론트엔드 배포 완료"

# 프론트엔드 서비스 URL 가져오기
FRONTEND_URL=$(gcloud run services describe $FRONTEND_SERVICE_NAME --region=$GCP_REGION --format='value(status.url)')

# 6. 데이터베이스 마이그레이션 실행
log_info "🗃️ 6단계: 데이터베이스 마이그레이션"

# 일회성 작업으로 마이그레이션 실행
gcloud run jobs create db-migration \
    --image gcr.io/$GCP_PROJECT/$BACKEND_SERVICE_NAME:latest \
    --region $GCP_REGION \
    --set-env-vars "APP_ENV=production" \
    --set-env-vars "GCP_PROJECT=$GCP_PROJECT" \
    --set-env-vars "INSTANCE_CONNECTION_NAME=$GCP_PROJECT:$GCP_REGION:$DB_INSTANCE_NAME" \
    --set-secrets "DB_PASSWORD=db-password:latest" \
    --add-cloudsql-instances $GCP_PROJECT:$GCP_REGION:$DB_INSTANCE_NAME \
    --command "python" \
    --args "seed_procedures.py" \
    --memory 1Gi \
    --cpu 1 || true

# 마이그레이션 실행
gcloud run jobs execute db-migration --region $GCP_REGION --wait || true

log_success "데이터베이스 마이그레이션 완료"

# 7. 배포 완료 및 정보 출력
log_success "🎉 배포 완료!"
echo ""
echo "==================================="
echo "🚀 배포 정보"
echo "==================================="
echo "프론트엔드 URL: $FRONTEND_URL"
echo "백엔드 API URL: $BACKEND_URL"
echo "GCP 프로젝트: $GCP_PROJECT"
echo "리전: $GCP_REGION"
echo "==================================="
echo ""

log_info "다음 단계:"
log_warning "1. Secret Manager에서 실제 API 키들을 설정하세요:"
log_warning "   - openai-api-key: OpenAI API 키"
log_warning "   - gemini-api-key: Google Gemini API 키"
log_warning "2. 도메인을 연결하고 SSL 인증서를 설정하세요"
log_warning "3. 프론트엔드에서 API 연결을 테스트하세요"

log_success "배포 스크립트 실행 완료! 🚀"