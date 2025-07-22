#!/bin/bash

# Forte 빠른 배포 스크립트 (최소한의 검증만 수행)
set -e

PROJECT_ID="moa-robo"
REGION="asia-northeast3"
BACKEND_SERVICE="forte-api"
FRONTEND_SERVICE="forte-web"

echo "🚀 빠른 배포 시작..."

# 프로젝트 설정
gcloud config set project $PROJECT_ID --quiet
gcloud config set run/region $REGION --quiet

# 백엔드만 빌드+배포 (기존 이미지가 있다면 스킵 가능)
echo "📦 백엔드 빌드 중..."
cd backend
cp Dockerfile.prod Dockerfile
gcloud builds submit --tag gcr.io/$PROJECT_ID/$BACKEND_SERVICE:latest --quiet . &
BACKEND_BUILD_PID=$!

# 프론트엔드 빌드 (병렬)
echo "📦 프론트엔드 빌드 중..."
cd ../frontend
cp Dockerfile.prod Dockerfile
gcloud builds submit --tag gcr.io/$PROJECT_ID/$FRONTEND_SERVICE:latest --quiet . &
FRONTEND_BUILD_PID=$!

# 빌드 완료 대기
echo "⏳ 빌드 완료 대기 중..."
wait $BACKEND_BUILD_PID
echo "✅ 백엔드 빌드 완료"

wait $FRONTEND_BUILD_PID  
echo "✅ 프론트엔드 빌드 완료"

# 백엔드 배포
echo "🚀 백엔드 배포 중..."
gcloud run deploy $BACKEND_SERVICE \
    --image gcr.io/$PROJECT_ID/$BACKEND_SERVICE:latest \
    --region $REGION \
    --allow-unauthenticated \
    --set-env-vars "APP_ENV=production,GCP_PROJECT=$PROJECT_ID,GCP_REGION=$REGION,DB_INSTANCE=forte-db,ALLOWED_ORIGINS=https://forte-web-hhlhhgenaq-du.a.run.app" \
    --set-secrets "SECRET_KEY=secret-key:latest,DB_PASSWORD=db-password:latest" \
    --add-cloudsql-instances $PROJECT_ID:$REGION:forte-db \
    --memory 2Gi --cpu 2 --max-instances 20 --min-instances 1 \
    --quiet

# 백엔드 URL 가져오기
BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE --region=$REGION --format='value(status.url)')

# 프론트엔드 배포
echo "🚀 프론트엔드 배포 중..."
gcloud run deploy $FRONTEND_SERVICE \
    --image gcr.io/$PROJECT_ID/$FRONTEND_SERVICE:latest \
    --region $REGION \
    --allow-unauthenticated \
    --set-env-vars "BACKEND_SERVICE_URL=$BACKEND_URL" \
    --memory 1Gi --cpu 1 --max-instances 10 --min-instances 1 \
    --quiet

# 프론트엔드 URL 가져오기
FRONTEND_URL=$(gcloud run services describe $FRONTEND_SERVICE --region=$REGION --format='value(status.url)')

cd ..

echo ""
echo "🎉 빠른 배포 완료!"
echo "프론트엔드: $FRONTEND_URL"
echo "백엔드: $BACKEND_URL"
echo ""
echo "⏱️  총 소요시간: 약 3-5분 (병렬 빌드로 단축)"