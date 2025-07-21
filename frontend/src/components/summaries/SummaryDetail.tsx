import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  Paper,
  Chip,
  Button,
  Divider,
  Tab,
  Tabs,
  useTheme,
  useMediaQuery,
  alpha
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  DateRange as DateIcon,
  Person as PersonIcon,
  Translate as TranslateIcon,
  AutoAwesome as AIIcon
} from '@mui/icons-material';
import { ConsultationSummary } from '../../types';

interface SummaryDetailProps {
  summary: ConsultationSummary | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (summary: ConsultationSummary) => void;
  onDelete?: (summary: ConsultationSummary) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index} style={{ width: '100%' }}>
    {value === index && children}
  </div>
);

const SummaryDetail: React.FC<SummaryDetailProps> = ({
  summary,
  open,
  onClose,
  onEdit,
  onDelete
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [tabValue, setTabValue] = useState(0);

  if (!summary) return null;

  const handleDelete = () => {
    if (window.confirm('이 상담 요약을 삭제하시겠습니까?')) {
      onDelete?.(summary);
      onClose();
    }
  };

  const handlePrint = () => {
    // 프린트 기능 구현
    window.print();
  };

  const handleShare = () => {
    // 공유 기능 구현
    if (navigator.share) {
      navigator.share({
        title: `상담 요약 - ${new Date(summary.consultation_date).toLocaleDateString('ko-KR')}`,
        text: summary.summary_text.substring(0, 100) + '...',
      });
    } else {
      // 클립보드 복사
      navigator.clipboard.writeText(summary.summary_text);
      alert('요약 내용이 클립보드에 복사되었습니다.');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          maxHeight: '90vh',
          minHeight: '70vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 2,
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Box>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 700, mb: 1 }}>
            상담 요약
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <DateIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" color="text.secondary">
                {new Date(summary.consultation_date).toLocaleDateString('ko-KR')}
              </Typography>
            </Box>
            {summary.created_by && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body1" color="text.secondary">
                  {summary.created_by}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
        <IconButton onClick={onClose} size="large">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* 탭 네비게이션 */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            variant="fullWidth"
          >
            <Tab 
              icon={<AIIcon />} 
              iconPosition="start"
              label="한국어 요약" 
            />
            <Tab 
              icon={<TranslateIcon />} 
              iconPosition="start"
              label="일본어 원문" 
            />
          </Tabs>
        </Box>

        <Box sx={{ p: 4 }}>
          {/* 한국어 요약 탭 */}
          <TabPanel value={tabValue} index={0}>
            <Box>
              {/* 요약 메타 정보 */}
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  mb: 3, 
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                  요약 정보
                </Typography>
                <Box sx={{ display: 'grid', gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.primary">
                      생성일시
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(summary.created_at).toLocaleString('ko-KR')}
                    </Typography>
                  </Box>
                  
                  {summary.procedures_discussed && summary.procedures_discussed.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" color="text.primary" sx={{ mb: 1 }}>
                        논의된 시술
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {summary.procedures_discussed.map((procedureId) => (
                          <Chip 
                            key={procedureId}
                            label={`시술 #${procedureId}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Paper>

              {/* 요약 내용 */}
              <Paper 
                elevation={1} 
                sx={{ 
                  p: 4,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  AI 생성 요약
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    lineHeight: 1.8,
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'inherit',
                    fontSize: '1.1rem'
                  }}
                >
                  {summary.summary_text}
                </Typography>
              </Paper>
            </Box>
          </TabPanel>

          {/* 일본어 원문 탭 */}
          <TabPanel value={tabValue} index={1}>
            <Paper 
              elevation={1} 
              sx={{ 
                p: 4,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.info.main, 0.02)
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center' }}>
                <TranslateIcon sx={{ mr: 1, color: 'info.main' }} />
                일본어 원문
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  lineHeight: 1.8,
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'inherit',
                  fontSize: '1.1rem',
                  color: 'text.secondary'
                }}
              >
                {summary.original_text}
              </Typography>
            </Paper>
          </TabPanel>
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        p: 3, 
        borderTop: `1px solid ${theme.palette.divider}`,
        justifyContent: 'space-between'
      }}>
        {/* 왼쪽 버튼들 */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<ShareIcon />}
            onClick={handleShare}
          >
            공유
          </Button>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
          >
            인쇄
          </Button>
        </Box>

        {/* 오른쪽 버튼들 */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          {onDelete && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
            >
              삭제
            </Button>
          )}
          {onEdit && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => onEdit(summary)}
            >
              편집
            </Button>
          )}
          <Button
            variant="contained"
            onClick={onClose}
          >
            닫기
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default SummaryDetail;