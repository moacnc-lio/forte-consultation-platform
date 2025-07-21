#!/bin/bash
# 프론트엔드 GCP Cloud Run 배포 스크립트

echo "=== 포르테 프론트엔드 배포 시작 ==="

# 프로젝트 설정
PROJECT_ID="forte-consultation-platform"
SERVICE_NAME="forte-frontend"
REGION="asia-northeast1"

# 백엔드 서비스 URL 확인
if [ -z "$BACKEND_URL" ]; then
    echo "백엔드 URL 자동 확인 중..."
    BACKEND_URL=$(gcloud run services describe forte-backend --region=$REGION --format="value(status.url)" 2>/dev/null)
    if [ -z "$BACKEND_URL" ]; then
        echo "경고: 백엔드 서비스를 찾을 수 없습니다. 기본값 사용"
        BACKEND_URL="https://forte-backend-xxx.run.app"
    fi
fi

echo "백엔드 URL: $BACKEND_URL"

# 환경 변수 파일 생성 (실서버용)
cd ../frontend
cat > .env.production << EOF
REACT_APP_API_URL=$BACKEND_URL
REACT_APP_ENV=production
REACT_APP_APP_NAME=포르테 시술 상담 지원 플랫폼
REACT_APP_VERSION=1.0.0
GENERATE_SOURCEMAP=false
REACT_APP_DEBUG=false
EOF

# 의존성 설치
echo "의존성 설치 중..."
npm ci --only=production

# React 빌드
echo "React 애플리케이션 빌드 중..."
npm run build

# Docker 이미지 빌드 (실서버용 Dockerfile 사용)
echo "Docker 이미지 빌드 중..."
docker build -f Dockerfile.prod -t gcr.io/$PROJECT_ID/$SERVICE_NAME .

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
  --memory 512Mi \
  --cpu 1 \
  --max-instances 5 \
  --min-instances 0 \
  --concurrency 100 \
  --timeout 60 \
  --set-env-vars BACKEND_SERVICE_URL=$BACKEND_URL

# 배포된 서비스 URL 확인
FRONTEND_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")
echo "프론트엔드 서비스 URL: $FRONTEND_URL"

# 헬스체크
echo "헬스체크 수행 중..."
sleep 5
curl -f "$FRONTEND_URL/health" || echo "헬스체크 실패 - 서비스 로그를 확인하세요"

echo "=== 프론트엔드 배포 완료 ==="
echo "서비스 URL: $FRONTEND_URL"

# 백엔드 CORS 설정 업데이트 안내
echo ""
echo "주의: 백엔드의 CORS 설정을 업데이트해야 할 수 있습니다:"
echo "FRONTEND_URL=$FRONTEND_URL ./deploy-backend.sh"