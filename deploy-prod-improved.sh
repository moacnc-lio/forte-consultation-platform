#!/bin/bash

# Forte 상담 플랫폼 실서버 배포 스크립트 (개선된 버전)
# Usage: ./deploy-prod-improved.sh

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 로그 함수
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 기본 설정
PROJECT_ID=${GCP_PROJECT:-"moa-robo"}
REGION=${GCP_REGION:-"asia-northeast3"}
BACKEND_SERVICE="forte-api"
FRONTEND_SERVICE="forte-web"
DB_INSTANCE="forte-db"

# 환경설정 로드
load_environment() {
    log_info "환경설정 로드 중..."
    
    if [ -f ".env.production" ]; then
        source .env.production
        log_success "환경설정 로드 완료"
    else
        log_error ".env.production 파일이 없습니다."
        exit 1
    fi
}

# GCP 설정 확인
check_gcp() {
    log_info "GCP 설정 확인 중..."

    # gcloud CLI 설치 확인
    if ! command -v gcloud &> /dev/null; then
        log_error "gcloud CLI가 설치되지 않았습니다."
        echo "https://cloud.google.com/sdk/docs/install 에서 설치하세요."
        exit 1
    fi

    # 로그인 확인
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
        log_error "GCP에 로그인되지 않았습니다."
        echo "gcloud auth login 을 실행하세요."
        exit 1
    fi

    log_success "GCP 설정 확인 완료"
}

# 프로젝트 설정
setup_project() {
    log_info "프로젝트 설정 중..."

    # 프로젝트 설정
    gcloud config set project $PROJECT_ID --quiet
    gcloud config set run/region $REGION --quiet

    # 필요한 API 활성화 (이미 활성화된 경우 무시)
    log_info "필요한 API 활성화 확인 중..."
    gcloud services enable run.googleapis.com --quiet 2>/dev/null || true
    gcloud services enable cloudbuild.googleapis.com --quiet 2>/dev/null || true
    gcloud services enable sql-component.googleapis.com --quiet 2>/dev/null || true
    gcloud services enable secretmanager.googleapis.com --quiet 2>/dev/null || true

    log_success "프로젝트 설정 완료"
}

# 배포 전 검증
pre_deploy_check() {
    log_info "배포 전 검증 실행 중..."

    # 필수 파일 확인
    local required_files=(
        "backend/requirements.txt"
        "backend/Dockerfile.prod"
        "backend/app/main.py"
        "frontend/package.json"
        "frontend/Dockerfile.prod"
        ".env.production"
    )

    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            log_error "필수 파일이 없습니다: $file"
            exit 1
        fi
    done

    # Cloud SQL 인스턴스 확인
    if ! gcloud sql instances describe $DB_INSTANCE --quiet &>/dev/null; then
        log_error "Cloud SQL 인스턴스 '$DB_INSTANCE'가 존재하지 않습니다."
        log_error "먼저 setup-gcp.sh를 실행하여 인프라를 설정하세요."
        exit 1
    fi

    # Secret Manager 시크릿 확인
    local required_secrets=("secret-key" "db-password" "openai-api-key" "gemini-api-key")
    for secret in "${required_secrets[@]}"; do
        if ! gcloud secrets versions list $secret --limit=1 --quiet &>/dev/null; then
            log_warning "Secret '$secret'이 존재하지 않습니다. 기본값으로 생성합니다."
            echo -n "default-value" | gcloud secrets create $secret --data-file=- --quiet 2>/dev/null || true
        fi
    done

    log_success "배포 전 검증 완료"
}

