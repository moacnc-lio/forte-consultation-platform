#!/bin/bash
# 전체 시스템 배포 스크립트

echo "=== 포르테 플랫폼 전체 배포 시작 ==="

# 백엔드 배포
echo "1. 백엔드 배포..."
./deploy-backend.sh

# 프론트엔드 배포
echo "2. 프론트엔드 배포..."
./deploy-frontend.sh

# 배포 상태 확인
echo "3. 배포 상태 확인..."
gcloud run services list --region=asia-northeast1

echo "=== 전체 배포 완료 ==="
echo "백엔드 URL: https://forte-backend-xxx.run.app"
echo "프론트엔드 URL: https://forte-frontend-xxx.run.app"