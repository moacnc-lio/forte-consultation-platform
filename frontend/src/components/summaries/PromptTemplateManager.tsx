import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  FileCopy as CopyIcon,
  CheckCircle as ActiveIcon,
  RadioButtonUnchecked as InactiveIcon,
  Code as TemplateIcon
} from '@mui/icons-material';

interface PromptTemplate {
  id: number;
  name: string;
  version: string;
  template_text: string;
  source_language: string;
  target_language: string;
  is_active: boolean;
  created_from_guide: boolean;
  created_at: string;
}

interface PromptTemplateManagerProps {
  onTemplateSelect?: (template: PromptTemplate) => void;
}

const PromptTemplateManager: React.FC<PromptTemplateManagerProps> = ({ onTemplateSelect }) => {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);

  // 폼 상태
  const [formData, setFormData] = useState({
    name: '',
    version: '',
    template_text: '',
    source_language: 'ja',
    target_language: 'ko',
    is_active: true
  });

  // 기본 템플릿 텍스트
  const defaultTemplateText = `다음은 고객과의 상담 녹취록입니다.  
고객의 성향, 고민, 시술 선택 과정을 정리하고, 상담자의 말투·전달력 평가까지 포함해 병원용 상담일지로 요약해줘.

아래 항목을 기준으로 요약해줘:

1. 🧑 고객 정보 요약  
- 이름(알려진 경우), 연령대, 피부 타입  
- 내원 목적 / 주요 피부 고민  

2. 🧠 고객 성격 및 상담 태도  
- 말투, 결정을 내리는 방식, 시술에 대한 태도  
- 예민한 점 또는 특별히 주의할 점  

3. 💉 관심 시술 및 실제 제안 시술  
- 고객이 직접 언급한 시술  
- 상담자가 제안한 시술  
- 그에 대한 고객 반응 (긍정/부정 여부 포함)  

4. ✅ 상담 결과 및 결정 사항  
- 실제 선택한 시술  
- 패키지, 업그레이드 여부  
- 상담 중 발생한 사전 약속 (예: 서비스 제공, 리뷰 조건, 무통 등 포함)  

5. 🔁 다음 상담 시 참고사항  
- 고객 특성상 주의할 포인트  
- 이어서 설명하거나 제안해야 할 항목  
- 고객이 보류한 항목 (향후 제안 가능성 있는 항목)  

6. 🗣 고객 워딩 및 인상적인 피드백  
- 실제 발언 중 기억해둘 문장  
- 상담자에게 준 반응 중 특징적인 표현  

7. 🎤 상담자 전달력 및 커뮤니케이션 평가  
※ AI는 다음 항목을 기준으로 상담자의 전달력 및 커뮤니케이션을 객관 평가해줘:  
- 상담자의 전반적인 태도 (친절함, 공감도, 리드력 등)  
- 말투의 안정성 (불필요한 추임새/버벅임 유무)  
- 말속도 및 템포 (빠르거나 느린 부분, 고객이 이해했는지 여부)  
- 전달력 (내용이 체계적으로 정리되어 있었는지, 반복 설명 여부 등)  
- 정적 여부 (불필요한 공백, 망설임, 설명의 흐름 끊김 등)

📌 상담자 평가 항목은 **구체적 수치 없이, 정성적 묘사**로 표현해줘.

상담 내용: {input_text}`;

  // 템플릿 목록 로드
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 실제 API 호출 대신 더미 데이터 사용
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const dummyTemplates: PromptTemplate[] = [
        {
          id: 1,
          name: "기본 상담 요약 템플릿",
          version: "v1.0",
          template_text: defaultTemplateText,
          source_language: "ja",
          target_language: "ko",
          is_active: true,
          created_from_guide: true,
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          name: "간단 상담 요약 템플릿",
          version: "v1.0",
          template_text: "다음 일본어 상담 내용을 한국어로 간단히 요약해주세요:\n\n{input_text}",
          source_language: "ja",
          target_language: "ko",
          is_active: false,
          created_from_guide: false,
          created_at: new Date().toISOString()
        }
      ];
      
      setTemplates(dummyTemplates);
    } catch (error) {
      console.error('템플릿 로드 실패:', error);
      setError('템플릿 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      version: 'v1.0',
      template_text: defaultTemplateText,
      source_language: 'ja',
      target_language: 'ko',
      is_active: true
    });
    setDialogOpen(true);
  };

  const handleEditTemplate = (template: PromptTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      version: template.version,
      template_text: template.template_text,
      source_language: template.source_language,
      target_language: template.target_language,
      is_active: template.is_active
    });
    setDialogOpen(true);
    setAnchorEl(null);
  };

  const handleSaveTemplate = async () => {
    try {
      if (editingTemplate) {
        // 수정
        const updatedTemplate = {
          ...editingTemplate,
          ...formData,
          version: editingTemplate.version // 버전은 수정 시 유지
        };
        setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? updatedTemplate : t));
      } else {
        // 신규 생성
        const newTemplate: PromptTemplate = {
          id: Date.now(),
          ...formData,
          created_from_guide: false,
          created_at: new Date().toISOString()
        };
        setTemplates(prev => [...prev, newTemplate]);
      }
      
      setDialogOpen(false);
      setEditingTemplate(null);
    } catch (error) {
      console.error('템플릿 저장 실패:', error);
      setError('템플릿 저장에 실패했습니다.');
    }
  };

  const handleDeleteTemplate = (template: PromptTemplate) => {
    if (window.confirm('이 템플릿을 삭제하시겠습니까?')) {
      setTemplates(prev => prev.filter(t => t.id !== template.id));
    }
    setAnchorEl(null);
  };

  const handleToggleActive = (template: PromptTemplate) => {
    const updatedTemplate = { ...template, is_active: !template.is_active };
    setTemplates(prev => prev.map(t => t.id === template.id ? updatedTemplate : t));
    setAnchorEl(null);
  };

  const handleCopyTemplate = (template: PromptTemplate) => {
    const newTemplate: PromptTemplate = {
      ...template,
      id: Date.now(),
      name: `${template.name} (복사본)`,
      version: 'v1.0',
      is_active: false,
      created_from_guide: false,
      created_at: new Date().toISOString()
    };
    setTemplates(prev => [...prev, newTemplate]);
    setAnchorEl(null);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, template: PromptTemplate) => {
    setAnchorEl(event.currentTarget);
    setSelectedTemplate(template);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTemplate(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center' }}>
            <TemplateIcon sx={{ mr: 2, color: 'primary.main' }} />
            프롬프트 템플릿 관리
          </Typography>
          <Typography variant="body1" color="text.secondary">
            AI 요약 생성에 사용할 프롬프트 템플릿을 관리합니다.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateTemplate}
          size="large"
        >
          새 템플릿 생성
        </Button>
      </Box>

      {/* 템플릿 카드 목록 */}
      <Grid container spacing={3}>
        {templates.map((template) => (
          <Grid item xs={12} md={6} key={template.id}>
            <Card 
              elevation={2}
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative'
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                {/* 헤더 */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {template.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Chip 
                        label={template.version}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        icon={template.is_active ? <ActiveIcon /> : <InactiveIcon />}
                        label={template.is_active ? "활성" : "비활성"}
                        size="small"
                        color={template.is_active ? "success" : "default"}
                        variant="outlined"
                      />
                      {template.created_from_guide && (
                        <Chip
                          label="guide.md 기반"
                          size="small"
                          color="info"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </Box>
                  <IconButton 
                    size="small"
                    onClick={(e) => handleMenuOpen(e, template)}
                  >
                    <MoreIcon />
                  </IconButton>
                </Box>

                {/* 언어 정보 */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {template.source_language.toUpperCase()} → {template.target_language.toUpperCase()}
                  </Typography>
                </Box>

                {/* 템플릿 미리보기 */}
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    display: '-webkit-box',
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    bgcolor: 'grey.50',
                    p: 2,
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    lineHeight: 1.4
                  }}
                >
                  {template.template_text}
                </Typography>

                <Divider sx={{ my: 2 }} />

                {/* 메타 정보 */}
                <Typography variant="caption" color="text.secondary">
                  생성일: {new Date(template.created_at).toLocaleDateString('ko-KR')}
                </Typography>
              </CardContent>

              <CardActions>
                <Button 
                  size="small"
                  onClick={() => onTemplateSelect?.(template)}
                  disabled={!template.is_active}
                >
                  선택
                </Button>
                <Button 
                  size="small"
                  onClick={() => handleEditTemplate(template)}
                >
                  편집
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 템플릿 편집/생성 다이얼로그 */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingTemplate ? '템플릿 편집' : '새 템플릿 생성'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="템플릿 이름"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
            
            <TextField
              fullWidth
              label="버전"
              value={formData.version}
              onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
              required
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>원본 언어</InputLabel>
                <Select
                  value={formData.source_language}
                  label="원본 언어"
                  onChange={(e) => setFormData(prev => ({ ...prev, source_language: e.target.value }))}
                >
                  <MenuItem value="ja">일본어</MenuItem>
                  <MenuItem value="en">영어</MenuItem>
                  <MenuItem value="ko">한국어</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>대상 언어</InputLabel>
                <Select
                  value={formData.target_language}
                  label="대상 언어"
                  onChange={(e) => setFormData(prev => ({ ...prev, target_language: e.target.value }))}
                >
                  <MenuItem value="ko">한국어</MenuItem>
                  <MenuItem value="ja">일본어</MenuItem>
                  <MenuItem value="en">영어</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                />
              }
              label="활성 상태"
            />

            <TextField
              fullWidth
              multiline
              rows={15}
              label="프롬프트 템플릿"
              value={formData.template_text}
              onChange={(e) => setFormData(prev => ({ ...prev, template_text: e.target.value }))}
              placeholder="{input_text}를 사용하여 입력 텍스트를 참조하세요."
              helperText="프롬프트에서 {input_text}는 입력된 상담 내용으로 자동 치환됩니다."
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            취소
          </Button>
          <Button 
            onClick={handleSaveTemplate}
            variant="contained"
            disabled={!formData.name || !formData.template_text}
          >
            저장
          </Button>
        </DialogActions>
      </Dialog>

      {/* 컨텍스트 메뉴 */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => selectedTemplate && handleEditTemplate(selectedTemplate)}>
          <EditIcon sx={{ mr: 1 }} />
          편집
        </MenuItem>
        <MenuItem onClick={() => selectedTemplate && handleCopyTemplate(selectedTemplate)}>
          <CopyIcon sx={{ mr: 1 }} />
          복사
        </MenuItem>
        <MenuItem onClick={() => selectedTemplate && handleToggleActive(selectedTemplate)}>
          {selectedTemplate?.is_active ? <InactiveIcon sx={{ mr: 1 }} /> : <ActiveIcon sx={{ mr: 1 }} />}
          {selectedTemplate?.is_active ? '비활성화' : '활성화'}
        </MenuItem>
        <MenuItem 
          onClick={() => selectedTemplate && handleDeleteTemplate(selectedTemplate)}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          삭제
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default PromptTemplateManager;