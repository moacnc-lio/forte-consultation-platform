#!/bin/bash

# Forte 상담 플랫폼 수동 배포 스크립트
# Usage: ./manual-deploy.sh

set -e

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

# 프로젝트 설정
GCP_PROJECT="moa-robo"
GCP_REGION="asia-northeast3"

log_info "🚀 Forte 수동 배포 시작"
log_info "프로젝트: $GCP_PROJECT"
log_info "리전: $GCP_REGION"

# 1. 프로젝트 설정
log_info "📋 1단계: GCP 프로젝트 설정"
gcloud config set project $GCP_PROJECT
gcloud config set run/region $GCP_REGION

# 2. 백엔드 배포
log_info "🏗️ 2단계: 백엔드 배포"
gcloud run deploy forte-api \
    --image gcr.io/moa-robo/forte-api:v4 \
    --platform managed \
    --region $GCP_REGION \
    --allow-unauthenticated \
    --set-env-vars "APP_ENV=production,GCP_PROJECT=$GCP_PROJECT,GCP_REGION=$GCP_REGION,INSTANCE_CONNECTION_NAME=$GCP_PROJECT:$GCP_REGION:forte-db" \
    --set-secrets "SECRET_KEY=secret-key:latest,OPENAI_API_KEY=openai-api-key:latest,GEMINI_API_KEY=gemini-api-key:latest,DB_PASSWORD=db-password:latest" \
    --add-cloudsql-instances $GCP_PROJECT:$GCP_REGION:forte-db \
    --memory 1Gi \
    --cpu 1 \
    --max-instances 10 \
    --timeout 900 \
    --project=$GCP_PROJECT

# 3. 백엔드 URL 확인
log_info "🔗 3단계: 백엔드 URL 확인"
BACKEND_URL=$(gcloud run services describe forte-api --region=$GCP_REGION --format='value(status.url)' --project=$GCP_PROJECT)
log_success "백엔드 URL: $BACKEND_URL"

# 4. 헬스체크
log_info "🏥 4단계: 헬스체크"
sleep 10
if curl -f $BACKEND_URL/health; then
    log_success "백엔드 헬스체크 성공"
else
    log_warning "백엔드 헬스체크 실패 - 수동으로 확인 필요"
fi

# 5. 데이터베이스 초기화
log_info "🗄️ 5단계: 데이터베이스 초기화"
if curl -X POST $BACKEND_URL/api/init-db; then
    log_success "데이터베이스 초기화 성공"
else
    log_warning "데이터베이스 초기화 실패 - 수동으로 실행 필요"
fi

# 6. 프론트엔드 환경변수 및 빌드
log_info "🌐 6단계: 프론트엔드 빌드 준비"
cd frontend

# 프론트엔드 환경변수 파일 생성
cat > .env.production.local << EOF
REACT_APP_API_URL=$BACKEND_URL
REACT_APP_ENV=production
REACT_APP_APP_NAME=포르테 시술 상담 지원 플랫폼
REACT_APP_VERSION=1.0.0
REACT_APP_DEBUG=false
EOF

log_success "프론트엔드 환경변수 설정 완료"

# 7. 프론트엔드 빌드 및 배포
log_info "🎨 7단계: 프론트엔드 빌드 및 배포"
gcloud builds submit \
    --tag gcr.io/$GCP_PROJECT/forte-web:latest \
    --file Dockerfile.prod . \
    --project=$GCP_PROJECT

# 8. 프론트엔드 Cloud Run 배포
log_info "📱 8단계: 프론트엔드 서비스 배포"
gcloud run deploy forte-web \
    --image gcr.io/$GCP_PROJECT/forte-web:latest \
    --platform managed \
    --region $GCP_REGION \
    --allow-unauthenticated \
    --set-env-vars "BACKEND_SERVICE_URL=$BACKEND_URL" \
    --memory 512Mi \
    --cpu 1 \
    --max-instances 5 \
    --project=$GCP_PROJECT

cd ..

# 9. 프론트엔드 URL 확인
FRONTEND_URL=$(gcloud run services describe forte-web --region=$GCP_REGION --format='value(status.url)' --project=$GCP_PROJECT)

# 10. 배포 완료 정보 출력
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
echo "   - openai-api-key: OpenAI API 키"
echo "   - gemini-api-key: Google Gemini API 키"
log_warning "2. 프론트엔드에서 API 연결을 테스트하세요"
log_warning "3. 도메인 연결이 필요한 경우 DNS 설정을 진행하세요"

log_success "수동 배포 완료! 🚀"