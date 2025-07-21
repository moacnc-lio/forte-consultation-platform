#!/bin/bash
# 배포 전 환경 검증 스크립트

echo "=== 환경 검증 시작 ==="

# 프로젝트 설정
PROJECT_ID="forte-consultation-platform"
REGION="asia-northeast1"

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 검증 결과 추적
VALIDATION_PASSED=true

# 함수: 검증 결과 출력
check_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
        VALIDATION_PASSED=false
    fi
}

# 1. GCP CLI 설치 및 인증 확인
echo "1. GCP CLI 설치 및 인증 확인..."
gcloud version > /dev/null 2>&1
check_result $? "GCP CLI 설치됨"

gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"
check_result $? "GCP 인증됨"

CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null)
if [ "$CURRENT_PROJECT" = "$PROJECT_ID" ]; then
    echo -e "${GREEN}✓${NC} 올바른 GCP 프로젝트 설정됨: $CURRENT_PROJECT"
else
    echo -e "${YELLOW}!${NC} GCP 프로젝트 설정 필요: $PROJECT_ID (현재: $CURRENT_PROJECT)"
    echo "다음 명령어로 설정하세요: gcloud config set project $PROJECT_ID"
fi

# 2. 필요한 GCP API 활성화 확인
echo -e "\n2. GCP API 활성화 확인..."
REQUIRED_APIS=(
    "cloudsql.googleapis.com"
    "run.googleapis.com"
    "containerregistry.googleapis.com"
    "secretmanager.googleapis.com"
)

for api in "${REQUIRED_APIS[@]}"; do
    gcloud services list --enabled --filter="name:$api" --format="value(name)" | grep -q "$api"
    check_result $? "$api 활성화됨"
done

# 3. Secret Manager 비밀 확인
echo -e "\n3. Secret Manager 비밀 확인..."
REQUIRED_SECRETS=(
    "forte-secret-key"
    "forte-db-password"
    "forte-db-connection-string"
)

for secret in "${REQUIRED_SECRETS[@]}"; do
    gcloud secrets describe "$secret" > /dev/null 2>&1
    check_result $? "$secret 존재함"
done

# Gemini API 키는 선택적
gcloud secrets describe "gemini-api-key" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} gemini-api-key 존재함"
else
    echo -e "${YELLOW}!${NC} gemini-api-key 없음 (AI 요약 기능 비활성화됨)"
fi

# 4. Cloud SQL 인스턴스 확인
echo -e "\n4. Cloud SQL 인스턴스 확인..."
gcloud sql instances describe forte-db --format="value(state)" | grep -q "RUNNABLE"
check_result $? "Cloud SQL 인스턴스 실행 중"

# 5. Docker 설치 확인
echo -e "\n5. Docker 설치 확인..."
docker --version > /dev/null 2>&1
check_result $? "Docker 설치됨"

docker info > /dev/null 2>&1
check_result $? "Docker 실행 중"

# 6. 로컬 환경 파일 확인
echo -e "\n6. 환경 설정 파일 확인..."
[ -f "../backend/.env.development" ]
check_result $? "백엔드 개발 환경 파일 존재"

[ -f "../backend/.env.production" ]
check_result $? "백엔드 실서버 환경 파일 존재"

[ -f "../frontend/.env.development" ]
check_result $? "프론트엔드 개발 환경 파일 존재"

[ -f "../frontend/.env.production" ]
check_result $? "프론트엔드 실서버 환경 파일 존재"

# 7. 빌드 도구 확인
echo -e "\n7. 빌드 도구 확인..."
node --version > /dev/null 2>&1
check_result $? "Node.js 설치됨"

npm --version > /dev/null 2>&1
check_result $? "npm 설치됨"

python3 --version > /dev/null 2>&1
check_result $? "Python3 설치됨"

# 8. 네트워크 연결 확인
echo -e "\n8. 네트워크 연결 확인..."
curl -s --max-time 5 https://gcr.io > /dev/null
check_result $? "Google Container Registry 접근 가능"

curl -s --max-time 5 https://run.googleapis.com > /dev/null
check_result $? "Cloud Run API 접근 가능"

# 최종 검증 결과
echo -e "\n=== 검증 결과 ==="
if [ "$VALIDATION_PASSED" = true ]; then
    echo -e "${GREEN}모든 검증 통과! 배포를 진행할 수 있습니다.${NC}"
    exit 0
else
    echo -e "${RED}일부 검증 실패! 위의 문제점들을 해결한 후 다시 시도하세요.${NC}"
    echo -e "\n${YELLOW}도움말:${NC}"
    echo "- GCP 프로젝트 설정: gcloud config set project $PROJECT_ID"
    echo "- API 활성화: gcloud services enable [API명]"
    echo "- Secret 생성: ./setup-gcp-resources.sh 실행"
    echo "- Cloud SQL 설정: ./setup-database.sh 실행"
    exit 1
fi