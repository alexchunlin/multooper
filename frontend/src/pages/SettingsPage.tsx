import React from 'react';
import { Typography, Card, CardContent } from '@mui/material';

export const SettingsPage: React.FC = () => {
  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Card>
        <CardContent>
          <Typography variant="body1" color="text.secondary">
            Settings page coming soon.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Settings to implement:
          </Typography>
          <ul>
            <li>Theme toggle (light/dark)</li>
            <li>Expert profiles</li>
            <li>Aggregation method defaults</li>
            <li>Export preferences</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
