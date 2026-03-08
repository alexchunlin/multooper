import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Box,
  Chip,
} from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import WidgetsIcon from '@mui/icons-material/Widgets';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import SpeedIcon from '@mui/icons-material/Speed';
import TimelineIcon from '@mui/icons-material/Timeline';
import { useSystem, useHierarchy, useDAs, useSolutionStats } from '../hooks/useApi';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorAlert } from '../components/common/ErrorAlert';

export const SystemOverview: React.FC = () => {
  const { systemId } = useParams<{ systemId: string }>();
  const navigate = useNavigate();

  const { data: system, isLoading: systemLoading, error: systemError } = useSystem(systemId!);
  const { data: hierarchy } = useHierarchy(systemId);
  const { data: das } = useDAs(systemId);
  const { data: solutionStats } = useSolutionStats(systemId);

  if (systemLoading) {
    return <LoadingSpinner message="Loading system..." />;
  }

  if (systemError || !system) {
    return (
      <Box p={3}>
        <ErrorAlert
          title="System Not Found"
          message="This system could not be loaded. It may have been deleted or you may not have access."
          onRetry={() => navigate('/systems')}
        />
      </Box>
    );
  }

  const nodeCount = hierarchy?.length ?? 0;
  const daCount = das?.length ?? 0;
  const componentCount = hierarchy?.filter(n => n.type === 'component')?.length ?? 0;

  const quickLinks = [
    {
      title: 'Hierarchy',
      description: 'Build and manage system hierarchy',
      icon: <AccountTreeIcon />,
      path: `/systems/${systemId}/hierarchy`,
      stats: `${nodeCount} nodes, ${componentCount} components`,
    },
    {
      title: 'Design Alternatives',
      description: 'Manage DAs for each component',
      icon: <WidgetsIcon />,
      path: `/systems/${systemId}/das`,
      stats: `${daCount} alternatives`,
    },
    {
      title: 'Compatibility',
      description: 'Rate compatibility between DAs',
      icon: <CompareArrowsIcon />,
      path: `/systems/${systemId}/compatibility`,
      stats: daCount > 0 ? 'Ready' : 'Add DAs first',
    },
    {
      title: 'Optimization',
      description: 'Configure and run optimization',
      icon: <SpeedIcon />,
      path: `/systems/${systemId}/optimization`,
      stats: componentCount > 0 ? `${componentCount} components` : 'Build hierarchy first',
    },
    {
      title: 'Analysis',
      description: 'View results and analysis',
      icon: <TimelineIcon />,
      path: `/systems/${systemId}/analysis`,
      stats: solutionStats?.totalSolutions 
        ? `${solutionStats.totalSolutions} solutions (${solutionStats.paretoSolutions} Pareto)`
        : 'No results yet',
    },
  ];

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {system.name}
          </Typography>
          {system.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {system.description}
            </Typography>
          )}
          <Typography variant="caption" color="text.disabled">
            Created: {new Date(system.createdAt).toLocaleDateString()} · 
            Updated: {new Date(system.updatedAt).toLocaleDateString()}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Chip 
            label={`${nodeCount} nodes`} 
            color="primary" 
            variant="outlined" 
            size="small"
          />
          <Chip 
            label={`${daCount} DAs`} 
            color="secondary" 
            variant="outlined" 
            size="small"
          />
          {solutionStats?.totalSolutions ? (
            <Chip 
              label={`${solutionStats.paretoSolutions} Pareto solutions`} 
              color="success" 
              variant="outlined" 
              size="small"
            />
          ) : null}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {quickLinks.map((link) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={link.title}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                '&:hover': { boxShadow: 4 },
              }}
              onClick={() => navigate(link.path)}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  {link.icon}
                  <span style={{ marginLeft: 8 }}>{link.title}</span>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {link.description}
                </Typography>
                <Typography variant="caption" color="primary" sx={{ mt: 1, display: 'block' }}>
                  {link.stats}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small">Open</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};
