import React from 'react';
import { Box, Toolbar } from '@mui/material';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useSystemStore } from '../../stores/systemStore';

const drawerWidth = 240;

interface LayoutProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, fullWidth }) => {
  const { sidebarOpen } = useSystemStore();

  return (
    <Box sx={{ display: 'flex' }}>
      <Header />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: fullWidth ? 0 : 3,
          width: sidebarOpen ? `calc(100% - ${drawerWidth}px)` : '100%',
          ml: sidebarOpen ? `${drawerWidth}px` : 0,
          transition: (theme) =>
            theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};
