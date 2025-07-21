import { create } from 'zustand';
import type { Procedure, Category } from '../types';

// 애플리케이션 전역 상태 관리
interface AppState {
  // 시술 관련 상태
  procedures: Procedure[];
  selectedProcedure: Procedure | null;
  categories: Category[];
  
  // 검색 관련 상태
  searchQuery: string;
  selectedCategory: string | null;
  
  // UI 상태
  isLoading: boolean;
  error: string | null;
  
  // 사이드바 상태
  sidebarOpen: boolean;
  
  // 액션들
  setProcedures: (procedures: Procedure[]) => void;
  setSelectedProcedure: (procedure: Procedure | null) => void;
  setCategories: (categories: Category[]) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSidebarOpen: (open: boolean) => void;
  
  // 즐겨찾기 관련
  favorites: number[];
  addFavorite: (procedureId: number) => void;
  removeFavorite: (procedureId: number) => void;
  isFavorite: (procedureId: number) => boolean;
}

export const useAppStore = create<AppState>((set, get) => ({
  // 초기 상태
  procedures: [],
  selectedProcedure: null,
  categories: [],
  searchQuery: '',
  selectedCategory: null,
  isLoading: false,
  error: null,
  sidebarOpen: true,
  favorites: JSON.parse(localStorage.getItem('forte-favorites') || '[]'),
  
  // 액션 구현
  setProcedures: (procedures) => set({ procedures }),
  
  setSelectedProcedure: (procedure) => set({ selectedProcedure: procedure }),
  
  setCategories: (categories) => set({ categories }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  addFavorite: (procedureId) => {
    const { favorites } = get();
    const newFavorites = [...favorites, procedureId];
    localStorage.setItem('forte-favorites', JSON.stringify(newFavorites));
    set({ favorites: newFavorites });
  },
  
  removeFavorite: (procedureId) => {
    const { favorites } = get();
    const newFavorites = favorites.filter(id => id !== procedureId);
    localStorage.setItem('forte-favorites', JSON.stringify(newFavorites));
    set({ favorites: newFavorites });
  },
  
  isFavorite: (procedureId) => {
    const { favorites } = get();
    return favorites.includes(procedureId);
  },
}));