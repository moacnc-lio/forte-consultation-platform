import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  useTheme,
  alpha
} from '@mui/material';
import {
  AutoAwesome as AIIcon,
  Save as SaveIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { summariesApi } from '../../services/api';
import { SummaryGenerateRequest, SummaryGenerateResponse } from '../../types';

interface SummaryGeneratorProps {
  onSummaryGenerated?: (summary: SummaryGenerateResponse) => void;
}

const SummaryGenerator: React.FC<SummaryGeneratorProps> = ({ onSummaryGenerated }) => {
  const theme = useTheme();
  const [originalText, setOriginalText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedSummary, setGeneratedSummary] = useState<SummaryGenerateResponse | null>(null);

  const handleGenerateSummary = async () => {
    if (!originalText.trim()) {
      setError('상담 내용을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 현재 날짜와 시간을 자동으로 설정
      const currentDate = new Date().toISOString().split('T')[0];
      
      const request: SummaryGenerateRequest = {
        original_text: originalText,
        consultation_date: currentDate,
        prompt_template_id: undefined // 기본 템플릿 사용
      };

      const response = await summariesApi.generateSummary(request);
      setGeneratedSummary(response);
      onSummaryGenerated?.(response);
    } catch (error) {
      console.error('AI 요약 생성 실패:', error);
      setError('AI 요약 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setOriginalText('');
    setGeneratedSummary(null);
    setError(null);
  };


  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 헤더 */}
      <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
          <AIIcon sx={{ mr: 1, color: 'primary.main' }} />
          AI 상담 요약 생성
        </Typography>
      </Box>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2, gap: 2 }}>
        {/* 입력 영역 */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            상담 내용 입력 (일본어)
          </Typography>

          {/* 텍스트 입력 */}
          <TextField
            fullWidth
            multiline
            rows={12}
            label="일본어 상담 내용"
            placeholder="일본어로 된 상담 내용을 입력해주세요..."
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value)}
            sx={{ mb: 2 }}
            helperText={`${originalText.length} / 10000 글자`}
          />

          {/* 에러 표시 */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* 버튼들 */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleGenerateSummary}
              disabled={loading || !originalText.trim()}
              startIcon={loading ? <CircularProgress size={20} /> : <AIIcon />}
              sx={{ flex: 1 }}
            >
              {loading ? 'AI 분석 중...' : 'AI 요약 생성'}
            </Button>
            
            <Button
              variant="outlined"
              onClick={handleClear}
              startIcon={<ClearIcon />}
              disabled={loading}
            >
              초기화
            </Button>
          </Box>
        </Box>

        {/* 결과 영역 */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            한국어 요약 결과
          </Typography>

          {!generatedSummary ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center', 
              flex: 1,
              textAlign: 'center',
              color: 'text.secondary',
              border: `1px dashed ${theme.palette.divider}`,
              borderRadius: 2,
              p: 3
            }}>
              <AIIcon sx={{ fontSize: 60, mb: 2, opacity: 0.3 }} />
              <Typography variant="body1" sx={{ mb: 1 }}>
                AI 요약을 기다리고 있습니다
              </Typography>
              <Typography variant="body2">
                상담 내용을 입력하고 'AI 요약 생성' 버튼을 클릭해주세요.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {/* 요약 메타 정보 */}
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  mb: 2, 
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`
                }}
              >
                <Typography variant="subtitle2" color="success.main" sx={{ fontWeight: 600 }}>
                  요약 완료
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  상담 날짜: {new Date(generatedSummary.consultation_date).toLocaleDateString('ko-KR')} | 
                  생성 시간: {new Date().toLocaleString('ko-KR')}
                </Typography>
              </Paper>

              {/* 요약 내용 */}
              <Box sx={{ 
                flex: 1,
                p: 2, 
                bgcolor: 'background.paper',
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                overflow: 'auto'
              }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {generatedSummary.summary}
                </Typography>
              </Box>

              {/* 저장 버튼 */}
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<SaveIcon />}
                  size="small"
                  onClick={() => {
                    // TODO: 요약 저장 기능 구현
                    console.log('저장 기능 구현 예정');
                  }}
                >
                  요약 저장
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default SummaryGenerator;