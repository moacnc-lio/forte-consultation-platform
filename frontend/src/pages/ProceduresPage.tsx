import React from 'react';
import { 
  Box, 
  Typography, 
  Paper
} from '@mui/material';
import ProcedureMasterDetail from '../components/procedures/ProcedureMasterDetail';

const ProceduresPage: React.FC = () => {
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
          시술 가이드 - 19개 시술의 상세 정보를 확인하고 비교해보세요
        </Typography>
      </Box>

      {/* 콘텐츠 영역 */}
      <Paper 
        elevation={1} 
        sx={{ 
          p: 4,
          minHeight: '600px',
          borderRadius: 2
        }}
      >
        <ProcedureMasterDetail />
      </Paper>
    </Box>
  );
};

export default ProceduresPage;