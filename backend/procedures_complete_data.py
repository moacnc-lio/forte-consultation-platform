#!/usr/bin/env python3
"""
완전한 19개 시술 정보 데이터
RTF 파일 분석 기반으로 추출된 전체 시술 정보
"""

COMPLETE_PROCEDURES_DATA = [
    {
        "procedure_number": 1,
        "korean_name": "보톡스",
        "english_name": "Botox",
        "category": "A",
        "brand_info": "휴겔(Hugel), FDA 승인 제품 - 내성 방지를 위해 복합단백질이 제거된 순수톡신 제품 권장",
        "description": "보툴리눔균이 생산하는 신경독소로 아세틸콜린 분비를 차단하여 근육 수축을 완화. 2~3일 후부터 효과가 나타나 1~2주 후 최고점 도달",
        "target_areas": "이마/미간/눈가 주름, 사각턱, 겨드랑이 다한증, 종아리 부위",
        "duration_info": "2~3일 후 효과 시작, 1~2주 후 최고점, 3~6개월 지속 (내성 발생 시 효과 감소)",
        "effects": "주름 개선, 사각턱 축소, 다한증 완화, 근육량 감소를 통한 윤곽 개선",
        "side_effects": "【일반적】멍, 붓기, 통증, 압통, 주사부위 당김\n【심각한】안검하수, 보톡스 내성 (2024년 조사 시 75% 경험), 씹는 힘 저하, 사무라이 눈썹, 웃는 모습 변화\n【생명위험】보툴리눔 중독으로 인한 급격한 근력쇠약, 호흡곤란, 삼킴곤란, 언어장애, 실제 사망 사례 보고",
        "precautions": "【절대금기】근무력증(100% 근육약화 발생), 임신/수유 중 여성\n【상대금기】주사부위 감염, 신경근육계 질환, 아미노글리코사이드계 항생제 복용자\n【내성예방】시술 간격 3개월 이상, 적정 용량 준수, 복합단백질 없는 제품 사용\n【시술 후】24시간 마사지 금지, 1주일간 과도한 운동/열자극/음주 금지",
        "additional_info": {
            "type": "근육이완 주사",
            "onset": "2-3일",
            "peak_effect": "1-2주",
            "sessions": "1회",
            "approval": "FDA, 한국 식약처 승인",
            "resistance_rate": "2024년 기준 75% 효과감소 경험",
            "serious_warning": "생명을 위협하는 부작용 가능성",
            "emergency_symptoms": "호흡곤란, 삼킴곤란, 언어장애, 급격한 근력약화"
        }
    },
    {
        "procedure_number": 2,
        "korean_name": "필러",
        "english_name": "Filler",
        "category": "A",
        "brand_info": "히알루론산 기반 의료기기 (레스틸렌, 쥬비덤, 벨로테로 등) - 순수 히알루론산 제품 권장",
        "description": "진피층과 피하지방층에 생체적합성 히알루론산을 주사하여 볼륨 증가 및 주름 개선. 자체 무게의 300-1000배 수분 흡수 특성",
        "target_areas": "팔자주름, 눈밑 꺼짐, 볼 볼륨, 턱끝/이마 윤곽, 코 라인, 입술 볼륨",
        "duration_info": "즉시 효과, 2~4주 후 안정화, 6~24개월 지속 (제품별 차이)",
        "effects": "즉각적 볼륨 증가, 주름 개선, 자연스러운 윤곽 형성, 수분 공급",
        "side_effects": "【즉시부작용(10-30%)】부종, 발적, 멍, 통증, 일시적 비대칭\n【중등도(1-5%)】과도한 부종, 필러 결절, 틴달현상(푸른빛), 감각이상\n【지연부작용(0.06-1.1%)】지연성 염증반응, 이물육아종, 생물막 형성\n【심각한(<0.1%)】혈관폐쇄로 인한 피부괴사, 실명 위험 (미간/콧등/눈밑 주의), 뇌졸중",
        "precautions": "【절대금기】임신/수유, 히알루론산/리도카인 알레르기, 시술부위 활성감염, 자가면역질환\n【위험부위】미간/콧등(실명위험), 눈밑/애교살(안동맥), 이마(안와상동맥)\n【응급상황】시술 중 심한통증, 피부창백/청색증, 시야장애 시 즉시 히알루로니다제 투여\n【시술 후】24시간 마사지 금지, 1주일간 사우나/찜질방/격렬한 운동 금지",
        "additional_info": {
            "main_ingredient": "히알루론산 (의료기기 분류)",
            "reversible": "히알루로니다제로 용해 가능",
            "volume_range": "1-5cc (부위별 조정)",
            "immediate_effect": "즉시 확인 가능",
            "delayed_reaction_rate": "연간 0.06-1.1%",
            "blindness_risk": "극히 드물지만 영구적 시력손실 가능",
            "emergency_treatment": "히알루로니다제, 고압산소치료"
        }
    },
    {
        "procedure_number": 3,
        "korean_name": "엘란세",
        "english_name": "Ellanse",
        "category": "A",
        "brand_info": "Sinclair Pharma",
        "description": "PDLLA 성분을 포함한 생분해성 필러로, 콜라겐 생성을 촉진하여 장기 지속 효과를 제공",
        "target_areas": "얼굴 전체, 목, 데콜테, 손등",
        "duration_info": "즉시 효과, 12~14개월 또는 그 이상 지속",
        "effects": "자연스러운 볼륨 증가, 콜라겐 생성 촉진, 피부 탄력 개선",
        "side_effects": "일시적 붓기, 멍, 드물게 육아종 형성",
        "precautions": "시술 후 충분한 수분 섭취, 마사지 금지",
        "additional_info": {
            "material": "PDLLA + CMC gel",
            "mechanism": "콜라겐 생성 유도",
            "biodegradable": "완전 생분해",
            "types": "S(1년), M(2년), L(3년), E(4년)"
        }
    },
    {
        "procedure_number": 4,
        "korean_name": "쥬베룩",
        "english_name": "Juvelook",
        "category": "B",
        "brand_info": "히알루론산 + PDLLA + 아미노산 복합 재생 주사 - 24주간 임상시험 완료",
        "description": "히알루론산, PDLLA(폴리-D,L-락타이드), 아미노산을 혼합한 피부 재생 촉진 주사. 콜라겐 생성과 즉시적 수분 공급 효과 동시 제공",
        "target_areas": "얼굴 전체, 목, 손등, 데콜테 - 미간 등 혈관 주입 위험 부위는 권장하지 않음",
        "duration_info": "즉시 수분공급 효과, 4-6주 후 재생 효과, 8-12개월 지속",
        "effects": "피부 재생 촉진, 콜라겐 생성, 탄력 증가, 수분 공급, 모공 축소, 전반적 피부결 개선",
        "side_effects": "【일반적(10-15%)】멍, 붓기, 일시적 통증, 압통, 홍반, 가려움증, 주사부위 단단함\n【드문(<1%)】결절 형성 (제거 어려움), PDLLA/히알루론산 알레르기\n【심각한】혈관폐쇄로 인한 조직괴사, 혈관 내 주입 시 실명 등 중대한 부작용\n【특별주의】장기간 안전성 미확인 (24주 이상 데이터 부족)",
        "precautions": "【절대금기】급만성 피부질환, 감염/염증 상태, 제품성분 과민반응, 급만성 치주염, 임신/수유, 미성년자\n【상대금기】간기능 이상, 혈액응고 이상, 면역력 저하, 영구보형물 삽입자, 리도카인 알레르기\n【위험부위】미간 등 혈관 주입 위험 높은 부위 사용 금지\n【시술 후】압박/마사지 금지, 과도한 표정변화 피하기, 자외선 차단, 충분한 보습",
        "additional_info": {
            "components": ["히알루론산", "PDLLA", "아미노산"],
            "sessions": "3-5회 권장 (개인차 고려)",
            "interval": "2-4주",
            "skin_booster": "스킨부스터 + 콜라겐 부스터 효과",
            "safety_period": "24주간 임상데이터만 확보",
            "contraindicated_areas": "미간, 혈관 밀집 부위",
            "age_consideration": "20대-예방목적 낮은농도, 40대이상-전체건강평가 필수"
        }
    },
    {
        "procedure_number": 5,
        "korean_name": "실피엄 X",
        "english_name": "Sylfirm X",
        "category": "B",
        "brand_info": "Viol",
        "description": "마이크로니들과 RF가 결합된 피부 재생 치료 장비로, 선택적 전기 응고를 통한 혈관 및 색소 치료",
        "target_areas": "모공, 여드름 흉터, 탄력, 색소침착, 홍조",
        "duration_info": "즉시 효과, 3-6개월 지속, 3-4회 치료 권장",
        "effects": "모공 개선, 흉터 치료, 탄력 개선, 색소 개선, 혈관 개선",
        "side_effects": "3-4일간 다운타임, 일시적 발적, 각질",
        "precautions": "시술 후 보습 및 자외선 차단 필수",
        "additional_info": {
            "technology": "RF + 마이크로니들",
            "depth": "0.3-4.0mm 조절 가능",
            "unique_feature": "선택적 전기 응고",
            "sessions": "3-5회"
        }
    },
    {
        "procedure_number": 6,
        "korean_name": "오리지오",
        "english_name": "ORIGIO",
        "category": "B",
        "brand_info": "InMode",
        "description": "RF(고주파)를 이용한 비침습적 리프팅 치료 기기로, 진피부터 SMAS층까지 열을 전달",
        "target_areas": "얼굴, 목, 몸 전체, 탄력 개선이 필요한 모든 부위",
        "duration_info": "즉시 효과, 1-6개월 점진적 개선",
        "effects": "피부 탄력 개선, 리프팅 효과, 주름 개선, 윤곽 개선",
        "side_effects": "거의 없음, 시술 직후 일상생활 가능",
        "precautions": "시술 후 충분한 보습, 자외선 차단",
        "additional_info": {
            "technology": "RF(고주파)",
            "target_depth": "진피-SMAS층",
            "temperature": "65-75도",
            "non_invasive": "비침습적"
        }
    },
    {
        "procedure_number": 7,
        "korean_name": "아이 오리지오",
        "english_name": "Eye ORIGIO",
        "category": "B",
        "brand_info": "InMode - 눈 주변 특화 RF 장비, 아이쉴드로 안전성 강화",
        "description": "눈 주변 특화 RF(고주파) 치료로 정밀한 온도 조절을 통해 눈가 잔주름, 다크서클, 탄력 개선에 특화. 아이쉴드 착용으로 안전성 확보",
        "target_areas": "눈 주변, 눈꺼풀, 다크서클, 잔주름, 눈가 탄력 부위",
        "duration_info": "즉시 효과, 점진적 개선으로 6-18개월 지속",
        "effects": "눈가 탄력 개선, 잔주름 감소, 다크서클 개선, 눈꺼풀 처짐 완화",
        "side_effects": "【즉시부작용】눈 주변 일시적 붉어짐, 가벼운 붓기(특히 아침), 따뜻한 열감, 눈물분비 증가\n【단기부작용(1-3일)】지속적 미세붓기, 눈 주변 건조감, 일시적 민감도 증가, 화장 시 따가움\n【주의부작용】안구건조증 일시적 악화, 콘택트렌즈 착용 불편, 눈 주변 색소침착(매우 드물음), 시야 흐림(1-2시간)",
        "precautions": "【절대금기】임신/수유, 급성 결막염/각막염/포도막염, 최근 안과수술(3개월 이내), 심재세동기 착용\n【상대금기】심한 안구건조증, 켈로이드 체질, 면역억제제/항응고제 복용, 최근 보톡스/필러(2-4주 이내)\n【시술 전】콘택트렌즈 제거(1시간 전), 아이메이크업 완전제거, 속눈썹 익스텐션 제거 권장\n【시술 후】24시간 콘택트렌즈 금지, 눈 비비기 금지, 인공눈물 수시 점안, 냉찜질 2-3회/일",
        "additional_info": {
            "specialty": "눈가 전용 RF 장비",
            "precision": "정밀한 온도 조절 (65-75도)",
            "gentle": "부드러운 치료 (마취 불필요)",
            "eye_safety": "아이쉴드 착용으로 안전성 확보",
            "frequency": "연령별 권장주기 - 20대후반-30대초반(6개월), 30대중반-40대(4개월), 40대후반이상(3개월)",
            "special_care": "안구건조증 환자 인공눈물 사전 준비 필수"
        }
    },
    {
        "procedure_number": 8,
        "korean_name": "울쎄라",
        "english_name": "Ulthera",
        "category": "C",
        "brand_info": "Merz Aesthetics",
        "description": "FDA 승인 받은 HIFU 기기로 SMAS층까지 직접 작용하는 강력한 리프팅 치료",
        "target_areas": "얼굴, 목, 이마, 눈썹 리프팅",
        "duration_info": "1회 시술로 6개월-1년 점진적 리프팅 효과",
        "effects": "강력한 탄력 개선, 리프팅 효과, SMAS층 직접 작용",
        "side_effects": "시술 직후 붓기, 통증, 일시적 신경 마비 가능",
        "precautions": "시술 후 2-3일 붓기 관리, 충분한 휴식",
        "additional_info": {
            "technology": "HIFU (고강도 집속 초음파)",
            "fda_approved": "FDA 승인",
            "target_layer": "SMAS층",
            "sessions": "1회"
        }
    },
    {
        "procedure_number": 9,
        "korean_name": "티타늄 리프팅",
        "english_name": "Titanium Lifting",
        "category": "C",
        "brand_info": "복합 장비",
        "description": "HIFU + RF 이중 조합으로 깊은 층과 표층 모두에 작용하는 복합 리프팅 치료",
        "target_areas": "얼굴 전체, 턱라인, 목선, 이중턱",
        "duration_info": "즉시 효과, 2주-1개월 점진적 개선",
        "effects": "피부 탄력, 윤곽 개선, 즉시적 효과와 점진적 개선",
        "side_effects": "거의 없음, 시술 후 일상 생활 가능",
        "precautions": "시술 후 보습 관리, 자외선 차단",
        "additional_info": {
            "technology": "HIFU + RF 복합",
            "dual_action": "깊은층 + 표층",
            "immediate_effect": "즉시 효과",
            "progressive": "점진적 개선"
        }
    },
    {
        "procedure_number": 10,
        "korean_name": "온다 리프팅",
        "english_name": "ONDA Lifting",
        "category": "C",
        "brand_info": "DEKA - Coolwaves 기술로 마취 없이도 편안한 리프팅 시술",
        "description": "Coolwaves(쿨웨이브) 기술을 이용한 비침습적 지방 분해와 피부 탄력 개선 동시 치료. 마취 없이도 편안한 시술로 즉각적이고 점진적 효과",
        "target_areas": "얼굴, 이중턱, 목선, 팔, 복부, 허벅지 등 지방 및 탄력 개선이 필요한 부위",
        "duration_info": "즉시 효과 확인 가능, 점진적 개선으로 2-3개월에 걸쳐 최대 효과",
        "effects": "선택적 지방 분해, 피부 탄력 증가, 윤곽 라인 개선, 셀룰라이트 개선",
        "side_effects": "【일반적(경미)】홍조(몇시간 내 소실), 미세한 붓기(하루 정도), 따뜻한 느낌, 일시적 건조\n【드문부작용】물집(과도한 에너지 시), 색소변화(극히 드물게), 감각이상(일시적, 수일내 회복)\n【심각한】화상(부적절한 시술 시) - 전문의 시술 시 거의 발생하지 않음",
        "precautions": "【절대금기】임신/수유, 심박동기 착용, 시술부위 금속 임플란트, 활성 감염(염증이나 감염 상태 피부)\n【상대금기】자가면역 질환, 혈액응고 장애, 중증 당뇨, 켈로이드 체질\n【특별주의】최근 필러 시술(4주 이내), 피부암 병력, 광과민성 약물 복용, 극도로 민감한 피부\n【시술 후】찜질방/사우나/술/담배/경락마사지 1주일 금지, SPF 30 이상 자외선 차단, 저자극 화장품 사용",
        "additional_info": {
            "technology": "Coolwaves (쿨웨이브) - 2.45GHz 마이크로웨이브",
            "dual_benefit": "지방분해 + 탄력개선 동시",
            "fat_reduction": "선택적 지방세포 파괴",
            "skin_tightening": "콜라겐 리모델링을 통한 탄력 개선",
            "pain_free": "마취 없이도 편안한 시술",
            "suitable_for": "통증에 민감한 환자, 즉각적 효과 원하는 환자, 바디와 얼굴 동시 관리 희망 환자"
        }
    },
    {
        "procedure_number": 11,
        "korean_name": "실 리프팅",
        "english_name": "Thread Lifting",
        "category": "C",
        "brand_info": "PDO, PLLA, PCL 등 다양한 실",
        "description": "체내에 흡수되는 특수한 실을 삽입하여 피부 리프팅과 콜라겐 생성을 통한 탄력 개선",
        "target_areas": "전 얼굴, 목선, 턱라인, 팔자주름",
        "duration_info": "실 종류에 따라 6개월-18개월",
        "effects": "즉시적 리프팅 효과 + 점진적 콜라겐 생성",
        "side_effects": "붓기, 멍이 2-3일간 있을 수 있음, 실밥 돌출 가능",
        "precautions": "시술 후 1주일간 과도한 표정 자제, 마사지 금지",
        "additional_info": {
            "thread_types": ["PDO", "PLLA", "PCL"],
            "immediate_effect": "즉시 리프팅",
            "collagen_boost": "콜라겐 생성 촉진",
            "varieties": "smooth, cog, screw 등"
        }
    },
    {
        "procedure_number": 12,
        "korean_name": "엑소좀 치료",
        "english_name": "Exosome Therapy",
        "category": "D",
        "brand_info": "다양한 엑소좀 제품",
        "description": "줄기세포에서 추출한 엑소좀과 성장인자를 이용한 최신 재생 치료",
        "target_areas": "피부 재생, 주름, 모공, 모발 재생, 흉터 치료",
        "duration_info": "즉시 효과 가능, 1개월 이상 꾸준한 효과",
        "effects": "피부 탄력, 재생, 모공 개선, 멜라닌 개선 등 종합적 재생",
        "side_effects": "거의 없음, 알레르기 반응 극히 드뭄",
        "precautions": "시술 후 충분한 보습, 자외선 차단",
        "additional_info": {
            "technology": "줄기세포 엑소좀",
            "growth_factors": "다양한 성장인자 포함",
            "regenerative": "강력한 재생 효과",
            "latest_treatment": "최신 재생 치료법"
        }
    },
    {
        "procedure_number": 13,
        "korean_name": "바이오니클",
        "english_name": "Bionicle",
        "category": "D",
        "brand_info": "바이오니클",
        "description": "디옥시콜산을 이용한 비침습적 지방 분해 주사로 피부 탄력 개선에도 도움",
        "target_areas": "이중턱, 볼살, 등, 복부 등 지방 부위",
        "duration_info": "2-4주 후 효과 시작, 2-3개월 최대 효과",
        "effects": "지방 분해와 동시에 콜라겐 생성을 통한 탄력 개선",
        "side_effects": "일시적 붓기, 멍, 통증",
        "precautions": "시술 후 마사지, 충분한 수분 섭취",
        "additional_info": {
            "active_ingredient": "디옥시콜산",
            "mechanism": "지방세포 파괴",
            "sessions": "2-4회 권장",
            "interval": "4-6주"
        }
    },
    {
        "procedure_number": 14,
        "korean_name": "투스컬프",
        "english_name": "TruSculpt",
        "category": "D",
        "brand_info": "Cutera",
        "description": "RF 에너지를 이용한 비침습적 지방 감소 및 바디 컨투어링 시술",
        "target_areas": "복부, 옆구리, 팔, 다리, 턱 등 대용량 부위",
        "duration_info": "2-3주부터 효과 시작, 1-2개월 후 최종 결과",
        "effects": "대용량 지방 분해, 자연스러운 윤곽 개선, 피부 탄력 증가",
        "side_effects": "일시적 발적, 부종, 시술 부위 민감성",
        "precautions": "시술 후 충분한 수분 섭취, 규칙적인 운동",
        "additional_info": {
            "technology": "MonoPolar RF",
            "non_invasive": "비침습적",
            "large_volume": "대용량 시술 가능",
            "body_contouring": "바디 컨투어링"
        }
    },
    {
        "procedure_number": 15,
        "korean_name": "포테자 재생 주사",
        "english_name": "Potenza Regeneration",
        "category": "D",
        "brand_info": "Jeisys",
        "description": "마이크로니들 RF와 결합된 재생 주사로, 흉터 치료와 피부 재생에 특화",
        "target_areas": "얼굴 전체, 목, 데콜테, 흉터 부위",
        "duration_info": "시술 직후부터 효과, 지속적 개선",
        "effects": "상처 재생, 흉터 치료, 피부 재생력 향상, 모공 개선",
        "side_effects": "거의 없음, 일시적 발적",
        "precautions": "시술 후 자외선 차단, 보습 관리",
        "additional_info": {
            "combination": "마이크로니들 RF + 재생 인자",
            "scar_treatment": "흉터 치료 특화",
            "regeneration": "강력한 재생 효과",
            "minimal_downtime": "다운타임 최소"
        }
    },
    {
        "procedure_number": 16,
        "korean_name": "수광 주사",
        "english_name": "Skin Glow Injection",
        "category": "D",
        "brand_info": "다양한 브랜드",
        "description": "피부결 개선을 위한 맞춤형 수광 주사로 한국 피부과에서 일반적으로 시행되는 시술",
        "target_areas": "전 얼굴, 목, 손등, 피부결 개선이 필요한 부위",
        "duration_info": "즉시-2주 후 개선 시작, 정기적 관리 필요",
        "effects": "피부결 개선, 멜라닌 색소 개선, 수분 공급, 브라이트닝",
        "side_effects": "거의 없음, 일시적 침점",
        "precautions": "시술 후 자외선 차단, 보습 관리",
        "additional_info": {
            "ingredients": "비타민C, 글루타치온, 히알루론산",
            "customizable": "개인별 맞춤 조합",
            "maintenance": "정기적 관리 권장",
            "popular": "한국에서 인기"
        }
    },
    {
        "procedure_number": 17,
        "korean_name": "물광 주사",
        "english_name": "Water Light Injection",
        "category": "D",
        "brand_info": "다양한 브랜드",
        "description": "마이크로니들 장비를 이용한 균등한 수분 공급 주사 시술",
        "target_areas": "전신 가능, 특히 얼굴과 목",
        "duration_info": "즉시 효과, 지속 기간은 개인차",
        "effects": "피부 수분 공급, 피로회복, 영양 공급, 피부 톤 개선",
        "side_effects": "거의 없음, 일시적 침점",
        "precautions": "시술 후 보습 관리",
        "additional_info": {
            "method": "마이크로니들 장비 사용",
            "uniform_delivery": "균등한 주입",
            "hydration": "수분 공급 특화",
            "immediate_glow": "즉시 광택 효과"
        }
    },
    {
        "procedure_number": 18,
        "korean_name": "3D 하이픈",
        "english_name": "3D HIFU",
        "category": "D",
        "brand_info": "다양한 HIFU 장비",
        "description": "3차원 고강도 집속 초음파를 이용한 리프팅 및 타이트닝 시술",
        "target_areas": "얼굴, 목, 몸 전체",
        "duration_info": "즉시 효과, 2-3개월 최대 효과",
        "effects": "피부 리프팅, 모공 개선, 주름 개선, 탄력 증가",
        "side_effects": "일시적 붓기, 발적",
        "precautions": "시술 후 보습, 자외선 차단",
        "additional_info": {
            "technology": "3D HIFU",
            "multi_depth": "다층 깊이 치료",
            "precise_targeting": "정밀한 타겟팅",
            "cartridge_system": "카트리지 시스템"
        }
    },
    {
        "procedure_number": 19,
        "korean_name": "산소 관리",
        "english_name": "Oxygen Therapy",
        "category": "D",
        "brand_info": "다양한 산소 장비",
        "description": "고압 산소를 이용한 피부 재생 및 혈액 순환 개선 관리",
        "target_areas": "전신, 특히 얼굴과 두피",
        "duration_info": "시술 직후 효과, 지속적 관리 필요",
        "effects": "혈액 순환 개선, 피부 재생, 세포 활성화, 피로 회복",
        "side_effects": "부작용 없음, 매우 안전한 시술",
        "precautions": "특별한 주의사항 없음",
        "additional_info": {
            "method": "고압 산소 공급",
            "circulation": "혈액 순환 개선",
            "cellular_activation": "세포 활성화",
            "safe": "매우 안전한 시술"
        }
    }
]