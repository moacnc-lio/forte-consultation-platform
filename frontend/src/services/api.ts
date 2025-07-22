import axios from 'axios';
import type {
  Procedure,
  ProcedureCreate,
  ProcedureUpdate,
  Category,
  ConsultationSummary,
  SummaryCreate,
  SummaryCreateDirect,
  SummaryGenerateRequest,
  SummaryGenerateResponse
} from '../types';

// API 클라이언트 설정 (환경별)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// 환경 확인
const isProduction = process.env.REACT_APP_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

console.log(`API Base URL: ${API_BASE_URL} (Environment: ${process.env.REACT_APP_ENV || 'development'})`);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 1분 기본 timeout (30초 → 60초)
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    // JWT 토큰이 있다면 추가 (향후 구현)
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// 시술 관련 API
export const proceduresApi = {
  // 시술 목록 조회
  getProcedures: async (params?: {
    skip?: number;
    limit?: number;
    category?: string;
    active_only?: boolean;
  }): Promise<Procedure[]> => {
    const response = await apiClient.get('/api/procedures/', { params });
    return response.data;
  },

  // 특정 시술 조회
  getProcedure: async (id: number): Promise<Procedure> => {
    const response = await apiClient.get(`/api/procedures/${id}`);
    return response.data;
  },

  // 시술 번호로 조회
  getProcedureByNumber: async (number: number): Promise<Procedure> => {
    const response = await apiClient.get(`/api/procedures/number/${number}`);
    return response.data;
  },

  // 시술 생성
  createProcedure: async (procedure: ProcedureCreate): Promise<Procedure> => {
    const response = await apiClient.post('/api/procedures/', procedure);
    return response.data;
  },

  // 시술 수정
  updateProcedure: async (id: number, procedure: ProcedureUpdate): Promise<Procedure> => {
    const response = await apiClient.put(`/api/procedures/${id}`, procedure);
    return response.data;
  },

  // 시술 삭제 (비활성화)
  deleteProcedure: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/api/procedures/${id}`);
    return response.data;
  },

  // 시술 검색
  searchProcedures: async (query: string, category?: string): Promise<Procedure[]> => {
    const params = { q: query, ...(category && { category }) };
    const response = await apiClient.get('/api/procedures/search/', { params });
    return response.data;
  },

  // 카테고리 목록 조회
  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get('/api/procedures/categories/');
    return response.data;
  },
};

// 상담 요약 관련 API
export const summariesApi = {
  // AI 요약 생성 (더 긴 timeout 적용)
  generateSummary: async (request: SummaryGenerateRequest): Promise<SummaryGenerateResponse> => {
    const response = await apiClient.post('/api/summaries/generate', request, {
      timeout: 120000, // 2분 timeout (OpenAI API 호출 시간 고려)
    });
    return response.data;
  },

  // 상담 요약 생성 및 저장
  createSummary: async (summary: SummaryCreate): Promise<ConsultationSummary> => {
    const response = await apiClient.post('/api/summaries/', summary);
    return response.data;
  },

  // 상담 요약 직접 저장 (AI 생성 없이)
  createSummaryDirect: async (summary: SummaryCreateDirect): Promise<ConsultationSummary> => {
    const response = await apiClient.post('/api/summaries/direct', summary);
    return response.data;
  },

  // 상담 요약 목록 조회
  getSummaries: async (params?: {
    skip?: number;
    limit?: number;
    start_date?: string;
    end_date?: string;
  }): Promise<ConsultationSummary[]> => {
    const response = await apiClient.get('/api/summaries/', { params });
    return response.data;
  },

  // 특정 상담 요약 조회
  getSummary: async (id: number): Promise<ConsultationSummary> => {
    const response = await apiClient.get(`/api/summaries/${id}`);
    return response.data;
  },

  // 상담 요약 수정
  updateSummary: async (id: number, update: { summary_text: string; procedures_discussed?: number[] }): Promise<ConsultationSummary> => {
    const response = await apiClient.put(`/api/summaries/${id}`, update);
    return response.data;
  },

  // 상담 요약 삭제
  deleteSummary: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/api/summaries/${id}`);
    return response.data;
  },
};

// 헬스체크 API
export const healthApi = {
  check: async (): Promise<{ status: string; app_name: string; version: string }> => {
    const response = await apiClient.get('/health');
    return response.data;
  },
};