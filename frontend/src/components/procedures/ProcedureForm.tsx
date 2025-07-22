import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Typography,
  Box,
  Alert
} from '@mui/material';
import { Procedure } from '../../types';
import { proceduresApi } from '../../services/api';

interface ProcedureFormProps {
  open: boolean;
  onClose: () => void;
  procedure?: Procedure | null;
  onSave: (procedure: Procedure) => void;
}

const ProcedureForm: React.FC<ProcedureFormProps> = ({
  open,
  onClose,
  procedure,
  onSave
}) => {
  const [formData, setFormData] = useState({
    procedure_number: '',
    korean_name: '',
    english_name: '',
    category: '',
    brand_info: '',
    description: '',
    target_areas: '',
    duration_info: '',
    effects: '',
    side_effects: '',
    precautions: '',
    price_info: '',
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { code: 'A', name: '주사 시술' },
    { code: 'B', name: '레이저/RF 시술' },
    { code: 'C', name: '리프팅 시술' },
    { code: 'D', name: '재생/체형/피부 관리' }
  ];

  useEffect(() => {
    if (procedure) {
      setFormData({
        procedure_number: procedure.procedure_number?.toString() || '',
        korean_name: procedure.korean_name || '',
        english_name: procedure.english_name || '',
        category: procedure.category || '',
        brand_info: procedure.brand_info || '',
        description: procedure.description || '',
        target_areas: procedure.target_areas || '',
        duration_info: procedure.duration_info || '',
        effects: procedure.effects || '',
        side_effects: procedure.side_effects || '',
        precautions: procedure.precautions || '',
        price_info: procedure.price_info || '',
        is_active: procedure.is_active ?? true
      });
    } else {
      setFormData({
        procedure_number: '',
        korean_name: '',
        english_name: '',
        category: '',
        brand_info: '',
        description: '',
        target_areas: '',
        duration_info: '',
        effects: '',
        side_effects: '',
        precautions: '',
        price_info: '',
        is_active: true
      });
    }
  }, [procedure]);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.korean_name || !formData.procedure_number) {
      setError('시술명과 시술 번호는 필수 입력 항목입니다.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const procedureData = {
        ...formData,
        procedure_number: parseInt(formData.procedure_number),
        version: procedure?.version || 1,
        updated_by: 'admin'
      };

      let savedProcedure;
      if (procedure) {
        // 수정
        savedProcedure = await proceduresApi.updateProcedure(procedure.id, procedureData);
      } else {
        // 생성
        savedProcedure = await proceduresApi.createProcedure(procedureData);
      }

      onSave(savedProcedure);
    } catch (error) {
      console.error('시술 정보 저장 실패:', error);
      setError('시술 정보 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {procedure ? '시술 정보 수정' : '새 시술 추가'}
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="시술 번호"
              type="number"
              value={formData.procedure_number}
              onChange={(e) => handleChange('procedure_number', e.target.value)}
              required
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>카테고리</InputLabel>
              <Select
                value={formData.category}
                label="카테고리"
                onChange={(e) => handleChange('category', e.target.value)}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.code} value={cat.code}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="시술명 (한국어)"
              value={formData.korean_name}
              onChange={(e) => handleChange('korean_name', e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="시술명 (영어)"
              value={formData.english_name}
              onChange={(e) => handleChange('english_name', e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="브랜드 정보"
              value={formData.brand_info}
              onChange={(e) => handleChange('brand_info', e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="시술 설명"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="적용 부위"
              value={formData.target_areas}
              onChange={(e) => handleChange('target_areas', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="지속 기간"
              value={formData.duration_info}
              onChange={(e) => handleChange('duration_info', e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="시술 효과"
              value={formData.effects}
              onChange={(e) => handleChange('effects', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="부작용"
              value={formData.side_effects}
              onChange={(e) => handleChange('side_effects', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="주의사항"
              value={formData.precautions}
              onChange={(e) => handleChange('precautions', e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="가격 정보"
              placeholder="【부위별】00-00만원&#10;【패키지】00-00만원&#10;* 부위별로 구분하여 입력하세요"
              value={formData.price_info}
              onChange={(e) => handleChange('price_info', e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={(e) => handleChange('is_active', e.target.checked)}
                />
              }
              label="활성화 상태"
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          취소
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading}
        >
          {loading ? '저장 중...' : '저장'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProcedureForm;