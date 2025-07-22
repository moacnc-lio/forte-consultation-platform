import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Divider,
  useTheme,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { proceduresApi } from '../../services/api';
import { Procedure, Category } from '../../types';
import ProcedureListItem from './ProcedureListItem';
import ProcedureDetailPanel from './ProcedureDetailPanel';
import ProcedureForm from './ProcedureForm';

const ProcedureMasterDetail: React.FC = () => {
  const theme = useTheme();
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [filteredProcedures, setFilteredProcedures] = useState<Procedure[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProcedure, setSelectedProcedure] = useState<Procedure | null>(null);
  
  // 필터 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // CRUD 상태
  const [formOpen, setFormOpen] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState<Procedure | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingProcedure, setDeletingProcedure] = useState<Procedure | null>(null);

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
        const proceduresData = await proceduresApi.getProcedures({
          active_only: true
        });
        setProcedures(proceduresData);
        setFilteredProcedures(proceduresData);
        
        // 첫 번째 시술을 자동 선택
        if (proceduresData.length > 0) {
          setSelectedProcedure(proceduresData[0]);
        }
      } catch (error) {
        console.error('시술 데이터 로드 실패:', error);
        setError('시술 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadProcedures();
  }, []);

  // 필터링
  useEffect(() => {
    let filtered = procedures;

    // 검색어 필터링
    if (searchQuery.trim()) {
      filtered = filtered.filter(procedure =>
        procedure.korean_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        procedure.english_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        procedure.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        procedure.brand_info?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 카테고리 필터링
    if (selectedCategory) {
      filtered = filtered.filter(procedure => procedure.category === selectedCategory);
    }

    setFilteredProcedures(filtered);
    
    // 선택된 시술이 필터링 결과에 없으면 첫 번째 시술 선택
    if (filtered.length > 0 && (!selectedProcedure || !filtered.find(p => p.id === selectedProcedure.id))) {
      setSelectedProcedure(filtered[0]);
    } else if (filtered.length === 0) {
      setSelectedProcedure(null);
    }
  }, [procedures, searchQuery, selectedCategory, selectedProcedure]);

  const handleProcedureSelect = (procedure: Procedure) => {
    setSelectedProcedure(procedure);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
  };

  // CRUD 함수들
  const handleAddProcedure = () => {
    setEditingProcedure(null);
    setFormOpen(true);
  };

  const handleEditProcedure = (procedure: Procedure) => {
    setEditingProcedure(procedure);
    setFormOpen(true);
  };

  const handleDeleteProcedure = (procedure: Procedure) => {
    setDeletingProcedure(procedure);
    setDeleteConfirmOpen(true);
  };

  const handleFormSave = async (savedProcedure: Procedure) => {
    try {
      if (editingProcedure) {
        // 수정 - 즉시 상태 업데이트
        setProcedures(prev => 
          prev.map(p => p.id === savedProcedure.id ? savedProcedure : p)
        );
        
        // 선택된 시술이 수정된 경우 업데이트
        if (selectedProcedure?.id === savedProcedure.id) {
          setSelectedProcedure(savedProcedure);
        }
      } else {
        // 추가 - 즉시 상태 업데이트
        setProcedures(prev => [...prev, savedProcedure]);
        
        // 새로 추가된 시술을 선택
        setSelectedProcedure(savedProcedure);
      }
      
      // 폼 닫기
      setFormOpen(false);
      setEditingProcedure(null);
      
      console.log('시술 정보가 성공적으로 저장되었습니다:', savedProcedure);
    } catch (error) {
      console.error('상태 업데이트 실패:', error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProcedure) return;

    try {
      await proceduresApi.deleteProcedure(deletingProcedure.id);
      setProcedures(prev => prev.filter(p => p.id !== deletingProcedure.id));
      
      // 선택된 시술이 삭제된 경우 선택 해제
      if (selectedProcedure?.id === deletingProcedure.id) {
        setSelectedProcedure(null);
      }
      
      setDeleteConfirmOpen(false);
      setDeletingProcedure(null);
    } catch (error) {
      console.error('시술 삭제 실패:', error);
      setError('시술 삭제에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', gap: 3 }}>
      {/* 왼쪽 패널 - 시술 목록 */}
      <Paper 
        elevation={2} 
        sx={{ 
          width: '400px',
          minWidth: '400px',
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
        {/* 검색 및 필터 헤더 */}
        <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              시술 목록 ({filteredProcedures.length}개)
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddProcedure}
              size="small"
            >
              시술 추가
            </Button>
          </Box>
          
          {/* 검색바 */}
          <TextField
            fullWidth
            size="small"
            placeholder="시술명, 브랜드로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          {/* 카테고리 필터 */}
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>카테고리</InputLabel>
            <Select
              value={selectedCategory}
              label="카테고리"
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <MenuItem value="">전체</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.code} value={category.code}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* 활성 필터 표시 */}
          {(selectedCategory || searchQuery) && (
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {selectedCategory && (
                <Chip
                  label={`카테고리: ${categories.find(c => c.code === selectedCategory)?.name}`}
                  onDelete={() => setSelectedCategory('')}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
              {searchQuery && (
                <Chip
                  label={`검색: "${searchQuery}"`}
                  onDelete={() => setSearchQuery('')}
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
              )}
            </Stack>
          )}
        </Box>

        {/* 시술 목록 */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {filteredProcedures.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
              <Typography variant="h6">
                검색 조건에 맞는 시술이 없습니다.
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                다른 검색어나 카테고리를 시도해보세요.
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 2 }}>
              {filteredProcedures.map((procedure) => (
                <ProcedureListItem
                  key={procedure.id}
                  procedure={procedure}
                  selected={selectedProcedure?.id === procedure.id}
                  onClick={handleProcedureSelect}
                />
              ))}
            </List>
          )}
        </Box>
      </Paper>

      {/* 오른쪽 패널 - 시술 상세 정보 */}
      <Paper 
        elevation={2} 
        sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden'
        }}
      >
        <ProcedureDetailPanel 
          procedure={selectedProcedure} 
          onEdit={handleEditProcedure}
          onDelete={handleDeleteProcedure}
        />
      </Paper>

      {/* 시술 추가/수정 폼 */}
      <ProcedureForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingProcedure(null);
        }}
        procedure={editingProcedure}
        onSave={handleFormSave}
      />

      {/* 삭제 확인 다이얼로그 */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>시술 삭제 확인</DialogTitle>
        <DialogContent>
          <Typography>
            '{deletingProcedure?.korean_name}' 시술을 삭제하시겠습니까?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            이 작업은 되돌릴 수 없습니다.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>
            취소
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProcedureMasterDetail;