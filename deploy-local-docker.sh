#!/bin/bash

# Forte 로컬 Docker 빌드 배포 스크립트 (가장 빠른 방식)
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

# 기본 설정
PROJECT_ID="moa-robo"
REGION="asia-northeast3"
BACKEND_SERVICE="forte-api"
FRONTEND_SERVICE="forte-web"

echo "🚀 Forte 로컬 Docker 빌드 배포 시작"
echo "   ⚡ 예상 시간: 2-3분 (기존 8-10분에서 대폭 단축)"
echo ""

# Docker 환경 확인
check_docker() {
    log_info "Docker 환경 확인 중..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker가 설치되지 않았습니다."
        exit 1
    fi
    
    # Docker Desktop 시작 대기
    local attempts=0
    while [ $attempts -lt 10 ]; do
        if docker info &> /dev/null; then
            log_success "Docker 데몬 연결 성공"
            break
        else
            log_warning "Docker Desktop 시작 대기 중... ($((attempts + 1))/10)"
            sleep 3
            attempts=$((attempts + 1))
        fi
    done
    
    if [ $attempts -eq 10 ]; then
        log_error "Docker Desktop이 시작되지 않았습니다. Docker Desktop을 실행하고 다시 시도하세요."
        exit 1
    fi
    
    # GCR 인증 설정
    log_info "Docker 인증 설정 중..."
    gcloud auth configure-docker --quiet
    
    log_success "Docker 환경 확인 완료"
}

# 프로젝트 설정
setup_gcp() {
    log_info "GCP 프로젝트 설정 중..."
    gcloud config set project $PROJECT_ID --quiet
    gcloud config set run/region $REGION --quiet
    log_success "GCP 설정 완료"
}

# 백엔드 로컬 빌드 및 배포
deploy_backend_local() {
    log_info "🏗️ 백엔드 로컬 Docker 빌드 시작..."
    
    cd backend
    cp Dockerfile.prod Dockerfile
    
    # 로컬에서 Docker 빌드 (캐시 활용)
    log_info "백엔드 Docker 이미지 빌드 중... (캐시 활용으로 빠름)"
    docker build \
        --platform linux/amd64 \
        -t gcr.io/$PROJECT_ID/$BACKEND_SERVICE:latest \
        . --no-cache
    
    # Container Registry에 푸시
    log_info "백엔드 이미지 푸시 중..."
    docker push gcr.io/$PROJECT_ID/$BACKEND_SERVICE:latest
    
    # Cloud Run에 배포
    log_info "백엔드 Cloud Run 배포 중..."
    gcloud run deploy $BACKEND_SERVICE \
        --image gcr.io/$PROJECT_ID/$BACKEND_SERVICE:latest \
        --platform managed \
        --region $REGION \
        --allow-unauthenticated \
        --set-env-vars "APP_ENV=production,GCP_PROJECT=$PROJECT_ID,GCP_REGION=$REGION,DB_INSTANCE=forte-db,INSTANCE_CONNECTION_NAME=$PROJECT_ID:$REGION:forte-db" \
        --set-secrets "SECRET_KEY=secret-key:latest,OPENAI_API_KEY=openai-api-key:latest,GEMINI_API_KEY=gemini-api-key:latest,DB_PASSWORD=db-password:latest" \
        --add-cloudsql-instances $PROJECT_ID:$REGION:forte-db \
        --memory 2Gi \
        --cpu 2 \
        --max-instances 20 \
        --min-instances 1 \
        --concurrency 1000 \
        --timeout 900 \
        --quiet
    
    # 백엔드 URL 가져오기
    BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE --region=$REGION --format='value(status.url)')
    export BACKEND_URL
    
    cd ..
    log_success "백엔드 배포 완료: $BACKEND_URL"
}

# 백엔드 헬스체크
check_backend_health() {
    log_info "백엔드 헬스체크 중..."
    sleep 5
    
    if curl -f "$BACKEND_URL/health" --max-time 15 &>/dev/null; then
        log_success "백엔드 헬스체크 성공"
    else
        log_warning "헬스체크 실패 - 수동으로 확인 필요: $BACKEND_URL/health"
    fi
}

