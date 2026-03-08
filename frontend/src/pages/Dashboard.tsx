import React from 'react';
import { Typography, Card, CardContent, Grid, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/systems/new')}
                sx={{ mr: 1 }}
              >
                New System
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/systems')}
              >
                View Systems
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Getting Started
              </Typography>
              <Typography variant="body2" color="text.secondary">
                1. Create a new system
              </Typography>
              <Typography variant="body2" color="text.secondary">
                2. Build the hierarchy tree
              </Typography>
              <Typography variant="body2" color="text.secondary">
                3. Add Design Alternatives
              </Typography>
              <Typography variant="body2" color="text.secondary">
                4. Rate quality and compatibility
              </Typography>
              <Typography variant="body2" color="text.secondary">
                5. Run optimization
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};
