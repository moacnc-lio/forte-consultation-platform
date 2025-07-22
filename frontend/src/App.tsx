import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';

// 컴포넌트 import
import Sidebar from './components/common/Sidebar';
import Header from './components/common/Header';
import ProceduresPage from './pages/ProceduresPage';
import SummariesPage from './pages/SummariesPage';
import SummaryHistoryPage from './pages/SummaryHistoryPage';
import { useAppStore } from './stores/appStore';

// React Query 클라이언트 설정
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Material-UI 테마 설정 (PC 최적화)
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Oxygen',
      'Ubuntu',
      'Cantarell',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          minWidth: '1366px', // 최소 해상도 1366x768 지원
        },
      },
    },
  },
});

function App() {
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <Box sx={{ display: 'flex', height: '100vh' }}>
            {/* 사이드바 */}
            <Sidebar />
            
            {/* 메인 컨텐츠 영역 */}
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                ml: sidebarOpen ? 0 : '-200px',
                transition: theme.transitions.create(['margin'], {
                  easing: theme.transitions.easing.easeOut,
                  duration: theme.transitions.duration.enteringScreen,
                }),
              }}
            >
              {/* 헤더 */}
              <Header />
              
              {/* 페이지 컨텐츠 */}
              <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
                <Routes>
                  <Route path="/" element={<ProceduresPage />} />
                  <Route path="/procedures" element={<ProceduresPage />} />
                  <Route path="/summaries" element={<SummariesPage />} />
                  <Route path="/summaries/history" element={<SummaryHistoryPage />} />
                </Routes>
              </Box>
            </Box>
          </Box>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;