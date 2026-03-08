import React, { useState } from 'react';
import {
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Box,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSystems, useCreateSystem, useDeleteSystem } from '../hooks/useApi';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../components/common/ToastProvider';

export const SystemsList: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  
  const { data: systems, isLoading, error, refetch } = useSystems();
  const createMutation = useCreateSystem();
  const deleteMutation = useDeleteSystem();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newSystemName, setNewSystemName] = useState('');
  const [newSystemDescription, setNewSystemDescription] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleCreateSystem = async () => {
    if (!newSystemName.trim()) return;

    try {
      const newSystem = await createMutation.mutateAsync({
        name: newSystemName,
        description: newSystemDescription || undefined,
      });
      setDialogOpen(false);
      setNewSystemName('');
      setNewSystemDescription('');
      showSuccess('System created successfully');
      navigate(`/systems/${newSystem.id}`);
    } catch (err) {
      showError('Failed to create system');
      console.error(err);
    }
  };

  const handleDeleteSystem = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      setDeleteConfirmId(null);
      showSuccess('System deleted');
    } catch (err) {
      showError('Failed to delete system');
      console.error(err);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading systems..." />;
  }

  if (error) {
    return (
      <ErrorAlert
        title="Failed to Load Systems"
        message={error.message || 'Could not load systems. Please try again.'}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Systems</Typography>
        <Button
          variant="contained"
          onClick={() => setDialogOpen(true)}
        >
          Create New System
        </Button>
      </Box>

      {!systems || systems.length === 0 ? (
        <EmptyState
          title="No Systems Yet"
          message="Create your first system to get started with multi-objective optimization."
          actionLabel="Create System"
          onAction={() => setDialogOpen(true)}
        />
      ) : (
        <Grid container spacing={3}>
          {systems.map((system) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={system.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="h6" noWrap sx={{ flex: 1 }}>
                      {system.name}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => setDeleteConfirmId(system.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  {system.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {system.description}
                    </Typography>
                  )}
                  <Box display="flex" gap={2} mt={1}>
                    <Typography variant="caption" color="text.disabled">
                      Nodes: {system._count?.nodes ?? 0}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      Solutions: {system._count?.solutions ?? 0}
                    </Typography>
                  </Box>
                  <Typography variant="caption" display="block" color="text.disabled" sx={{ mt: 0.5 }}>
                    Created: {new Date(system.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    onClick={() => navigate(`/systems/${system.id}`)}
                  >
                    Overview
                  </Button>
                  <Button
                    size="small"
                    onClick={() => navigate(`/systems/${system.id}/hierarchy`)}
                  >
                    Hierarchy
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New System</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="System Name"
            fullWidth
            variant="outlined"
            value={newSystemName}
            onChange={(e) => setNewSystemName(e.target.value)}
            sx={{ mb: 2 }}
            error={!newSystemName.trim() && newSystemName !== ''}
            helperText={!newSystemName.trim() && newSystemName !== '' ? 'Name is required' : ''}
          />
          <TextField
            margin="dense"
            label="Description (optional)"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={newSystemDescription}
            onChange={(e) => setNewSystemDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateSystem} 
            variant="contained"
            disabled={!newSystemName.trim() || createMutation.isPending}
          >
            {createMutation.isPending ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} maxWidth="xs">
        <DialogTitle>Delete System?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this system? This will also delete all hierarchy nodes, 
            design alternatives, and solutions. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
          <Button 
            onClick={() => deleteConfirmId && handleDeleteSystem(deleteConfirmId)}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
