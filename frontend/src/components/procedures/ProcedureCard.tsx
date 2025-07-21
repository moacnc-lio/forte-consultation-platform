import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Box,
  Button,
  Divider,
  useTheme
} from '@mui/material';
import { Procedure } from '../../types';

interface ProcedureCardProps {
  procedure: Procedure;
  onDetail?: (procedure: Procedure) => void;
  compact?: boolean;
}

const ProcedureCard: React.FC<ProcedureCardProps> = ({ 
  procedure, 
  onDetail, 
  compact = false 
}) => {
  const theme = useTheme();

  // 카테고리 색상 매핑
  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'A': return '#e3f2fd'; // 주사 시술 - 파란색
      case 'B': return '#f3e5f5'; // 레이저/RF 시술 - 보라색
      case 'C': return '#e8f5e8'; // 리프팅 시술 - 초록색
      case 'D': return '#fff3e0'; // 재생/체형 - 오렌지색
      default: return '#f5f5f5';
    }
  };

  const getCategoryName = (category?: string) => {
    switch (category) {
      case 'A': return '주사 시술';
      case 'B': return '레이저/RF';
      case 'C': return '리프팅';
      case 'D': return '재생/체형';
      default: return '기타';
    }
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: onDetail ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        '&:hover': onDetail ? {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4]
        } : {}
      }}
      onClick={() => onDetail?.(procedure)}
    >
      <CardContent sx={{ flexGrow: 1, p: compact ? 2 : 3 }}>
        {/* 헤더 - 시술 번호, 이름, 카테고리 */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 0.5 }}>
              {procedure.korean_name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {procedure.english_name}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
            <Chip 
              label={`#${procedure.procedure_number}`}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.75rem' }}
            />
            {procedure.category && (
              <Chip
                label={getCategoryName(procedure.category)}
                size="small"
                sx={{
                  backgroundColor: getCategoryColor(procedure.category),
                  fontSize: '0.7rem',
                  height: '24px'
                }}
              />
            )}
          </Box>
        </Box>

        {/* 브랜드 정보 */}
        {procedure.brand_info && (
          <Typography variant="body2" color="primary" sx={{ mb: 1, fontWeight: 500 }}>
            {procedure.brand_info}
          </Typography>
        )}

        {/* 설명 */}
        {procedure.description && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: compact ? 2 : 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.4
            }}
          >
            {procedure.description}
          </Typography>
        )}

        {!compact && (
          <>
            <Divider sx={{ my: 2 }} />
            
            {/* 주요 정보 요약 */}
            <Box sx={{ display: 'grid', gap: 1 }}>
              {procedure.target_areas && (
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    적용 부위:
                  </Typography>
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {procedure.target_areas}
                  </Typography>
                </Box>
              )}
              
              {procedure.duration_info && (
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    지속 기간:
                  </Typography>
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {procedure.duration_info}
                  </Typography>
                </Box>
              )}
            </Box>
          </>
        )}
      </CardContent>

      {onDetail && (
        <CardActions sx={{ px: compact ? 2 : 3, pb: compact ? 2 : 3 }}>
          <Button 
            size="small" 
            variant="outlined" 
            fullWidth
            onClick={(e) => {
              e.stopPropagation();
              onDetail(procedure);
            }}
          >
            자세히 보기
          </Button>
        </CardActions>
      )}
    </Card>
  );
};

export default ProcedureCard;