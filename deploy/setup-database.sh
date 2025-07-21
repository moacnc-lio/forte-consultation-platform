#!/bin/bash
# 데이터베이스 스키마 및 초기 데이터 설정 스크립트

echo "=== 데이터베이스 설정 시작 ==="

# 프로젝트 설정
PROJECT_ID="forte-consultation-platform"
REGION="asia-northeast1"
DB_INSTANCE_NAME="forte-db"
DB_NAME="forte_db"

# Cloud SQL Proxy 연결을 통한 스키마 적용
echo "Cloud SQL Proxy를 통해 데이터베이스 연결 중..."

# Cloud SQL Proxy 다운로드 (없을 경우)
if [ ! -f cloud_sql_proxy ]; then
    echo "Cloud SQL Proxy 다운로드 중..."
    curl -o cloud_sql_proxy https://dl.google.com/cloudsql/cloud_sql_proxy.linux.amd64
    chmod +x cloud_sql_proxy
fi

# 백그라운드에서 Cloud SQL Proxy 실행
echo "Cloud SQL Proxy 시작..."
./cloud_sql_proxy -instances=$PROJECT_ID:$REGION:$DB_INSTANCE_NAME=tcp:5432 &
PROXY_PID=$!

# 프록시 연결 대기
sleep 10

# 데이터베이스 연결 정보
DB_USER="forte"
DB_PASSWORD=$(gcloud secrets versions access latest --secret="forte-db-password")

# 스키마 적용
echo "데이터베이스 스키마 적용 중..."
PGPASSWORD=$DB_PASSWORD psql -h localhost -p 5432 -U $DB_USER -d $DB_NAME -f ../backend/database_schema.sql

if [ $? -eq 0 ]; then
    echo "스키마 적용 성공!"
else
    echo "스키마 적용 실패!"
    kill $PROXY_PID
    exit 1
fi

# 시드 데이터 삽입 (선택적)
echo "시드 데이터 삽입을 원하시면 y를 입력하세요:"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    echo "시드 데이터 삽입 중..."
    cd ../data
    python3 seed_procedures.py
    cd ../deploy
fi

# Cloud SQL Proxy 종료
echo "Cloud SQL Proxy 종료..."
kill $PROXY_PID

# Secret Manager에 최종 연결 문자열 저장
echo "연결 문자열을 Secret Manager에 저장 중..."
CONNECTION_STRING="postgresql://$DB_USER:$DB_PASSWORD@/forte_db?host=/cloudsql/$PROJECT_ID:$REGION:$DB_INSTANCE_NAME"
echo -n $CONNECTION_STRING | gcloud secrets create forte-db-connection-string --data-file=-

echo "=== 데이터베이스 설정 완료 ==="
echo "연결 문자열이 Secret Manager에 'forte-db-connection-string'로 저장되었습니다."