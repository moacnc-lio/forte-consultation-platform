#!/bin/bash

# Forte 상담 플랫폼 개발 서버 배포 스크립트
# Usage: ./deploy-dev.sh

set -e

# 환경설정 로드
source .env.production

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 개발 환경 설정
ENVIRONMENT="development"
GCP_PROJECT="${GCP_PROJECT:-moa-robo}"
GCP_REGION="${GCP_REGION:-asia-northeast3}"
BACKEND_SERVICE="forte-api-dev"
FRONTEND_SERVICE="forte-web-dev"
DB_INSTANCE="forte-db-dev"

log_info "🚀 Forte 개발 서버 배포 시작"
log_info "환경: $ENVIRONMENT"
log_info "프로젝트: $GCP_PROJECT"
log_info "리전: $GCP_REGION"

# 1. 프로젝트 설정
log_info "📋 1단계: GCP 프로젝트 설정"
gcloud config set project $GCP_PROJECT
gcloud config set run/region $GCP_REGION

# 2. 개발용 Cloud SQL 인스턴스 확인/생성
log_info "🗄️ 2단계: 개발용 데이터베이스 설정"
if ! gcloud sql instances describe $DB_INSTANCE --quiet 2>/dev/null; then
    log_info "개발용 Cloud SQL 인스턴스 생성 중..."
    gcloud sql instances create $DB_INSTANCE \
        --database-version=POSTGRES_15 \
        --tier=db-f1-micro \
        --region=$GCP_REGION \
        --storage-type=SSD \
        --storage-size=10GB \
        --project=$GCP_PROJECT
    
    # 개발용 데이터베이스 생성
    gcloud sql databases create forte_db --instance=$DB_INSTANCE --project=$GCP_PROJECT
    
    # 개발용 사용자 생성
    DEV_DB_PASSWORD=$(openssl rand -base64 16)
    gcloud sql users create forte_dev \
        --instance=$DB_INSTANCE \
        --password=$DEV_DB_PASSWORD \
        --project=$GCP_PROJECT
    
    # Secret Manager에 개발용 비밀번호 저장
    echo -n $DEV_DB_PASSWORD | gcloud secrets create db-password-dev --data-file=- --project=$GCP_PROJECT
    log_success "개발용 데이터베이스 설정 완료"
else
    log_info "개발용 데이터베이스가 이미 존재합니다"
fi

# 3. 백엔드 빌드
log_info "🏗️ 3단계: 개발용 백엔드 빌드"
cd backend
cp Dockerfile.prod Dockerfile
gcloud builds submit \
    --tag gcr.io/$GCP_PROJECT/$BACKEND_SERVICE:latest \
    --project=$GCP_PROJECT .
cd ..

# 4. 백엔드 배포
log_info "🚀 4단계: 개발용 백엔드 배포"
gcloud run deploy $BACKEND_SERVICE \
    --image gcr.io/$GCP_PROJECT/$BACKEND_SERVICE:latest \
    --platform managed \
    --region $GCP_REGION \
    --allow-unauthenticated \
    --set-env-vars "APP_ENV=development,GCP_PROJECT=$GCP_PROJECT,GCP_REGION=$GCP_REGION,DB_INSTANCE=$DB_INSTANCE,INSTANCE_CONNECTION_NAME=$GCP_PROJECT:$GCP_REGION:$DB_INSTANCE,ALLOWED_ORIGINS=https://forte-web-dev-hhlhhgenaq-du.a.run.app" \
    --set-secrets "SECRET_KEY=secret-key:latest,OPENAI_API_KEY=openai-api-key:latest,GEMINI_API_KEY=gemini-api-key:latest,DB_PASSWORD=db-password-dev:latest" \
    --add-cloudsql-instances $GCP_PROJECT:$GCP_REGION:$DB_INSTANCE \
    --memory 512Mi \
    --cpu 0.5 \
    --max-instances 3 \
    --timeout 600 \
    --project=$GCP_PROJECT

# 5. 백엔드 URL 확인
DEV_BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE --region=$GCP_REGION --format='value(status.url)' --project=$GCP_PROJECT)
log_success "개발 백엔드 URL: $DEV_BACKEND_URL"

# 6. 헬스체크
log_info "🏥 5단계: 헬스체크"
sleep 10
if curl -f $DEV_BACKEND_URL/health; then
    log_success "백엔드 헬스체크 성공"
else
    log_warning "백엔드 헬스체크 실패 - 수동으로 확인 필요"
fi

# 7. 데이터베이스 초기화
log_info "🗃️ 6단계: 데이터베이스 초기화"
if curl -X POST $DEV_BACKEND_URL/api/init-db; then
    log_success "데이터베이스 초기화 성공"
else
    log_warning "데이터베이스 초기화 실패 - 수동으로 실행 필요"
fi

# 8. 프론트엔드 환경변수 설정
log_info "🌐 7단계: 개발용 프론트엔드 빌드 준비"
cd frontend

# 개발용 프론트엔드 환경변수 파일 생성
cat > .env.development.local << EOF
REACT_APP_API_URL=$DEV_BACKEND_URL
REACT_APP_ENV=development
REACT_APP_APP_NAME=포르테 시술 상담 지원 플랫폼 (개발)
REACT_APP_VERSION=1.0.0-dev
REACT_APP_DEBUG=true
EOF

log_success "개발용 프론트엔드 환경변수 설정 완료"

# 9. 프론트엔드 빌드 및 배포
log_info "🎨 8단계: 개발용 프론트엔드 빌드 및 배포"
cp Dockerfile.prod Dockerfile
gcloud builds submit \
    --tag gcr.io/$GCP_PROJECT/$FRONTEND_SERVICE:latest \
    --project=$GCP_PROJECT .

# 10. 프론트엔드 Cloud Run 배포
log_info "📱 9단계: 개발용 프론트엔드 서비스 배포"
gcloud run deploy $FRONTEND_SERVICE \
    --image gcr.io/$GCP_PROJECT/$FRONTEND_SERVICE:latest \
    --platform managed \
    --region $GCP_REGION \
    --allow-unauthenticated \
    --set-env-vars "BACKEND_SERVICE_URL=$DEV_BACKEND_URL" \
    --memory 256Mi \
    --cpu 0.5 \
    --max-instances 2 \
    --project=$GCP_PROJECT

cd ..

# 11. 프론트엔드 URL 확인
DEV_FRONTEND_URL=$(gcloud run services describe $FRONTEND_SERVICE --region=$GCP_REGION --format='value(status.url)' --project=$GCP_PROJECT)

# 12. 배포 완료 정보 출력
log_success "🎉 개발 서버 배포 완료!"
echo ""
echo "==================================="
echo "🚀 개발 서버 정보"
echo "==================================="
echo "환경: $ENVIRONMENT"
echo "프론트엔드 URL: $DEV_FRONTEND_URL"
echo "백엔드 API URL: $DEV_BACKEND_URL"
echo "데이터베이스: $DB_INSTANCE"
echo "GCP 프로젝트: $GCP_PROJECT"
echo "리전: $GCP_REGION"
echo "==================================="
echo ""

log_info "개발 서버 특징:"
echo "- 낮은 리소스 (메모리 512Mi/256Mi, CPU 0.5)"
echo "- 최대 인스턴스 제한 (백엔드 3개, 프론트엔드 2개)"
echo "- 디버그 모드 활성화"
echo "- 개발용 데이터베이스 사용"

log_success "개발 서버 배포 완료! 🚀"