import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Layout, ToastProvider, ErrorBoundary } from './components/common';
import { Dashboard } from './pages/Dashboard';
import { SystemsList } from './pages/SystemsList';
import { SystemOverview } from './pages/SystemOverview';
import { HierarchyEditor } from './pages/HierarchyEditor';
import { DAManager } from './pages/DAManager';
import { CompatibilityEditor } from './pages/CompatibilityEditor';
import { OptimizationPage } from './pages/OptimizationPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { SettingsPage } from './pages/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <ToastProvider>
            <BrowserRouter>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/systems" element={<SystemsList />} />
                  <Route path="/systems/new" element={<SystemsList />} />
                  <Route path="/systems/:systemId" element={<SystemOverview />} />
                  <Route path="/systems/:systemId/hierarchy" element={<HierarchyEditor />} />
                  <Route path="/systems/:systemId/das" element={<DAManager />} />
                  <Route path="/systems/:systemId/compatibility" element={<CompatibilityEditor />} />
                  <Route path="/systems/:systemId/optimization" element={<OptimizationPage />} />
                  <Route path="/systems/:systemId/analysis" element={<AnalysisPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Routes>
              </Layout>
            </BrowserRouter>
          </ToastProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
