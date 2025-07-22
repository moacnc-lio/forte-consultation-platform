#!/bin/bash

# GCP 프로젝트 초기 설정 스크립트
# 사용법: ./setup-gcp.sh [PROJECT_ID]

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

# 프로젝트 ID 확인
PROJECT_ID=${1}
if [ -z "$PROJECT_ID" ]; then
    log_error "프로젝트 ID를 입력해주세요"
    log_info "사용법: ./setup-gcp.sh [PROJECT_ID]"
    exit 1
fi

log_info "🚀 GCP 프로젝트 초기 설정 시작"
log_info "프로젝트 ID: $PROJECT_ID"

# gcloud CLI 설치 확인
if ! command -v gcloud &> /dev/null; then
    log_error "gcloud CLI가 설치되지 않았습니다"
    log_info "다음 링크에서 설치하세요: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# 1. gcloud 인증 및 프로젝트 설정
log_info "🔐 1단계: gcloud 인증 및 프로젝트 설정"

# 로그인 (이미 로그인된 경우 스킵)
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q @; then
    log_info "gcloud 로그인이 필요합니다..."
    gcloud auth login
fi

# 프로젝트 존재 확인 및 생성
if ! gcloud projects describe $PROJECT_ID &>/dev/null; then
    log_warning "프로젝트 '$PROJECT_ID'가 존재하지 않습니다."
    read -p "새로운 프로젝트를 생성하시겠습니까? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        gcloud projects create $PROJECT_ID --name="Forte Consultation Platform"
        log_success "프로젝트 생성 완료"
    else
        log_error "프로젝트가 필요합니다. 배포를 중단합니다."
        exit 1
    fi
fi

# 프로젝트 설정
gcloud config set project $PROJECT_ID
log_success "프로젝트 설정 완료: $PROJECT_ID"

# 2. 결제 계정 연결 확인
log_info "💳 2단계: 결제 계정 연결 확인"
BILLING_ACCOUNT=$(gcloud billing accounts list --format="value(name)" --limit=1)

if [ -z "$BILLING_ACCOUNT" ]; then
    log_error "결제 계정이 없습니다. GCP 콘솔에서 결제 계정을 설정해주세요."
    log_info "https://console.cloud.google.com/billing"
    exit 1
fi

# 프로젝트에 결제 계정 연결
if ! gcloud billing projects describe $PROJECT_ID &>/dev/null; then
    gcloud billing projects link $PROJECT_ID --billing-account=$BILLING_ACCOUNT
    log_success "결제 계정 연결 완료"
else
    log_info "결제 계정이 이미 연결되어 있습니다"
fi

# 3. 필요한 API 활성화
log_info "🔌 3단계: 필요한 API 활성화"
REQUIRED_APIS=(
    "cloudbuild.googleapis.com"
    "run.googleapis.com" 
    "sql-component.googleapis.com"
    "sqladmin.googleapis.com"
    "secretmanager.googleapis.com"
    "container.googleapis.com"
    "cloudresourcemanager.googleapis.com"
)

for api in "${REQUIRED_APIS[@]}"; do
    if gcloud services list --enabled --filter="name:$api" --format="value(name)" | grep -q $api; then
        log_info "API $api는 이미 활성화되어 있습니다"
    else
        log_info "API $api 활성화 중..."
        gcloud services enable $api
        log_success "API $api 활성화 완료"
    fi
done

# 4. 기본 리전 설정
log_info "🌏 4단계: 기본 리전 설정"
gcloud config set run/region asia-northeast3  # 서울 리전
gcloud config set compute/region asia-northeast3
gcloud config set compute/zone asia-northeast3-a
log_success "기본 리전 설정 완료: 서울(asia-northeast3)"

# 5. 서비스 계정 생성 (배포용)
log_info "👤 5단계: 서비스 계정 설정"
SERVICE_ACCOUNT_NAME="forte-deploy"
SERVICE_ACCOUNT_EMAIL="$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com"

if ! gcloud iam service-accounts describe $SERVICE_ACCOUNT_EMAIL &>/dev/null; then
    gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
        --description="Forte 배포용 서비스 계정" \
        --display-name="Forte Deploy Service Account"
    log_success "서비스 계정 생성 완료"
else
    log_info "서비스 계정이 이미 존재합니다"
fi

# 서비스 계정에 필요한 권한 부여
REQUIRED_ROLES=(
    "roles/cloudbuild.builds.editor"
    "roles/run.admin"
    "roles/cloudsql.admin" 
    "roles/secretmanager.admin"
    "roles/iam.serviceAccountUser"
    "roles/storage.admin"
)

for role in "${REQUIRED_ROLES[@]}"; do
    gcloud projects add-iam-policy-binding $PROJECT_ID \
        --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
        --role="$role" \
        --quiet
done
log_success "서비스 계정 권한 설정 완료"

# 6. 설정 요약 출력
log_success "🎉 GCP 초기 설정 완료!"
echo ""
echo "==================================="
echo "📋 설정 요약"
echo "==================================="
echo "프로젝트 ID: $PROJECT_ID"
echo "기본 리전: asia-northeast3 (서울)"
echo "서비스 계정: $SERVICE_ACCOUNT_EMAIL"
echo "활성화된 API: ${#REQUIRED_APIS[@]}개"
echo "==================================="
echo ""

log_info "다음 단계:"
log_info "1. ./deploy.sh $PROJECT_ID 를 실행하여 애플리케이션을 배포하세요"
log_warning "2. OpenAI API 키와 Gemini API 키를 준비해두세요"
log_warning "3. 배포 완료 후 Secret Manager에서 실제 API 키를 설정해야 합니다"

log_success "초기 설정 스크립트 완료! 🚀"