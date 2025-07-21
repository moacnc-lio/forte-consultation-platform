// 공통 타입 정의

// 시술 관련 타입
export interface Procedure {
  id: number;
  procedure_number: number;
  korean_name: string;
  english_name?: string;
  category?: string;
  brand_info?: string;
  description?: string;
  target_areas?: string;
  duration_info?: string;
  effects?: string;
  side_effects?: string;
  precautions?: string;
  price_info?: string;
  additional_info?: Record<string, any>;
  version: number;
  is_active: boolean;
  created_at: string;
  last_updated: string;
}

export interface ProcedureCreate {
  procedure_number: number;
  korean_name: string;
  english_name?: string;
  category?: string;
  brand_info?: string;
  description?: string;
  target_areas?: string;
  duration_info?: string;
  effects?: string;
  side_effects?: string;
  precautions?: string;
  price_info?: string;
  additional_info?: Record<string, any>;
}

export interface ProcedureUpdate {
  korean_name?: string;
  english_name?: string;
  category?: string;
  brand_info?: string;
  description?: string;
  target_areas?: string;
  duration_info?: string;
  effects?: string;
  side_effects?: string;
  precautions?: string;
  price_info?: string;
  additional_info?: Record<string, any>;
}

// 카테고리 타입
export interface Category {
  code: string;
  name: string;
  description: string;
}

// 상담 요약 관련 타입
export interface ConsultationSummary {
  id: number;
  consultation_date: string;
  original_text: string;
  summary_text: string;
  prompt_template_id?: number;
  procedures_discussed?: number[];
  created_by?: string;
  created_at: string;
}

export interface SummaryCreate {
  consultation_date: string;
  original_text: string;
  prompt_template_id?: number;
  procedures_discussed?: number[];
}

export interface SummaryGenerateRequest {
  original_text: string;
  consultation_date?: string;
  prompt_template_id?: number;
}

export interface SummaryGenerateResponse {
  summary: string;
  original_text: string;
  template_used: string;
  consultation_date: string;
}

// API 응답 타입
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

// 에러 타입
export interface ApiError {
  detail: string;
  status_code?: number;
}