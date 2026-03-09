import React from 'react';
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Divider, Toolbar, Typography, Box } from '@mui/material';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FolderIcon from '@mui/icons-material/Folder';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import WidgetsIcon from '@mui/icons-material/Widgets';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import SpeedIcon from '@mui/icons-material/Speed';
import TimelineIcon from '@mui/icons-material/Timeline';
import HomeIcon from '@mui/icons-material/Home';
import { useSystemStore } from '../../stores/systemStore';
import { useSystem } from '../../hooks/useApi';

const drawerWidth = 240;

const mainMenuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Systems', icon: <FolderIcon />, path: '/systems' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

const systemMenuItems = [
  { text: 'Overview', icon: <HomeIcon />, pathSegment: '' },
  { text: 'Hierarchy', icon: <AccountTreeIcon />, pathSegment: '/hierarchy' },
  { text: 'Design Alternatives', icon: <WidgetsIcon />, pathSegment: '/das' },
  { text: 'Compatibility', icon: <CompareArrowsIcon />, pathSegment: '/compatibility' },
  { text: 'Optimization', icon: <SpeedIcon />, pathSegment: '/optimization' },
  { text: 'Analysis', icon: <TimelineIcon />, pathSegment: '/analysis' },
];

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { systemId } = useParams<{ systemId: string }>();
  const { sidebarOpen } = useSystemStore();
  const { data: system } = useSystem(systemId);

  const isSystemActive = !!systemId && location.pathname.startsWith(`/systems/${systemId}`);

  return (
    <Drawer
      variant="persistent"
      open={sidebarOpen}
      sx={{
        width: sidebarOpen ? drawerWidth : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar />
      <Divider />

      <List>
        {mainMenuItems.map((item) => (
          <ListItemButton
            key={item.text}
            onClick={() => navigate(item.path)}
            selected={location.pathname === item.path}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>

      {isSystemActive && system && (
        <>
          <Divider />
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="caption" color="text.secondary" noWrap>
              {system.name}
            </Typography>
          </Box>
          <List>
            {systemMenuItems.map((item) => {
              const path = `/systems/${systemId}${item.pathSegment}`;
              return (
                <ListItemButton
                  key={item.text}
                  onClick={() => navigate(path)}
                  selected={location.pathname === path}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              );
            })}
          </List>
        </>
      )}
    </Drawer>
  );
};
