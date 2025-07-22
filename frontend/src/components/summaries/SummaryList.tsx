import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
  Grid,
  Pagination,
  Divider
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  DateRange as DateIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { summariesApi } from '../../services/api';
import { ConsultationSummary } from '../../types';

interface SummaryListProps {
  refreshTrigger?: number;
  onSummarySelect?: (summary: ConsultationSummary) => void;
}

const SummaryList: React.FC<SummaryListProps> = ({ 
  refreshTrigger, 
  onSummarySelect 
}) => {
  const [summaries, setSummaries] = useState<ConsultationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedSummary, setSelectedSummary] = useState<ConsultationSummary | null>(null);

  const itemsPerPage = 10;

  // 상담 요약 목록 로드
  useEffect(() => {
    loadSummaries();
  }, [refreshTrigger]);

  const loadSummaries = async () => {
    setLoading(true);
    setError(null);

    try {
      const summariesData = await summariesApi.getSummaries({
        skip: 0,
        limit: 20 // 처음에는 20개만 로드하여 성능 개선
      });
      setSummaries(summariesData);
    } catch (error) {
      console.error('상담 요약 목록 로드 실패:', error);
      setError('상담 요약 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 검색 필터링 및 최신순 정렬
  const filteredSummaries = summaries
    .filter(summary =>
      summary.summary_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      summary.original_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (summary.created_by && summary.created_by.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      // 최신순 정렬: created_at 기준으로 내림차순
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  // 페이지네이션
  const totalPages = Math.ceil(filteredSummaries.length / itemsPerPage);
  const paginatedSummaries = filteredSummaries.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // 메뉴 핸들러
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, summary: ConsultationSummary) => {
    setAnchorEl(event.currentTarget);
    setSelectedSummary(summary);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSummary(null);
  };

  // 상담 요약 삭제
  const handleDelete = async (summary: ConsultationSummary) => {
    if (!window.confirm('이 상담 요약을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await summariesApi.deleteSummary(summary.id);
      setSummaries(prev => prev.filter(s => s.id !== summary.id));
      handleMenuClose();
    } catch (error) {
      console.error('상담 요약 삭제 실패:', error);
      alert('상담 요약 삭제에 실패했습니다.');
    }
  };

  // 상담 요약 카드 컴포넌트
  const SummaryCard: React.FC<{ summary: ConsultationSummary }> = ({ summary }) => (
    <Card 
      elevation={2}
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 4
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        {/* 헤더 - 날짜와 메뉴 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DateIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {new Date(summary.consultation_date).toLocaleDateString('ko-KR')}
            </Typography>
          </Box>
          <IconButton 
            size="small"
            onClick={(e) => handleMenuOpen(e, summary)}
          >
            <MoreIcon />
          </IconButton>
        </Box>

        {/* 요약 내용 미리보기 */}
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.5
          }}
        >
          {summary.summary_text}
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* 메타 정보 */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {summary.created_by && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PersonIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 16 }} />
              <Typography variant="caption" color="text.secondary">
                상담자: {summary.created_by}
              </Typography>
            </Box>
          )}
          
          <Typography variant="caption" color="text.secondary">
            생성일: {new Date(summary.created_at).toLocaleDateString('ko-KR')}
          </Typography>

          {summary.procedures_discussed && summary.procedures_discussed.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                논의된 시술:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {summary.procedures_discussed.slice(0, 3).map((procedureId) => (
                  <Chip 
                    key={procedureId}
                    label={`#${procedureId}`}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem', height: '20px' }}
                  />
                ))}
                {summary.procedures_discussed.length > 3 && (
                  <Chip 
                    label={`+${summary.procedures_discussed.length - 3}`}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem', height: '20px' }}
                  />
                )}
              </Box>
            </Box>
          )}
        </Box>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button 
          size="small" 
          variant="outlined"
          startIcon={<ViewIcon />}
          onClick={() => onSummarySelect?.(summary)}
          fullWidth
        >
          상세 보기
        </Button>
      </CardActions>
    </Card>
  );

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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 검색 및 필터 */}
      <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
        <TextField
          fullWidth
          size="small"
          placeholder="검색..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1); // 검색 시 첫 페이지로
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
        
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          총 {filteredSummaries.length}개
        </Typography>
      </Box>

      {/* 상담 요약 리스트 */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
        {filteredSummaries.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              {searchQuery 
                ? '검색 결과가 없습니다.' 
                : '저장된 상담 요약이 없습니다.'
              }
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {filteredSummaries.map((summary) => (
              <Card 
                key={summary.id}
                elevation={1}
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    elevation: 2,
                    backgroundColor: 'action.hover'
                  }
                }}
                onClick={() => onSummarySelect?.(summary)}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {new Date(summary.consultation_date).toLocaleDateString('ko-KR')}
                    </Typography>
                    <IconButton 
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMenuOpen(e, summary);
                      }}
                    >
                      <MoreIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: 1.3,
                      fontSize: '0.8rem'
                    }}
                  >
                    {summary.summary_text}
                  </Typography>
                  
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {new Date(summary.created_at).toLocaleDateString('ko-KR')}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>

      {/* 컨텍스트 메뉴 */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          if (selectedSummary) {
            onSummarySelect?.(selectedSummary);
          }
          handleMenuClose();
        }}>
          <ViewIcon sx={{ mr: 1 }} />
          상세 보기
        </MenuItem>
        <MenuItem onClick={() => {
          // TODO: 편집 기능 구현
          handleMenuClose();
        }}>
          <EditIcon sx={{ mr: 1 }} />
          편집
        </MenuItem>
        <MenuItem 
          onClick={() => {
            if (selectedSummary) {
              handleDelete(selectedSummary);
            }
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          삭제
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default SummaryList;