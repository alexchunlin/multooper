import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useSystemStore } from '../../stores/systemStore';

export const Header: React.FC = () => {
  const { toggleSidebar } = useSystemStore();

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={toggleSidebar}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          Multi-Objective Optimization
        </Typography>
        <Box>
          <Typography variant="body2">
            {new Date().toLocaleDateString()}
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