# 백엔드 배포
deploy_backend() {
    log_info "백엔드 배포 시작..."

    cd backend

    # 프로덕션 태그 생성
    PROD_TAG="prod-$(date +%Y%m%d-%H%M%S)"
    
    # Dockerfile 준비
    cp Dockerfile.prod Dockerfile

    # Docker 이미지 빌드 (Cloud Build 사용)
    log_info "백엔드 Docker 이미지 빌드 중..."
    if ! gcloud builds submit \
        --tag gcr.io/$PROJECT_ID/$BACKEND_SERVICE:latest \
        --project=$PROJECT_ID \
        --quiet .; then
        log_error "백엔드 빌드 실패"
        exit 1
    fi

    # 이미지 태깅
    gcloud container images add-tag \
        gcr.io/$PROJECT_ID/$BACKEND_SERVICE:latest \
        gcr.io/$PROJECT_ID/$BACKEND_SERVICE:$PROD_TAG \
        --project=$PROJECT_ID --quiet

    # Cloud Run 배포
    log_info "백엔드 Cloud Run 배포 중..."
    if ! gcloud run deploy $BACKEND_SERVICE \
        --image gcr.io/$PROJECT_ID/$BACKEND_SERVICE:$PROD_TAG \
        --platform managed \
        --region $REGION \
        --allow-unauthenticated \
        --set-env-vars "APP_ENV=production,GCP_PROJECT=$PROJECT_ID,GCP_REGION=$REGION,DB_INSTANCE=$DB_INSTANCE,INSTANCE_CONNECTION_NAME=$PROJECT_ID:$REGION:$DB_INSTANCE,ALLOWED_ORIGINS=https://forte-web-hhlhhgenaq-du.a.run.app" \
        --set-secrets "SECRET_KEY=secret-key:latest,OPENAI_API_KEY=openai-api-key:latest,GEMINI_API_KEY=gemini-api-key:latest,DB_PASSWORD=db-password:latest" \
        --add-cloudsql-instances $PROJECT_ID:$REGION:$DB_INSTANCE \
        --memory 2Gi \
        --cpu 2 \
        --max-instances 20 \
        --min-instances 1 \
        --concurrency 1000 \
        --timeout 900 \
        --project=$PROJECT_ID \
        --quiet; then
        log_error "백엔드 배포 실패"
        exit 1
    fi

    # 백엔드 URL 가져오기
    BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE --region=$REGION --format='value(status.url)' --project=$PROJECT_ID)
    export BACKEND_URL

    cd ..
    log_success "백엔드 배포 완료: $BACKEND_URL"
}

# 백엔드 헬스체크
check_backend_health() {
    log_info "백엔드 헬스체크 시작..."
    
    sleep 5
    local attempts=0
    local max_attempts=3

    while [ $attempts -lt $max_attempts ]; do
        if curl -f "$BACKEND_URL/health" --max-time 10 &>/dev/null; then
            log_success "백엔드 헬스체크 성공"
            return 0
        else
            attempts=$((attempts + 1))
            log_warning "헬스체크 실패 (시도 $attempts/$max_attempts)"
            if [ $attempts -lt $max_attempts ]; then
                sleep 5
            fi
        fi
    done

    log_error "백엔드 헬스체크 실패 - 배포를 중단합니다"
    log_error "로그 확인: https://console.cloud.google.com/run/detail/$REGION/$BACKEND_SERVICE/logs?project=$PROJECT_ID"
    exit 1
}

# 프론트엔드 배포
deploy_frontend() {
    log_info "프론트엔드 배포 시작..."

    if [ -z "$BACKEND_URL" ]; then
        log_error "BACKEND_URL이 설정되지 않았습니다."
        exit 1
    fi

    cd frontend

    # 프론트엔드 환경변수 설정
    cat > .env.production.local << EOF
REACT_APP_API_URL=$BACKEND_URL
REACT_APP_ENV=production
REACT_APP_APP_NAME=포르테 시술 상담 지원 플랫폼
REACT_APP_VERSION=1.0.0
REACT_APP_DEBUG=false
EOF

    # 프론트엔드 태그 생성
    FRONTEND_TAG="prod-$(date +%Y%m%d-%H%M%S)"
    
    # Dockerfile 준비
    cp Dockerfile.prod Dockerfile

    # Docker 이미지 빌드
    log_info "프론트엔드 Docker 이미지 빌드 중..."
    if ! gcloud builds submit \
        --tag gcr.io/$PROJECT_ID/$FRONTEND_SERVICE:latest \
        --project=$PROJECT_ID \
        --quiet .; then
        log_error "프론트엔드 빌드 실패"
        exit 1
    fi

    # 이미지 태깅
    gcloud container images add-tag \
        gcr.io/$PROJECT_ID/$FRONTEND_SERVICE:latest \
        gcr.io/$PROJECT_ID/$FRONTEND_SERVICE:$FRONTEND_TAG \
        --project=$PROJECT_ID --quiet

    # Cloud Run 배포
    log_info "프론트엔드 Cloud Run 배포 중..."
    if ! gcloud run deploy $FRONTEND_SERVICE \
        --image gcr.io/$PROJECT_ID/$FRONTEND_SERVICE:$FRONTEND_TAG \
        --platform managed \
        --region $REGION \
        --allow-unauthenticated \
        --set-env-vars "BACKEND_SERVICE_URL=$BACKEND_URL" \
        --memory 1Gi \
        --cpu 1 \
        --max-instances 10 \
        --min-instances 1 \
        --concurrency 1000 \
        --project=$PROJECT_ID \
        --quiet; then
        log_error "프론트엔드 배포 실패"
        exit 1
    fi

    # 프론트엔드 URL 가져오기
    FRONTEND_URL=$(gcloud run services describe $FRONTEND_SERVICE --region=$REGION --format='value(status.url)' --project=$PROJECT_ID)

    # 백엔드 CORS 설정을 실제 프론트엔드 URL로 업데이트
    log_info "백엔드 CORS 설정을 실제 프론트엔드 URL로 업데이트 중..."
    gcloud run services update $BACKEND_SERVICE \
        --update-env-vars "ALLOWED_ORIGINS=$FRONTEND_URL" \
        --region=$REGION \
        --project=$PROJECT_ID \
        --quiet

    cd ..
    log_success "프론트엔드 배포 완료: $FRONTEND_URL"
    log_success "백엔드 CORS 설정 업데이트 완료: $FRONTEND_URL"
}