# 프론트엔드 로컬 빌드 및 배포
deploy_frontend_local() {
    log_info "🎨 프론트엔드 로컬 Docker 빌드 시작..."
    
    cd frontend
    
    # 환경변수 설정
    cat > .env.production.local << EOF
REACT_APP_API_URL=$BACKEND_URL
REACT_APP_ENV=production
REACT_APP_APP_NAME=포르테 시술 상담 지원 플랫폼
REACT_APP_VERSION=1.0.0
REACT_APP_DEBUG=false
EOF
    
    cp Dockerfile.prod Dockerfile
    
    # 로컬에서 Docker 빌드
    log_info "프론트엔드 Docker 이미지 빌드 중... (캐시 활용으로 빠름)"
    docker build \
        --platform linux/amd64 \
        -t gcr.io/$PROJECT_ID/$FRONTEND_SERVICE:latest \
        . --no-cache
    
    # Container Registry에 푸시
    log_info "프론트엔드 이미지 푸시 중..."
    docker push gcr.io/$PROJECT_ID/$FRONTEND_SERVICE:latest
    
    # Cloud Run에 배포
    log_info "프론트엔드 Cloud Run 배포 중..."
    gcloud run deploy $FRONTEND_SERVICE \
        --image gcr.io/$PROJECT_ID/$FRONTEND_SERVICE:latest \
        --platform managed \
        --region $REGION \
        --allow-unauthenticated \
        --set-env-vars "BACKEND_SERVICE_URL=$BACKEND_URL" \
        --memory 1Gi \
        --cpu 1 \
        --max-instances 10 \
        --min-instances 1 \
        --concurrency 1000 \
        --quiet
    
    # 프론트엔드 URL 가져오기
    FRONTEND_URL=$(gcloud run services describe $FRONTEND_SERVICE --region=$REGION --format='value(status.url)')
    
    cd ..
    log_success "프론트엔드 배포 완료: $FRONTEND_URL"
}

# 정리 작업
cleanup() {
    log_info "정리 작업 중..."
    [ -f "backend/Dockerfile" ] && rm -f backend/Dockerfile
    [ -f "frontend/Dockerfile" ] && rm -f frontend/Dockerfile
    [ -f "frontend/.env.production.local" ] && rm -f frontend/.env.production.local
    log_success "정리 완료"
}

# 배포 결과 출력
print_summary() {
    echo ""
    log_success "🎉 로컬 Docker 빌드 배포 완료!"
    echo ""
    echo "===================================="
    echo "🚀 배포 결과"
    echo "===================================="
    echo "프론트엔드: $FRONTEND_URL"
    echo "백엔드 API: $BACKEND_URL"
    echo ""
    echo "⚡ 배포 방식: 로컬 Docker 빌드"
    echo "📊 예상 시간 단축: 8-10분 → 2-3분"
    echo "🔧 Docker 캐시 활용으로 빠른 빌드"
    echo "===================================="
    echo ""
    log_info "🧪 테스트:"
    echo "1. 프론트엔드 접속: $FRONTEND_URL"
    echo "2. 백엔드 API 문서: $BACKEND_URL/docs"
    echo "3. 헬스체크: $BACKEND_URL/health"
}

# 메인 실행
main() {
    check_docker
    setup_gcp
    
    log_warning "⚠️  로컬 Docker 빌드로 실서버 배포를 시작합니다."
    echo "   🐳 기존 로컬 개발 컨테이너는 영향받지 않습니다."
    echo ""
    
    deploy_backend_local
    check_backend_health
    deploy_frontend_local
    cleanup
    print_summary
    
    log_success "배포 완료! 🚀"
}

# 에러 핸들러
trap 'log_error "배포 중 오류 발생"; cleanup; exit 1' ERR

# 스크립트 실행
main "$@"