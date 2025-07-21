import React from 'react';
import {
  ListItem,
  ListItemButton,
  ListItemText,
  Chip,
  Box,
  Typography,
  useTheme,
  alpha
} from '@mui/material';
import { Procedure } from '../../types';

interface ProcedureListItemProps {
  procedure: Procedure;
  selected?: boolean;
  onClick: (procedure: Procedure) => void;
}

const ProcedureListItem: React.FC<ProcedureListItemProps> = ({ 
  procedure, 
  selected = false, 
  onClick 
}) => {
  const theme = useTheme();

  // 카테고리 색상 매핑
  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'A': return theme.palette.primary.main; // 주사 시술 - 파란색
      case 'B': return theme.palette.secondary.main; // 레이저/RF 시술 - 보라색
      case 'C': return theme.palette.success.main; // 리프팅 시술 - 초록색
      case 'D': return theme.palette.warning.main; // 재생/체형 - 오렌지색
      default: return theme.palette.grey[500];
    }
  };

  const getCategoryName = (category?: string) => {
    switch (category) {
      case 'A': return '주사';
      case 'B': return '레이저/RF';
      case 'C': return '리프팅';
      case 'D': return '재생/체형';
      default: return '기타';
    }
  };

  return (
    <ListItem 
      disablePadding
      sx={{
        mb: 0.5,
        '&:last-child': { mb: 0 }
      }}
    >
      <ListItemButton
        onClick={() => onClick(procedure)}
        selected={selected}
        sx={{
          borderRadius: 1,
          px: 2,
          py: 1.5,
          border: selected ? `2px solid ${theme.palette.primary.main}` : '1px solid transparent',
          backgroundColor: selected 
            ? alpha(theme.palette.primary.main, 0.08)
            : 'transparent',
          '&:hover': {
            backgroundColor: selected 
              ? alpha(theme.palette.primary.main, 0.12)
              : alpha(theme.palette.action.hover, 0.08),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
          },
          '&.Mui-selected': {
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.12),
            }
          }
        }}
      >
        <Box sx={{ width: '100%' }}>
          {/* 시술 번호와 이름 */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant="caption"
                sx={{
                  backgroundColor: getCategoryColor(procedure.category),
                  color: 'white',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  minWidth: '24px',
                  textAlign: 'center'
                }}
              >
                {procedure.procedure_number}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: selected ? 600 : 500,
                  color: selected ? 'primary.main' : 'text.primary'
                }}
              >
                {procedure.korean_name}
              </Typography>
            </Box>
            
            <Chip
              label={getCategoryName(procedure.category)}
              size="small"
              sx={{
                backgroundColor: alpha(getCategoryColor(procedure.category), 0.1),
                color: getCategoryColor(procedure.category),
                fontSize: '0.7rem',
                height: '20px',
                fontWeight: 500
              }}
            />
          </Box>

          {/* 영어 이름 */}
          {procedure.english_name && (
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ display: 'block', mb: 0.5 }}
            >
              {procedure.english_name}
            </Typography>
          )}

          {/* 브랜드 정보 */}
          {procedure.brand_info && (
            <Typography 
              variant="caption" 
              color="primary.main"
              sx={{ 
                display: 'block',
                fontWeight: 500,
                fontSize: '0.75rem'
              }}
            >
              {procedure.brand_info}
            </Typography>
          )}
        </Box>
      </ListItemButton>
    </ListItem>
  );
};

export default ProcedureListItem;