# 프론트엔드 헬스체크
check_frontend_health() {
    log_info "프론트엔드 헬스체크 시작..."
    
    sleep 5
    if curl -f "$FRONTEND_URL" --max-time 10 &>/dev/null; then
        log_success "프론트엔드 헬스체크 성공"
    else
        log_warning "프론트엔드 헬스체크 실패 - 수동으로 확인 필요"
        log_warning "URL: $FRONTEND_URL"
    fi
}

# 배포 후 정리
post_deploy_cleanup() {
    log_info "배포 후 정리 중..."
    
    # 임시 파일 정리
    [ -f "backend/Dockerfile" ] && rm -f backend/Dockerfile
    [ -f "frontend/Dockerfile" ] && rm -f frontend/Dockerfile
    [ -f "frontend/.env.production.local" ] && rm -f frontend/.env.production.local
    
    log_success "정리 완료"
}

# 배포 결과 출력
print_deployment_summary() {
    echo ""
    log_success "🎉 실서버 배포 완료!"
    echo ""
    echo "===================================="
    echo "🚀 실서버 정보"
    echo "===================================="
    echo "환경: production"
    echo "프로젝트: $PROJECT_ID"
    echo "리전: $REGION"
    echo ""
    echo "📱 서비스 URL:"
    echo "프론트엔드: $FRONTEND_URL"
    echo "백엔드 API: $BACKEND_URL"
    echo ""
    echo "🗄️ 데이터베이스:"
    echo "인스턴스: $DB_INSTANCE"
    echo "연결: $PROJECT_ID:$REGION:$DB_INSTANCE"
    echo ""
    echo "📊 리소스 설정:"
    echo "백엔드: 2Gi 메모리, 2 CPU, 최대 20 인스턴스"
    echo "프론트엔드: 1Gi 메모리, 1 CPU, 최대 10 인스턴스"
    echo "===================================="
    echo ""
    
    log_info "📋 다음 단계:"
    echo "1. 서비스 동작 확인: $FRONTEND_URL"
    echo "2. API 테스트: $BACKEND_URL/docs"
    echo "3. Secret Manager에서 실제 API 키 설정"
    echo "4. 도메인 연결 및 SSL 인증서 설정 (선택사항)"
    echo "5. 모니터링 및 로깅 설정"
}

# 에러 핸들러
error_handler() {
    local line_number=$1
    log_error "스크립트 실행 중 오류 발생 (라인: $line_number)"
    log_error "로그를 확인하고 문제를 해결한 후 다시 시도하세요."
    
    # 정리 작업
    post_deploy_cleanup 2>/dev/null || true
    exit 1
}

# 에러 트랩 설정
trap 'error_handler $LINENO' ERR

# 메인 실행
main() {
    echo "🚀 Forte 상담 플랫폼 실서버 배포 시작"
    echo ""
    echo "📋 배포 설정:"
    echo "   프로젝트 ID: $PROJECT_ID"
    echo "   리전:       $REGION"
    echo "   백엔드:     $BACKEND_SERVICE"
    echo "   프론트엔드:  $FRONTEND_SERVICE"
    echo "   데이터베이스: $DB_INSTANCE"
    echo ""

    load_environment
    check_gcp
    setup_project
    pre_deploy_check
    
    log_warning "⚠️  실서버 배포를 시작합니다."
    log_warning "이 작업은 프로덕션 환경에 영향을 줍니다."
    
    deploy_backend
    check_backend_health
    deploy_frontend
    check_frontend_health
    post_deploy_cleanup
    print_deployment_summary
    
    log_success "배포 완료! 🚀"
}

# 스크립트 실행
main "$@"