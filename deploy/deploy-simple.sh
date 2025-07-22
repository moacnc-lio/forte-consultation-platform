#!/bin/bash
# 간단한 백엔드 배포 스크립트 (SQLite 사용)

echo "=== 포르테 백엔드 간단 배포 시작 ==="

# 프로젝트 설정
PROJECT_ID="moa-robo"
SERVICE_NAME="forte-backend"
REGION="asia-northeast1"

# 현재 디렉토리 확인
cd "$(dirname "$0")"/..
echo "현재 작업 디렉토리: $(pwd)"

# 백엔드 디렉토리로 이동
cd backend

# SQLite를 사용하도록 환경변수 파일 수정
echo "SQLite용 환경 설정 생성 중..."
cat > .env.deploy << 'EOF'
# 배포용 환경 설정 (SQLite)
DATABASE_URL=sqlite:///./forte.db
SECRET_KEY=forte-deployment-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Google Gemini API (실제 키는 Secret Manager에서)
GEMINI_API_KEY=dummy-key-will-be-overridden

# 애플리케이션 설정
APP_NAME=Forte Consultation Platform
APP_VERSION=1.0.0
DEBUG=False

# CORS 설정
ALLOWED_ORIGINS=*

# GCP 설정
GCP_PROJECT_ID=moa-robo
GCP_REGION=asia-northeast1
EOF

# Docker 이미지 빌드
echo "Docker 이미지 빌드 중..."
docker build -t gcr.io/$PROJECT_ID/$SERVICE_NAME .

# 이미지 푸시
echo "이미지 GCR에 푸시 중..."
docker push gcr.io/$PROJECT_ID/$SERVICE_NAME

# Cloud Run 배포
echo "Cloud Run에 배포 중..."
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --max-instances 5 \
  --min-instances 0 \
  --concurrency 80 \
  --timeout 900 \
  --set-env-vars APP_ENV=production \
  --set-env-vars DEBUG=False \
  --set-env-vars DATABASE_URL=sqlite:///./forte.db \
  --set-env-vars ALLOWED_ORIGINS=* \
  --set-env-vars GCP_PROJECT_ID=$PROJECT_ID \
  --set-env-vars GCP_REGION=$REGION \
  --set-secrets="SECRET_KEY=forte-secret-key:latest" \
  --set-secrets="GEMINI_API_KEY=gemini-api-key:latest"

# 배포된 서비스 URL 확인
BACKEND_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")
echo "백엔드 서비스 URL: $BACKEND_URL"

# 데이터베이스 초기화
echo "데이터베이스 초기화 중..."
sleep 15
curl -X POST "$BACKEND_URL/api/init-db" || echo "DB 초기화 실패 - 수동으로 수행하세요"

# 헬스체크
echo "헬스체크 수행 중..."
sleep 5
curl -f "$BACKEND_URL/health" || echo "헬스체크 실패 - 서비스 로그를 확인하세요"

echo "=== 백엔드 배포 완료 ==="
echo "서비스 URL: $BACKEND_URL"
echo "API 문서: $BACKEND_URL/docs"