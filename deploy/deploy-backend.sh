#!/bin/bash
# 백엔드 GCP Cloud Run 배포 스크립트

echo "=== 포르테 백엔드 배포 시작 ==="

# 프로젝트 설정
PROJECT_ID="forte-consultation-platform"
SERVICE_NAME="forte-backend"
REGION="asia-northeast1"
DB_INSTANCE_NAME="forte-db"

# 환경 변수 확인
if [ -z "$FRONTEND_URL" ]; then
    echo "경고: FRONTEND_URL이 설정되지 않았습니다."
    FRONTEND_URL="https://forte-frontend-xxx.run.app"
fi

# Docker 이미지 빌드
echo "Docker 이미지 빌드 중..."
cd ../backend
docker build -t gcr.io/$PROJECT_ID/$SERVICE_NAME .

# GCP 인증 확인
echo "GCP 인증 확인 중..."
gcloud auth list

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
  --max-instances 10 \
  --min-instances 0 \
  --concurrency 80 \
  --timeout 900 \
  --add-cloudsql-instances=$PROJECT_ID:$REGION:$DB_INSTANCE_NAME \
  --set-env-vars APP_ENV=production \
  --set-env-vars DEBUG=False \
  --set-env-vars ALLOWED_ORIGINS=$FRONTEND_URL \
  --set-env-vars GCP_PROJECT_ID=$PROJECT_ID \
  --set-env-vars GCP_REGION=$REGION \
  --set-secrets="SECRET_KEY=forte-secret-key:latest" \
  --set-secrets="GEMINI_API_KEY=gemini-api-key:latest" \
  --set-secrets="DATABASE_URL=forte-db-connection-string:latest"

# 배포된 서비스 URL 확인
BACKEND_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")
echo "백엔드 서비스 URL: $BACKEND_URL"

# 헬스체크
echo "헬스체크 수행 중..."
sleep 10
curl -f "$BACKEND_URL/health" || echo "헬스체크 실패 - 서비스 로그를 확인하세요"

echo "=== 백엔드 배포 완료 ==="
echo "서비스 URL: $BACKEND_URL"