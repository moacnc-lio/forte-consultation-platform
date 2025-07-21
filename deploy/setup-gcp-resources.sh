#!/bin/bash
# GCP 리소스 초기 설정 스크립트

echo "=== GCP 리소스 설정 시작 ==="

# 프로젝트 설정
PROJECT_ID="forte-consultation-platform"
REGION="asia-northeast1"
DB_INSTANCE_NAME="forte-db"
DB_NAME="forte_db"
DB_USER="forte"

# GCP 프로젝트 설정 확인
echo "현재 GCP 프로젝트 설정 확인..."
gcloud config get-value project

# Cloud SQL 인스턴스 생성
echo "Cloud SQL PostgreSQL 인스턴스 생성 중..."
gcloud sql instances create $DB_INSTANCE_NAME \
    --database-version=POSTGRES_15 \
    --cpu=1 \
    --memory=3840MB \
    --region=$REGION \
    --storage-type=SSD \
    --storage-size=20GB \
    --storage-auto-increase \
    --backup-start-time=03:00 \
    --enable-bin-log \
    --deletion-protection

# 데이터베이스 생성
echo "데이터베이스 생성 중..."
gcloud sql databases create $DB_NAME --instance=$DB_INSTANCE_NAME

# 데이터베이스 사용자 생성 (비밀번호는 Secret Manager에서 관리)
echo "데이터베이스 사용자 생성 중..."
DB_PASSWORD=$(openssl rand -base64 32)
gcloud sql users create $DB_USER \
    --instance=$DB_INSTANCE_NAME \
    --password=$DB_PASSWORD

# Secret Manager에 비밀 정보 저장
echo "Secret Manager에 비밀 정보 저장 중..."

# 데이터베이스 비밀번호
echo -n $DB_PASSWORD | gcloud secrets create forte-db-password --data-file=-

# JWT Secret Key 생성 및 저장
JWT_SECRET=$(openssl rand -base64 64)
echo -n $JWT_SECRET | gcloud secrets create forte-secret-key --data-file=-

# Gemini API 키 placeholder (수동으로 설정 필요)
echo "수동으로 Gemini API 키를 설정해주세요:"
echo "gcloud secrets create gemini-api-key --data-file=<api-key-file>"

# Cloud SQL 연결 정보 표시
echo "=== Cloud SQL 연결 정보 ==="
echo "인스턴스 이름: $DB_INSTANCE_NAME"
echo "데이터베이스: $DB_NAME"
echo "사용자: $DB_USER"
echo "연결 이름: $PROJECT_ID:$REGION:$DB_INSTANCE_NAME"

# Cloud Run에 필요한 서비스 계정 권한 설정
echo "Cloud Run 서비스 계정 권한 설정 중..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$PROJECT_ID@appspot.gserviceaccount.com" \
    --role="roles/cloudsql.client"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$PROJECT_ID@appspot.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"

echo "=== GCP 리소스 설정 완료 ==="
echo "다음 단계:"
echo "1. Gemini API 키를 Secret Manager에 저장"
echo "2. 데이터베이스 스키마 적용"
echo "3. 애플리케이션 배포"