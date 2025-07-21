import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountIcon,
} from '@mui/icons-material';
import { useAppStore } from '../../stores/appStore';

const Header: React.FC = () => {
  const { sidebarOpen, setSidebarOpen } = useAppStore();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <AppBar
      position="static"
      elevation={1}
      sx={{
        backgroundColor: 'white',
        color: 'text.primary',
        borderBottom: '1px solid #e5e7eb',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* 좌측 영역 */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {!sidebarOpen && (
            <IconButton
              edge="start"
              color="inherit"
              onClick={toggleSidebar}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            포르테 시술 상담 지원 플랫폼
          </Typography>
          
          <Chip
            label="BETA"
            size="small"
            color="primary"
            sx={{ ml: 2, height: 20, fontSize: '0.7rem' }}
          />
        </Box>

        {/* 우측 영역 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton color="inherit">
            <NotificationsIcon />
          </IconButton>
          
          <IconButton color="inherit">
            <AccountIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;