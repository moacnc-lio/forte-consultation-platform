import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  useTheme
} from '@mui/material';
import SummaryGenerator from '../components/summaries/SummaryGenerator';
import SummaryList from '../components/summaries/SummaryList';
import SummaryDetail from '../components/summaries/SummaryDetail';
import { ConsultationSummary, SummaryGenerateResponse } from '../types';

const SummariesPage: React.FC = () => {
  const theme = useTheme();
  const [selectedSummary, setSelectedSummary] = useState<ConsultationSummary | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSummaryGenerated = (summary: SummaryGenerateResponse) => {
    // 요약이 생성되면 목록 새로고침
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSummarySelect = (summary: ConsultationSummary) => {
    setSelectedSummary(summary);
    setDetailOpen(true);
  };

  const handleSummaryDelete = (summary: ConsultationSummary) => {
    // 목록 새로고침
    setRefreshTrigger(prev => prev + 1);
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
          AI 상담 요약 - 일본어 상담 내용을 AI가 한국어로 요약해드립니다
        </Typography>
      </Box>

      {/* 마스터-디테일 레이아웃 */}
      <Box sx={{ display: 'flex', gap: 3, height: '100%' }}>
        {/* 왼쪽 패널 - 요약 히스토리 */}
        <Paper 
          elevation={2} 
          sx={{ 
            width: '400px',
            minWidth: '400px',
            display: 'flex',
            flexDirection: 'column',
            height: '600px'
          }}
        >
          <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              요약 히스토리
            </Typography>
          </Box>
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <SummaryList 
              refreshTrigger={refreshTrigger}
              onSummarySelect={handleSummarySelect}
            />
          </Box>
        </Paper>

        {/* 오른쪽 패널 - 상담 내용 입력 및 결과 */}
        <Paper 
          elevation={2} 
          sx={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '600px',
            overflow: 'hidden'
          }}
        >
          <SummaryGenerator onSummaryGenerated={handleSummaryGenerated} />
        </Paper>
      </Box>

      {/* 상담 요약 상세 다이얼로그 */}
      <SummaryDetail
        summary={selectedSummary}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onDelete={handleSummaryDelete}
      />
    </Box>
  );
};

export default SummariesPage;