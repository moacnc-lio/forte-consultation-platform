import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Chip,
  Divider,
  Grid,
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Close as CloseIcon,
  LocalHospital as ProcedureIcon,
  Schedule as TimeIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { Procedure } from '../../types';

interface ProcedureDetailProps {
  procedure: Procedure | null;
  open: boolean;
  onClose: () => void;
}

const ProcedureDetail: React.FC<ProcedureDetailProps> = ({
  procedure,
  open,
  onClose
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  if (!procedure) return null;

  // 카테고리 정보
  const getCategoryInfo = (category?: string) => {
    switch (category) {
      case 'A': return { name: '주사 시술', color: '#1976d2', bg: '#e3f2fd' };
      case 'B': return { name: '레이저/RF 시술', color: '#7b1fa2', bg: '#f3e5f5' };
      case 'C': return { name: '리프팅 시술', color: '#388e3c', bg: '#e8f5e8' };
      case 'D': return { name: '재생/체형/피부 관리', color: '#f57c00', bg: '#fff3e0' };
      default: return { name: '기타', color: '#616161', bg: '#f5f5f5' };
    }
  };

  const categoryInfo = getCategoryInfo(procedure.category);

  // 정보 섹션 컴포넌트
  const InfoSection: React.FC<{ 
    title: string; 
    content: string; 
    icon: React.ReactNode;
    color?: string;
  }> = ({ title, content, icon, color = 'primary.main' }) => (
    <Paper elevation={1} sx={{ p: 3, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ color, mr: 1 }}>{icon}</Box>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
        {content}
      </Typography>
    </Paper>
  );

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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 700, mb: 1 }}>
              {procedure.korean_name}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {procedure.english_name}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Chip 
              label={`시술 #${procedure.procedure_number}`}
              variant="outlined"
              size="small"
            />
            <Chip
              label={categoryInfo.name}
              sx={{
                backgroundColor: categoryInfo.bg,
                color: categoryInfo.color,
                fontWeight: 600
              }}
              size="small"
            />
          </Box>
        </Box>
        <IconButton onClick={onClose} size="large">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 4 }}>
          {/* 브랜드 및 기본 정보 */}
          {procedure.brand_info && (
            <Paper elevation={2} sx={{ p: 3, mb: 4, bgcolor: 'primary.50' }}>
              <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600, mb: 1 }}>
                브랜드 정보
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {procedure.brand_info}
              </Typography>
            </Paper>
          )}

          {/* 시술 설명 */}
          {procedure.description && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                <ProcedureIcon sx={{ mr: 1, color: 'primary.main' }} />
                시술 개요
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.1rem' }}>
                {procedure.description}
              </Typography>
            </Box>
          )}

          <Divider sx={{ my: 4 }} />

          {/* 상세 정보 그리드 */}
          <Grid container spacing={3}>
            {procedure.target_areas && (
              <Grid item xs={12} md={6}>
                <InfoSection
                  title="적용 부위"
                  content={procedure.target_areas}
                  icon={<InfoIcon />}
                  color="info.main"
                />
              </Grid>
            )}

            {procedure.duration_info && (
              <Grid item xs={12} md={6}>
                <InfoSection
                  title="지속 기간"
                  content={procedure.duration_info}
                  icon={<TimeIcon />}
                  color="success.main"
                />
              </Grid>
            )}

            {procedure.effects && (
              <Grid item xs={12}>
                <InfoSection
                  title="시술 효과"
                  content={procedure.effects}
                  icon={<ProcedureIcon />}
                  color="primary.main"
                />
              </Grid>
            )}

            {procedure.side_effects && (
              <Grid item xs={12} md={6}>
                <InfoSection
                  title="부작용"
                  content={procedure.side_effects}
                  icon={<WarningIcon />}
                  color="warning.main"
                />
              </Grid>
            )}

            {procedure.precautions && (
              <Grid item xs={12} md={6}>
                <InfoSection
                  title="주의사항"
                  content={procedure.precautions}
                  icon={<WarningIcon />}
                  color="error.main"
                />
              </Grid>
            )}
          </Grid>

          {/* 추가 정보 */}
          {procedure.additional_info && Object.keys(procedure.additional_info).length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                추가 정보
              </Typography>
              <Paper elevation={1} sx={{ p: 3 }}>
                <Grid container spacing={2}>
                  {Object.entries(procedure.additional_info).map(([key, value]) => (
                    <Grid item xs={12} sm={6} md={4} key={key}>
                      <Box>
                        <Typography variant="caption" sx={{ 
                          fontWeight: 600, 
                          color: 'text.primary',
                          textTransform: 'uppercase',
                          letterSpacing: 0.5
                        }}>
                          {key}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {Array.isArray(value) ? value.join(', ') : String(value)}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Box>
          )}

          {/* 메타 정보 */}
          <Box sx={{ mt: 4, pt: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="caption" color="text.secondary">
              마지막 업데이트: {new Date(procedure.last_updated).toLocaleDateString('ko-KR')} | 
              버전: {procedure.version}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ProcedureDetail;