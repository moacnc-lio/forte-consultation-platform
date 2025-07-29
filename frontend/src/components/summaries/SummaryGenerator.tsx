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
  onStreamingContent?: (content: string, isStreaming: boolean) => void;
}

const SummaryGenerator: React.FC<SummaryGeneratorProps> = ({ onSummaryGenerated, onStreamingContent }) => {
  const theme = useTheme();
  const [originalText, setOriginalText] = useState('');
  const [consultantName, setConsultantName] = useState(''); // 상담자 이름
  const [clientName, setClientName] = useState(''); // 피상담자(고객) 이름
  const [consultationTitle, setConsultationTitle] = useState(''); // 상담명
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedSummary, setGeneratedSummary] = useState<SummaryGenerateResponse | null>(null);
  const [streamedContent, setStreamedContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const handleGenerateSummary = async () => {
    if (!originalText.trim()) {
      setError('상담 내용을 입력해주세요.');
      return;
    }
    if (!consultantName.trim()) {
      setError('상담자 이름을 입력해주세요.');
      return;
    }
    if (!clientName.trim()) {
      setError('피상담자(고객) 이름을 입력해주세요.');
      return;
    }
    if (!consultationTitle.trim()) {
      setError('상담명을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedSummary(null);
    setStreamedContent('');
    setIsStreaming(true);

    try {
      // 현재 날짜와 시간을 자동으로 설정
      const currentDate = new Date().toISOString().split('T')[0];
      
      const request: SummaryGenerateRequest = {
        original_text: originalText,
        consultation_date: currentDate,
        prompt_template_id: undefined // 기본 템플릿 사용
      };

      await summariesApi.generateSummaryStream(
        request,
        // onContent: 실시간으로 받은 내용 표시
        (content: string, accumulated: string) => {
          setStreamedContent(accumulated);
          onStreamingContent?.(accumulated, true);
        },
        // onComplete: 완료 시 최종 처리
        (summary: string, metadata: any) => {
          const enhancedResponse: SummaryGenerateResponse = {
            summary: summary,
            original_text: originalText,
            template_used: metadata.template_used,
            consultation_date: metadata.consultation_date,
            consultant_name: consultantName,
            customer_name: clientName,
            consultation_title: consultationTitle
          };
          
          setGeneratedSummary(enhancedResponse);
          setIsStreaming(false);
          onStreamingContent?.(summary, false);
          onSummaryGenerated?.(enhancedResponse);
        },
        // onError: 에러 처리
        (error: string) => {
          console.error('AI 요약 생성 실패:', error);
          setError('AI 요약 생성에 실패했습니다. 다시 시도해주세요.');
          setIsStreaming(false);
          onStreamingContent?.('', false);
        }
      );
    } catch (error) {
      console.error('AI 요약 생성 실패:', error);
      setError('AI 요약 생성에 실패했습니다. 다시 시도해주세요.');
      setIsStreaming(false);
      onStreamingContent?.('', false);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setOriginalText('');
    setConsultantName('');
    setClientName('');
    setConsultationTitle('');
    setGeneratedSummary(null);
    setStreamedContent('');
    setError(null);
    setIsStreaming(false);
  };


  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* 헤더 */}
      <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
          <AIIcon sx={{ mr: 1, color: 'primary.main' }} />
          AI 상담 요약 생성
        </Typography>
      </Box>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* 고정 입력 헤더 */}
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            상담 정보 및 내용 입력
          </Typography>
        </Box>

        {/* 스크롤 가능한 입력 영역 */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {/* 상담 정보 입력 */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label="상담자 이름"
              placeholder="상담을 진행하는 직원 이름"
              value={consultantName}
              onChange={(e) => setConsultantName(e.target.value)}
              sx={{ flex: 1 }}
              size="small"
            />
            <TextField
              label="고객 이름"
              placeholder="상담받는 고객 이름"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              sx={{ flex: 1 }}
              size="small"
            />
          </Box>
          
          <TextField
            fullWidth
            label="상담명"
            placeholder="예: 2024년 7월 보톡스 상담, 첫 방문 상담 등"
            value={consultationTitle}
            onChange={(e) => setConsultationTitle(e.target.value)}
            sx={{ mb: 2 }}
            size="small"
          />

          {/* 텍스트 입력 */}
          <TextField
            fullWidth
            multiline
            minRows={12}
            maxRows={20}
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
        </Box>

        {/* 고정 버튼 영역 */}
        <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleGenerateSummary}
              disabled={loading || !originalText.trim() || !consultantName.trim() || !clientName.trim() || !consultationTitle.trim()}
              startIcon={loading ? <CircularProgress size={20} /> : <AIIcon />}
              sx={{ flex: 1 }}
            >
              {isStreaming ? 'AI 스트리밍 중...' : loading ? 'AI 분석 중...' : 'AI 요약 생성'}
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
      </Box>
    </Box>
  );
};

export default SummaryGenerator;