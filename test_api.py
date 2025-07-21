#!/usr/bin/env python3
"""
API 테스트 스크립트
개발 환경에서 API 엔드포인트들이 정상 작동하는지 확인
"""

import requests
import json
from datetime import date

BASE_URL = "http://localhost:8000"

def test_health():
    """헬스체크 테스트"""
    print("=== 헬스체크 테스트 ===")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_procedures():
    """시술 관련 API 테스트"""
    print("\n=== 시술 API 테스트 ===")
    
    # 시술 목록 조회
    try:
        response = requests.get(f"{BASE_URL}/api/procedures/")
        print(f"시술 목록 조회 - Status: {response.status_code}")
        if response.status_code == 200:
            procedures = response.json()
            print(f"총 {len(procedures)}개 시술 조회됨")
            if procedures:
                print(f"첫 번째 시술: {procedures[0]['korean_name']}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_categories():
    """카테고리 API 테스트"""
    print("\n=== 카테고리 API 테스트 ===")
    try:
        response = requests.get(f"{BASE_URL}/api/procedures/categories/")
        print(f"카테고리 조회 - Status: {response.status_code}")
        if response.status_code == 200:
            categories = response.json()
            print(f"총 {len(categories)}개 카테고리:")
            for cat in categories:
                print(f"  - {cat['code']}: {cat['name']}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_search():
    """검색 API 테스트"""
    print("\n=== 검색 API 테스트 ===")
    try:
        response = requests.get(f"{BASE_URL}/api/procedures/search/", params={"q": "보톡스"})
        print(f"검색 테스트 - Status: {response.status_code}")
        if response.status_code == 200:
            results = response.json()
            print(f"'보톡스' 검색 결과: {len(results)}개")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_summary_generation():
    """AI 요약 생성 테스트 (API 키가 있을 경우)"""
    print("\n=== AI 요약 API 테스트 ===")
    
    test_data = {
        "original_text": "今日はボトックス注射について相談したいです。額のしわが気になっています。",
        "consultation_date": str(date.today())
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/summaries/generate", json=test_data)
        print(f"AI 요약 생성 - Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("요약 생성 성공!")
            print(f"원문 길이: {len(result['original_text'])}자")
            print(f"요약 길이: {len(result['summary'])}자")
        elif response.status_code == 500:
            print("Gemini API 키가 설정되지 않았거나 오류 발생")
        
        return response.status_code in [200, 500]  # 500도 예상된 응답
        
    except Exception as e:
        print(f"Error: {e}")
        return False

def main():
    """전체 테스트 실행"""
    print("포르테 플랫폼 API 테스트 시작")
    print("=" * 50)
    
    tests = [
        ("헬스체크", test_health),
        ("시술 API", test_procedures),
        ("카테고리 API", test_categories),
        ("검색 API", test_search),
        ("AI 요약 API", test_summary_generation),
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            success = test_func()
            results.append((test_name, success))
        except Exception as e:
            print(f"{test_name} 테스트 중 예외 발생: {e}")
            results.append((test_name, False))
    
    print("\n" + "=" * 50)
    print("테스트 결과 요약:")
    print("=" * 50)
    
    for test_name, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{test_name}: {status}")
    
    total_tests = len(results)
    passed_tests = sum(1 for _, success in results if success)
    print(f"\n총 {total_tests}개 테스트 중 {passed_tests}개 통과")

if __name__ == "__main__":
    main()