import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  useTheme,
  TextField,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import SummaryGenerator from '../components/summaries/SummaryGenerator';
import { ConsultationSummary, SummaryGenerateResponse, SummaryCreate, SummaryCreateDirect } from '../types';
import { summariesApi } from '../services/api';

const SummariesPage: React.FC = () => {
  const theme = useTheme();
  const [generatedSummary, setGeneratedSummary] = useState<SummaryGenerateResponse | null>(null);
  const [editedSummary, setEditedSummary] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSummaryGenerated = (summary: SummaryGenerateResponse) => {
    // 요약이 생성되면 결과 영역에 표시
    setGeneratedSummary(summary);
  };


  // 새로 생성된 요약 저장
  const handleSaveNewSummary = async () => {
    if (!generatedSummary) return;
    
    setSaving(true);
    try {
      const summaryCreateDirect: SummaryCreateDirect = {
        consultation_date: generatedSummary.consultation_date,
        original_text: generatedSummary.original_text,
        summary_text: generatedSummary.summary,
        prompt_template_id: undefined,
        consultant_name: generatedSummary.consultant_name,
        customer_name: generatedSummary.customer_name,
        consultation_title: generatedSummary.consultation_title
      };
      
      await summariesApi.createSummaryDirect(summaryCreateDirect);
      setGeneratedSummary(null); // 저장 후 초기화
    } catch (error) {
      console.error('요약 저장 실패:', error);
    } finally {
      setSaving(false);
    }
  };

  // 수정 시작
  const handleStartEdit = (summaryText: string) => {
    setEditedSummary(summaryText);
    setIsEditing(true);
  };

  // 수정 취소
  const handleCancelEdit = () => {
    setEditedSummary('');
    setIsEditing(false);
  };

  // 수정 저장
  const handleSaveEdit = async () => {
    if (!generatedSummary) return;
    
    setSaving(true);
    try {
      // 새로 생성된 요약을 수정된 내용으로 저장
      const summaryCreateDirect: SummaryCreateDirect = {
        consultation_date: generatedSummary.consultation_date,
        original_text: generatedSummary.original_text,
        summary_text: editedSummary,
        prompt_template_id: undefined,
        consultant_name: generatedSummary.consultant_name,
        customer_name: generatedSummary.customer_name,
        consultation_title: generatedSummary.consultation_title
      };
      
      await summariesApi.createSummaryDirect(summaryCreateDirect);
      setGeneratedSummary(null);
      
      setIsEditing(false);
      setEditedSummary('');
    } catch (error) {
      console.error('요약 수정 저장 실패:', error);
    } finally {
      setSaving(false);
    }
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

      {/* 2열 레이아웃 */}
      <Box sx={{ display: 'flex', gap: 3, height: 'calc(100vh - 200px)' }}>
        {/* 1열 - 상담 생성 */}
        <Paper 
          elevation={2} 
          sx={{ 
            width: '500px',
            minWidth: '500px',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden'
          }}
        >
          <SummaryGenerator onSummaryGenerated={handleSummaryGenerated} />
        </Paper>

        {/* 2열 - 결과 */}
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
              한국어 요약 결과
            </Typography>
          </Box>
          <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
            {generatedSummary ? (
              <Box>
                {/* 새로 생성된 요약 메타 정보 */}
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    mb: 2, 
                    bgcolor: theme.palette.success.light,
                    border: `1px solid ${theme.palette.success.main}`,
                    color: 'white'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        새로 생성된 요약
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        상담 날짜: {new Date(generatedSummary.consultation_date).toLocaleDateString('ko-KR')}<br/>
                        생성 시간: {new Date().toLocaleString('ko-KR')}
                      </Typography>
                    </Box>
                    {!isEditing && (
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleStartEdit(generatedSummary.summary)}
                        sx={{ color: 'white' }}
                      >
                        수정
                      </Button>
                    )}
                  </Box>
                </Paper>

                {/* 요약 내용 */}
                {isEditing ? (
                  <Box>
                    <TextField
                      fullWidth
                      multiline
                      minRows={15}
                      maxRows={25}
                      value={editedSummary}
                      onChange={(e) => setEditedSummary(e.target.value)}
                      sx={{ mb: 2 }}
                      placeholder="요약 내용을 수정하세요..."
                    />
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        startIcon={<CancelIcon />}
                        onClick={handleCancelEdit}
                        disabled={saving}
                      >
                        취소
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
                        onClick={handleSaveEdit}
                        disabled={saving || !editedSummary.trim()}
                      >
                        {saving ? '저장 중...' : '저장'}
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box>
                    <Box sx={{ 
                      p: 2, 
                      bgcolor: 'background.paper',
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                      mb: 2
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
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
                        onClick={handleSaveNewSummary}
                        disabled={saving}
                      >
                        {saving ? '저장 중...' : '요약 저장'}
                      </Button>
                    </Box>
                  </Box>
                )}
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
                  요약 결과가 여기에 표시됩니다
                </Typography>
                <Typography variant="body2">
                  왼쪽에서 새로운 요약을 생성해주세요.
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>

    </Box>
  );
};

export default SummariesPage;