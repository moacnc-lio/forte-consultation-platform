import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Divider,
  Grid,
  useTheme,
  alpha,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  LocalHospital as ProcedureIcon,
  Schedule as TimeIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Star as StarIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { Procedure } from '../../types';

interface ProcedureDetailPanelProps {
  procedure: Procedure | null;
  onEdit?: (procedure: Procedure) => void;
  onDelete?: (procedure: Procedure) => void;
}

const ProcedureDetailPanel: React.FC<ProcedureDetailPanelProps> = ({ procedure, onEdit, onDelete }) => {
  const theme = useTheme();

  if (!procedure) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100%',
        textAlign: 'center',
        color: 'text.secondary',
        p: 4
      }}>
        <ProcedureIcon sx={{ fontSize: 80, mb: 2, opacity: 0.3 }} />
        <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
          시술을 선택하세요
        </Typography>
        <Typography variant="body1">
          왼쪽 목록에서 시술을 클릭하면<br />
          상세 정보를 확인할 수 있습니다.
        </Typography>
      </Box>
    );
  }

  // 카테고리 정보
  const getCategoryInfo = (category?: string) => {
    switch (category) {
      case 'A': return { name: '주사 시술', color: theme.palette.primary.main, bg: alpha(theme.palette.primary.main, 0.1) };
      case 'B': return { name: '레이저/RF 시술', color: theme.palette.secondary.main, bg: alpha(theme.palette.secondary.main, 0.1) };
      case 'C': return { name: '리프팅 시술', color: theme.palette.success.main, bg: alpha(theme.palette.success.main, 0.1) };
      case 'D': return { name: '재생/체형/피부 관리', color: theme.palette.warning.main, bg: alpha(theme.palette.warning.main, 0.1) };
      default: return { name: '기타', color: theme.palette.grey[500], bg: alpha(theme.palette.grey[500], 0.1) };
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
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        height: '100%',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        backgroundColor: 'background.paper'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ color, mr: 1 }}>{icon}</Box>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ lineHeight: 1.6, whiteSpace: 'pre-line' }}>
        {content}
      </Typography>
    </Paper>
  );

  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      {/* 헤더 */}
      <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 0.5 }}>
              {procedure.korean_name}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              {procedure.english_name}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ml: 2 }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip 
                label={`시술 #${procedure.procedure_number}`}
                variant="outlined"
                size="small"
              />
              {onEdit && (
                <Tooltip title="시술 정보 수정">
                  <IconButton 
                    size="small" 
                    onClick={() => onEdit(procedure)}
                    sx={{ color: 'primary.main' }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {onDelete && (
                <Tooltip title="시술 삭제">
                  <IconButton 
                    size="small" 
                    onClick={() => onDelete(procedure)}
                    sx={{ color: 'error.main' }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
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

        {/* 브랜드 정보 */}
        {procedure.brand_info && (
          <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'primary.50', borderRadius: 1, mt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <StarIcon sx={{ color: 'primary.main', mr: 1, fontSize: 18 }} />
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                {procedure.brand_info}
              </Typography>
            </Box>
          </Paper>
        )}
      </Box>

      {/* 콘텐츠 */}
      <Box sx={{ p: 2 }}>
        {/* 시술 설명 */}
        {procedure.description && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5, display: 'flex', alignItems: 'center' }}>
              <ProcedureIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
              시술 개요
            </Typography>
            <Paper elevation={0} sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.1rem', whiteSpace: 'pre-line' }}>
                {procedure.description}
              </Typography>
            </Paper>
          </Box>
        )}

        {/* 안전 정보 섹션 - 부작용 및 주의사항 우선 표시 */}
        {(procedure.side_effects || procedure.precautions) && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', color: 'error.main' }}>
              <WarningIcon sx={{ mr: 1, color: 'error.main', fontSize: 20 }} />
              안전 정보 및 주의사항
            </Typography>
            <Grid container spacing={3}>
              {procedure.side_effects && (
                <Grid item xs={12} md={6}>
                  <Paper elevation={0} sx={{ 
                    p: 3, 
                    height: '100%',
                    border: `2px solid ${theme.palette.warning.main}`,
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.warning.main, 0.05)
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <WarningIcon sx={{ color: 'warning.main', mr: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'warning.main' }}>
                        부작용
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                      {procedure.side_effects}
                    </Typography>
                  </Paper>
                </Grid>
              )}

              {procedure.precautions && (
                <Grid item xs={12} md={6}>
                  <Paper elevation={0} sx={{ 
                    p: 3, 
                    height: '100%',
                    border: `2px solid ${theme.palette.error.main}`,
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.error.main, 0.05)
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <WarningIcon sx={{ color: 'error.main', mr: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'error.main' }}>
                        주의사항
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                      {procedure.precautions}
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Box>
        )}

        {/* 시술 정보 그리드 */}
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
        </Grid>

        {/* 가격 정보 - 부가 정보 */}
        {procedure.price_info && procedure.price_info.trim() && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1.5, color: 'text.secondary' }}>
              참고 가격
            </Typography>
            <Paper elevation={0} sx={{ 
              p: 2.5, 
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.grey[500], 0.02)
            }}>
              <Typography variant="body2" sx={{ lineHeight: 1.5, whiteSpace: 'pre-line', color: 'text.secondary' }}>
                {procedure.price_info}
              </Typography>
              <Typography variant="caption" sx={{ 
                display: 'block', 
                mt: 1.5, 
                color: 'text.disabled',
                fontSize: '0.8rem'
              }}>
                * 가격은 병원별로 차이가 있을 수 있습니다.
              </Typography>
            </Paper>
          </Box>
        )}

        {/* 추가 정보 */}
        {procedure.additional_info && Object.keys(procedure.additional_info).length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              추가 정보
            </Typography>
            <Paper elevation={0} sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
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
        <Box sx={{ mt: 3, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="caption" color="text.secondary">
            마지막 업데이트: {new Date(procedure.last_updated).toLocaleDateString('ko-KR')} | 
            버전: {procedure.version}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ProcedureDetailPanel;