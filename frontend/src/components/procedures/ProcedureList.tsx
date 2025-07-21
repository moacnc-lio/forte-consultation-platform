import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Chip,
  Stack
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { proceduresApi } from '../../services/api';
import { Procedure, Category } from '../../types';
import ProcedureCard from './ProcedureCard';
import ProcedureDetail from './ProcedureDetail';

interface ProcedureListProps {
  searchQuery?: string;
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
}

const ProcedureList: React.FC<ProcedureListProps> = ({
  searchQuery = '',
  selectedCategory = '',
  onCategoryChange
}) => {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProcedure, setSelectedProcedure] = useState<Procedure | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  
  // 페이지네이션
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  // 로컬 검색어 상태
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // 카테고리 로드
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await proceduresApi.getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('카테고리 로드 실패:', error);
      }
    };
    loadCategories();
  }, []);

  // 시술 데이터 로드
  useEffect(() => {
    const loadProcedures = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let proceduresData: Procedure[];
        
        if (localSearchQuery.trim()) {
          // 검색 모드
          proceduresData = await proceduresApi.searchProcedures(
            localSearchQuery.trim(),
            selectedCategory || undefined
          );
        } else {
          // 일반 목록 모드
          proceduresData = await proceduresApi.getProcedures({
            category: selectedCategory || undefined,
            active_only: true
          });
        }
        
        setProcedures(proceduresData);
        setPage(1); // 새로운 검색/필터링 시 첫 페이지로
      } catch (error) {
        console.error('시술 데이터 로드 실패:', error);
        setError('시술 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadProcedures();
  }, [localSearchQuery, selectedCategory]);

  // 외부에서 전달된 검색어 동기화
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  // 시술 상세 보기
  const handleProcedureDetail = (procedure: Procedure) => {
    setSelectedProcedure(procedure);
    setDetailOpen(true);
  };

  // 페이지네이션 계산
  const totalPages = Math.ceil(procedures.length / itemsPerPage);
  const paginatedProcedures = procedures.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // 로딩 상태
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* 검색 및 필터 컨트롤 */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          {/* 검색바 */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="시술명, 브랜드, 설명으로 검색..."
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.paper'
                }
              }}
            />
          </Grid>

          {/* 카테고리 필터 */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>카테고리</InputLabel>
              <Select
                value={selectedCategory}
                label="카테고리"
                onChange={(e) => onCategoryChange?.(e.target.value)}
              >
                <MenuItem value="">전체</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.code} value={category.code}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* 결과 개수 */}
          <Grid item xs={12} md={3}>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'right' }}>
              총 {procedures.length}개 시술
            </Typography>
          </Grid>
        </Grid>

        {/* 활성 필터 표시 */}
        {(selectedCategory || localSearchQuery) && (
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            {selectedCategory && (
              <Chip
                label={`카테고리: ${categories.find(c => c.code === selectedCategory)?.name}`}
                onDelete={() => onCategoryChange?.('')}
                color="primary"
                variant="outlined"
              />
            )}
            {localSearchQuery && (
              <Chip
                label={`검색: "${localSearchQuery}"`}
                onDelete={() => setLocalSearchQuery('')}
                color="secondary"
                variant="outlined"
              />
            )}
          </Stack>
        )}
      </Box>

      {/* 시술 카드 그리드 */}
      {procedures.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            {localSearchQuery || selectedCategory 
              ? '검색 조건에 맞는 시술이 없습니다.' 
              : '등록된 시술이 없습니다.'
            }
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {paginatedProcedures.map((procedure) => (
              <Grid item xs={12} sm={6} lg={4} key={procedure.id}>
                <ProcedureCard
                  procedure={procedure}
                  onDetail={handleProcedureDetail}
                />
              </Grid>
            ))}
          </Grid>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}

      {/* 시술 상세 다이얼로그 */}
      <ProcedureDetail
        procedure={selectedProcedure}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </Box>
  );
};

export default ProcedureList;