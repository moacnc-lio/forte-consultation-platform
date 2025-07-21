import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import {
  LocalHospital as ProcedureIcon,
  Assignment as SummaryIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useAppStore } from '../../stores/appStore';

const SIDEBAR_WIDTH = 280;

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarOpen, setSidebarOpen } = useAppStore();

  const menuItems = [
    {
      text: '시술 가이드',
      icon: <ProcedureIcon />,
      path: '/procedures',
    },
    {
      text: '상담 요약',
      icon: <SummaryIcon />,
      path: '/summaries',
    },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={sidebarOpen}
      sx={{
        width: sidebarOpen ? SIDEBAR_WIDTH : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: SIDEBAR_WIDTH,
          boxSizing: 'border-box',
          backgroundColor: '#1e293b',
          color: 'white',
        },
      }}
    >
      {/* 헤더 */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h6" component="div" sx={{ color: 'white', fontWeight: 600 }}>
          포르테 플랫폼
        </Typography>
        <MenuIcon
          sx={{ cursor: 'pointer', color: 'white' }}
          onClick={toggleSidebar}
        />
      </Box>

      <Divider sx={{ borderColor: '#374151' }} />

      {/* 네비게이션 메뉴 */}
      <List sx={{ flexGrow: 1, py: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || 
                          (location.pathname === '/' && item.path === '/procedures');
          
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  mx: 1,
                  mb: 0.5,
                  borderRadius: 1,
                  backgroundColor: isActive ? '#3b82f6' : 'transparent',
                  '&:hover': {
                    backgroundColor: isActive ? '#2563eb' : '#374151',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontSize: '0.95rem',
                      fontWeight: isActive ? 600 : 400,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* 하단 정보 */}
      <Box sx={{ p: 2, borderTop: '1px solid #374151' }}>
        <Typography variant="caption" sx={{ color: '#9ca3af' }}>
          포르테 시술 상담 지원 플랫폼 v1.0
        </Typography>
      </Box>
    </Drawer>
  );
};

export default Sidebar;