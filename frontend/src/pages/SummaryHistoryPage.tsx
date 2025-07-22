import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  useTheme,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Pagination,
  Divider,
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  DateRange as DateIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { summariesApi } from '../services/api';
import { ConsultationSummary } from '../types';

const SummaryHistoryPage: React.FC = () => {
  const theme = useTheme();
  const [summaries, setSummaries] = useState<ConsultationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedSummary, setSelectedSummary] = useState<ConsultationSummary | null>(null);

  const itemsPerPage = 10;

  // 상담 요약 목록 로드
  useEffect(() => {
    loadSummaries();
  }, []);

  const loadSummaries = async () => {
    setLoading(true);
    setError(null);

    try {
      const summariesData = await summariesApi.getSummaries({
        skip: 0,
        limit: 100
      });
      setSummaries(summariesData);
    } catch (error) {
      console.error('상담 요약 목록 로드 실패:', error);
      setError('상담 요약 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 통합 검색 필터링 및 최신순 정렬 (상담자, 고객 이름, 상담명 기준)
  const filteredSummaries = summaries
    .filter(summary => {
      const query = searchQuery.toLowerCase();
      return (
        // 기존 검색 (요약 텍스트, 원본 텍스트, 생성자)
        summary.summary_text.toLowerCase().includes(query) ||
        summary.original_text.toLowerCase().includes(query) ||
        (summary.created_by && summary.created_by.toLowerCase().includes(query)) ||
        // 새로운 검색 필드들
        (summary.consultant_name && summary.consultant_name.toLowerCase().includes(query)) ||
        (summary.customer_name && summary.customer_name.toLowerCase().includes(query)) ||
        (summary.consultation_title && summary.consultation_title.toLowerCase().includes(query))
      );
    })
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

  const handleSummarySelect = (summary: ConsultationSummary) => {
    setSelectedSummary(summary);
  };


  return (
    <Box>
      {/* 페이지 헤더 */}
      <Box sx={{ mb: 2 }}>
        <Typography 
          variant="h6" 
          component="h1" 
          sx={{ 
            fontSize: '1.2rem',
            fontWeight: 600,
            color: 'primary.main'
          }}
        >
          요약 히스토리 - 과거 생성된 상담 요약 기록을 조회하고 관리할 수 있습니다
        </Typography>
      </Box>

      {/* 2열 레이아웃 */}
      <Box sx={{ display: 'flex', gap: 3, height: 'calc(100vh - 200px)' }}>
        {/* 좌측 - 검색 및 히스토리 목록 */}
        <Paper 
          elevation={2} 
          sx={{ 
            width: '400px',
            minWidth: '400px',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden'
          }}
        >
          {/* 검색 영역 */}
          <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', mb: 2 }}>
              히스토리 목록
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="상담자, 고객명, 상담명으로 검색..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
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

          {/* 목록 영역 */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                <CircularProgress size={40} />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ m: 2 }}>
                {error}
              </Alert>
            ) : paginatedSummaries.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  {searchQuery 
                    ? '검색 결과가 없습니다.' 
                    : '저장된 상담 요약이 없습니다.'
                  }
                </Typography>
              </Box>
            ) : (
              <Box sx={{ p: 1 }}>
                {paginatedSummaries.map((summary) => (
                  <Card 
                    key={summary.id}
                    elevation={selectedSummary?.id === summary.id ? 2 : 0}
                    sx={{ 
                      mb: 0.5,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      backgroundColor: selectedSummary?.id === summary.id ? theme.palette.action.selected : 'background.paper',
                      border: `1px solid ${selectedSummary?.id === summary.id ? theme.palette.primary.main : theme.palette.divider}`,
                      '&:hover': {
                        backgroundColor: selectedSummary?.id === summary.id ? theme.palette.action.selected : theme.palette.action.hover,
                        borderColor: theme.palette.primary.main
                      }
                    }}
                    onClick={() => handleSummarySelect(summary)}
                  >
                    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          {/* 상담명과 날짜 */}
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <DateIcon sx={{ mr: 1, color: 'primary.main', fontSize: 16, flexShrink: 0 }} />
                            <Typography 
                              variant="subtitle2" 
                              sx={{ 
                                fontWeight: selectedSummary?.id === summary.id ? 600 : 500,
                                fontSize: '0.85rem',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                mr: 1
                              }}
                            >
                              {summary.consultation_title || `상담 ${summary.id}`}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(summary.consultation_date).toLocaleDateString('ko-KR')}
                            </Typography>
                          </Box>
                          
                          {/* 상담자와 고객명 */}
                          <Box sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                            {summary.consultant_name && (
                              <Chip 
                                label={`상담자: ${summary.consultant_name}`}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem', height: '20px' }}
                              />
                            )}
                            {summary.customer_name && (
                              <Chip 
                                label={`고객: ${summary.customer_name}`}
                                size="small"
                                variant="outlined"
                                color="primary"
                                sx={{ fontSize: '0.7rem', height: '20px' }}
                              />
                            )}
                          </Box>
                          
                          {/* 요약 미리보기 */}
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                              fontSize: '0.75rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {summary.summary_text.substring(0, 40)}...
                          </Typography>
                        </Box>
                        
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Box>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, newPage) => setPage(newPage)}
                size="small"
                color="primary"
              />
            </Box>
          )}
        </Paper>

        {/* 우측 - 상세 내용 */}
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
          <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
              상세 내용
            </Typography>
          </Box>
          <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
            {selectedSummary ? (
              <Box>
                {/* 요약 메타 정보 */}
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    mb: 2, 
                    bgcolor: theme.palette.grey[50],
                    border: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    요약 정보
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {/* 첫 번째 줄: 상담자, 고객, 상담명 */}
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Typography variant="body2" color="text.secondary">
                        상담자 이름: <span style={{ color: theme.palette.text.primary, fontWeight: 500 }}>
                          {selectedSummary.consultant_name || '-'}
                        </span>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        고객 이름: <span style={{ color: theme.palette.text.primary, fontWeight: 500 }}>
                          {selectedSummary.customer_name || '-'}
                        </span>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        상담명: <span style={{ color: theme.palette.text.primary, fontWeight: 500 }}>
                          {selectedSummary.consultation_title || '-'}
                        </span>
                      </Typography>
                    </Box>
                    
                    {/* 두 번째 줄: 상담생성일 */}
                    <Typography variant="body2" color="text.secondary">
                      상담생성일: <span style={{ color: theme.palette.text.primary, fontWeight: 500 }}>
                        {new Date(selectedSummary.created_at).toLocaleDateString('ko-KR')}
                      </span>
                    </Typography>
                  </Box>
                </Paper>

                {selectedSummary.procedures_discussed && selectedSummary.procedures_discussed.length > 0 && (
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      mt: 2,
                      bgcolor: theme.palette.grey[50],
                      border: `1px solid ${theme.palette.divider}`
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      논의된 시술
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selectedSummary.procedures_discussed.map((procedureId) => (
                        <Chip 
                          key={procedureId}
                          label={`#${procedureId}`}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem', height: '20px' }}
                        />
                      ))}
                    </Box>
                  </Paper>
                )}

                <Divider sx={{ my: 2 }} />

                {/* 원본 텍스트 */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    원본 상담 내용 (일본어)
                  </Typography>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      bgcolor: theme.palette.grey[50],
                      border: `1px solid ${theme.palette.divider}`,
                      maxHeight: '200px',
                      overflow: 'auto'
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                        fontSize: '0.9rem'
                      }}
                    >
                      {selectedSummary.original_text}
                    </Typography>
                  </Paper>
                </Box>

                {/* 요약 내용 */}
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    한국어 요약
                  </Typography>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      bgcolor: 'background.paper',
                      border: `1px solid ${theme.palette.divider}`
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {selectedSummary.summary_text}
                    </Typography>
                  </Paper>
                </Box>
              </Box>
            ) : (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100%',
                textAlign: 'center',
                color: 'text.secondary'
              }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  상세 내용이 여기에 표시됩니다
                </Typography>
                <Typography variant="body2">
                  왼쪽에서 요약을 선택해주세요.
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>

    </Box>
  );
};

export default SummaryHistoryPage;