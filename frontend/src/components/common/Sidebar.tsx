import React, { useState } from 'react';
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
  Collapse,
} from '@mui/material';
import {
  LocalHospital as ProcedureIcon,
  Assignment as SummaryIcon,
  Menu as MenuIcon,
  History as HistoryIcon,
  Create as CreateIcon,
} from '@mui/icons-material';
import { useAppStore } from '../../stores/appStore';

const SIDEBAR_WIDTH = 200;

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarOpen, setSidebarOpen } = useAppStore();
  const [summaryMenuOpen, setSummaryMenuOpen] = useState(true);

  const menuItems = [
    {
      text: '시술 가이드',
      icon: <ProcedureIcon />,
      path: '/procedures',
    },
    {
      text: '상담 요약',
      icon: <SummaryIcon />,
      hasSubmenu: true,
      path: undefined,
      submenu: [
        {
          text: '요약 생성',
          icon: <CreateIcon />,
          path: '/summaries',
        },
        {
          text: '요약 히스토리',
          icon: <HistoryIcon />,
          path: '/summaries/history',
        },
      ],
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
          p: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h6" component="div" sx={{ color: 'white', fontWeight: 600, fontSize: '1rem' }}>
          포르테
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
          if (item.hasSubmenu) {
            // 서브메뉴가 있는 항목
            const isParentActive = location.pathname.startsWith('/summaries');
            
            return (
              <React.Fragment key={item.text}>
                <ListItem disablePadding>
                  <ListItemButton
                    sx={{
                      mx: 1,
                      mb: 0.5,
                      borderRadius: 1,
                      backgroundColor: isParentActive ? '#3b82f6' : 'transparent',
                      '&:hover': {
                        backgroundColor: isParentActive ? '#2563eb' : '#374151',
                      },
                      cursor: 'default',
                    }}
                  >
                    <ListItemIcon sx={{ color: 'white', minWidth: 35 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text}
                      sx={{
                        '& .MuiListItemText-primary': {
                          fontSize: '0.9rem',
                          fontWeight: isParentActive ? 600 : 400,
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
                <Collapse in={summaryMenuOpen} timeout="auto">
                  <List component="div" disablePadding>
                    {item.submenu?.map((subItem) => {
                      const isSubActive = location.pathname === subItem.path;
                      
                      return (
                        <ListItem key={subItem.text} disablePadding>
                          <ListItemButton
                            onClick={() => handleNavigation(subItem.path)}
                            sx={{
                              mx: 1,
                              mb: 0.5,
                              ml: 3,
                              borderRadius: 1,
                              backgroundColor: isSubActive ? '#2563eb' : 'transparent',
                              '&:hover': {
                                backgroundColor: isSubActive ? '#1d4ed8' : '#374151',
                              },
                            }}
                          >
                            <ListItemIcon sx={{ color: 'white', minWidth: 35 }}>
                              {subItem.icon}
                            </ListItemIcon>
                            <ListItemText 
                              primary={subItem.text}
                              sx={{
                                '& .MuiListItemText-primary': {
                                  fontSize: '0.8rem',
                                  fontWeight: isSubActive ? 600 : 400,
                                },
                              }}
                            />
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                </Collapse>
              </React.Fragment>
            );
          } else {
            // 일반 메뉴 항목
            const isActive = location.pathname === item.path || 
                            (location.pathname === '/' && item.path === '/procedures');
            
            return (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  onClick={() => item.path && handleNavigation(item.path)}
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
                  <ListItemIcon sx={{ color: 'white', minWidth: 35 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text}
                    sx={{
                      '& .MuiListItemText-primary': {
                        fontSize: '0.9rem',
                        fontWeight: isActive ? 600 : 400,
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          }
        })}
      </List>

      {/* 하단 정보 */}
      <Box sx={{ p: 1.5, borderTop: '1px solid #374151' }}>
        <Typography variant="caption" sx={{ color: '#9ca3af', fontSize: '0.7rem' }}>
          v1.0
        </Typography>
      </Box>
    </Drawer>
  );
};

export default Sidebar;