import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Grid,
  Paper,
  Alert,
  LinearProgress,
  Switch,
  FormControlLabel,
  Slider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description';
import { useSystemStore } from '../stores/systemStore';
import { useHierarchy, useDAs, useRatings, useCreateDA, useUpdateDA, useDeleteDA, useSubmitRating, useExperts } from '../hooks/useApi';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../components/common/ToastProvider';
import type { DesignAlternative, MultisetEstimate } from '../types/da';
import type { SystemNode, NodeType } from '../types/system';
import type { Rating } from '../types/rating';

const NODE_TYPE_COLORS: Record<NodeType, string> = {
  system: '#1976d2',
  subsystem: '#2e7d32',
  module: '#ed6c02',
  component: '#9c27b0',
};

const RATING_LABELS = ['Very Poor', 'Poor', 'Average', 'Good', 'Excellent'];

interface ComponentTreeItemProps {
  node: SystemNode;
  allNodes: SystemNode[];
  selectedId: string | null;
  onSelect: (node: SystemNode) => void;
  daCount: number;
  depth?: number;
}

const ComponentTreeItem: React.FC<ComponentTreeItemProps> = ({ 
  node, 
  allNodes, 
  selectedId, 
  onSelect, 
  daCount,
  depth = 0 
}) => {
  const isSelected = node.id === selectedId;
  const children = allNodes.filter(n => n.parentId === node.id);
  const [expanded, setExpanded] = useState(depth < 2);

  return (
    <Box>
      <Box
        onClick={() => node.type === 'component' && onSelect(node)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          py: 0.75,
          px: 1,
          cursor: node.type === 'component' ? 'pointer' : 'default',
          borderRadius: 1,
          backgroundColor: isSelected ? 'action.selected' : 'transparent',
          '&:hover': { backgroundColor: node.type === 'component' ? 'action.hover' : 'transparent' },
          pl: depth * 2 + 1,
        }}
      >
        {children.length > 0 && (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            sx={{ p: 0.25 }}
          >
            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
              {expanded ? '−' : '+'}
            </Typography>
          </IconButton>
        )}
        <FolderIcon sx={{ 
          fontSize: 18, 
          color: NODE_TYPE_COLORS[node.type],
          ml: children.length === 0 ? 2.5 : 0
        }} />
        <Typography variant="body2" sx={{ flexGrow: 1 }}>
          {node.name}
        </Typography>
        {daCount > 0 && (
          <Chip label={daCount} size="small" color="primary" sx={{ height: 20, fontSize: '0.7rem' }} />
        )}
      </Box>
      {expanded && children.map(child => (
        <ComponentTreeItem
          key={child.id}
          node={child}
          allNodes={allNodes}
          selectedId={selectedId}
          onSelect={onSelect}
          daCount={0}
          depth={depth + 1}
        />
      ))}
    </Box>
  );
};

interface DACardProps {
  da: DesignAlternative & { _count?: { ratings: number } };
  ratings: Rating[];
  onEdit: () => void;
  onDelete: () => void;
  onRate: () => void;
  isDeleting: boolean;
}

const DACard: React.FC<DACardProps> = ({ da, ratings, onEdit, onDelete, onRate, isDeleting }) => {
  const avgRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + (r.ordinalValue || 0), 0) / ratings.length
    : null;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', opacity: isDeleting ? 0.5 : 1 }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" component="div" noWrap sx={{ maxWidth: 200 }}>
            {da.name}
          </Typography>
          {da.priority !== undefined && (
            <Chip label={`#${da.priority}`} size="small" color="primary" />
          )}
        </Box>
        
        {da.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {da.description}
          </Typography>
        )}

        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Quality Rating
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
            {avgRating !== null ? (
              <>
                {[1, 2, 3, 4, 5].map((level) => (
                  level <= Math.round(avgRating) ? (
                    <StarIcon key={level} sx={{ color: '#ffc107', fontSize: 20 }} />
                  ) : (
                    <StarBorderIcon key={level} sx={{ color: '#ffc107', fontSize: 20 }} />
                  )
                ))}
                <Typography variant="caption" sx={{ ml: 1 }}>
                  ({avgRating.toFixed(1)})
                </Typography>
              </>
            ) : (
              <Chip label="Not rated" size="small" variant="outlined" />
            )}
          </Box>
        </Box>

        {da.multisetEstimate && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Multiset Estimate (L={da.multisetEstimate.l}, η={da.multisetEstimate.eta})
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
              {da.multisetEstimate.counts.map((count, idx) => (
                <Chip
                  key={idx}
                  label={`η${idx + 1}=${count}`}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
        )}
      </CardContent>
      
      <CardActions>
        <Tooltip title="Rate quality">
          <IconButton size="small" onClick={onRate} color="primary">
            <StarIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit">
          <IconButton size="small" onClick={onEdit}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton size="small" onClick={onDelete} color="error" disabled={isDeleting}>
            {isDeleting ? <></> : <DeleteIcon />}
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
};

interface DAFormData {
  name: string;
  description: string;
  priority: number;
  useMultiset: boolean;
  multisetL: number;
  multisetEta: number;
  multisetCounts: number[];
}

export const DAManager: React.FC = () => {
  const { systemId, setCurrentSystem } = useSystemStore();
  const { showSuccess, showError } = useToast();

  // Set current system on mount
  React.useEffect(() => {
    if (systemId) setCurrentSystem(systemId);
  }, [systemId, setCurrentSystem]);

  // Queries
  const { data: hierarchy = [], isLoading: hierarchyLoading, error: hierarchyError } = useHierarchy(systemId);
  const { data: das = [], isLoading: dasLoading, error: dasError } = useDAs(systemId);
  const { data: ratings = [], isLoading: ratingsLoading } = useRatings(systemId);
  const { data: experts = [] } = useExperts(systemId);

  // Mutations
  const createMutation = useCreateDA();
  const updateMutation = useUpdateDA();
  const deleteMutation = useDeleteDA();
  const ratingMutation = useSubmitRating();

  // Local state
  const [selectedComponent, setSelectedComponent] = useState<SystemNode | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [editingDA, setEditingDA] = useState<DesignAlternative | null>(null);
  const [ratingDA, setRatingDA] = useState<DesignAlternative | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingDAId, setDeletingDAId] = useState<string | null>(null);
  const [daForm, setDaForm] = useState<DAFormData>({
    name: '',
    description: '',
    priority: 1,
    useMultiset: false,
    multisetL: 3,
    multisetEta: 5,
    multisetCounts: [0, 0, 0],
  });
  const [ratingForm, setRatingForm] = useState({
    ordinalValue: 3,
    confidence: 0.8,
    notes: '',
  });

  // Derived data
  const componentNodes = useMemo(() => 
    hierarchy.filter(n => n.type === 'component'), 
    [hierarchy]
  );

  const currentDAs = useMemo(() => 
    selectedComponent 
      ? das.filter(da => da.componentId === selectedComponent.id) 
      : [],
    [selectedComponent, das]
  );

  const getRatingsByDA = useCallback((daId: string) => 
    ratings.filter(r => r.targetId === daId),
    [ratings]
  );

  // Handlers
  const handleOpenAddDialog = useCallback(() => {
    setEditingDA(null);
    setDaForm({
      name: '',
      description: '',
      priority: currentDAs.length + 1,
      useMultiset: false,
      multisetL: 3,
      multisetEta: 5,
      multisetCounts: [0, 0, 0],
    });
    setEditDialogOpen(true);
  }, [currentDAs.length]);

  const handleOpenEditDialog = useCallback((da: DesignAlternative) => {
    setEditingDA(da);
    setDaForm({
      name: da.name,
      description: da.description || '',
      priority: da.priority || 1,
      useMultiset: !!da.multisetEstimate,
      multisetL: da.multisetEstimate?.l || 3,
      multisetEta: da.multisetEstimate?.eta || 5,
      multisetCounts: da.multisetEstimate?.counts || [0, 0, 0],
    });
    setEditDialogOpen(true);
  }, []);

  const handleSaveDA = useCallback(async () => {
    if (!selectedComponent || !daForm.name.trim()) return;

    const multisetEstimate: MultisetEstimate | undefined = daForm.useMultiset ? {
      l: daForm.multisetL,
      eta: daForm.multisetEta,
      counts: daForm.multisetCounts.slice(0, daForm.multisetL),
    } : undefined;

    try {
      if (editingDA) {
        await updateMutation.mutateAsync({
          systemId: systemId!,
          daId: editingDA.id,
          data: {
            name: daForm.name,
            description: daForm.description || undefined,
            priority: daForm.priority,
            multisetEstimate,
          },
        });
        showSuccess('Design Alternative updated');
      } else {
        await createMutation.mutateAsync({
          systemId: systemId!,
          data: {
            componentId: selectedComponent.id,
            name: daForm.name,
            description: daForm.description || undefined,
            priority: daForm.priority,
            multisetEstimate,
          },
        });
        showSuccess('Design Alternative created');
      }
      setEditDialogOpen(false);
    } catch (err) {
      showError('Failed to save Design Alternative');
      console.error(err);
    }
  }, [systemId, selectedComponent, editingDA, daForm, createMutation, updateMutation, showSuccess, showError]);

  const handleOpenDeleteConfirm = useCallback((daId: string) => {
    setDeletingDAId(daId);
    setDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingDAId) return;
    
    try {
      await deleteMutation.mutateAsync({
        systemId: systemId!,
        daId: deletingDAId,
      });
      showSuccess('Design Alternative deleted');
    } catch (err) {
      showError('Failed to delete Design Alternative');
      console.error(err);
    }
    setDeleteConfirmOpen(false);
    setDeletingDAId(null);
  }, [systemId, deletingDAId, deleteMutation, showSuccess, showError]);

  const handleOpenRatingDialog = useCallback((da: DesignAlternative) => {
    setRatingDA(da);
    const existingRatings = getRatingsByDA(da.id);
    const latestRating = existingRatings[existingRatings.length - 1];
    setRatingForm({
      ordinalValue: latestRating?.ordinalValue || 3,
      confidence: latestRating?.confidence || 0.8,
      notes: latestRating?.notes || '',
    });
    setRatingDialogOpen(true);
  }, [getRatingsByDA]);

  const handleSaveRating = useCallback(async () => {
    if (!ratingDA) return;

    // Get or create a default expert
    let expertId = experts[0]?.id;
    if (!expertId) {
      // Need to create a default expert first
      showInfo('Creating default expert...');
      // This would require a createExpert mutation - for now, skip if no expert
      showError('No expert available. Please create an expert first.');
      return;
    }

    try {
      await ratingMutation.mutateAsync({
        systemId: systemId!,
        data: {
          daId: ratingDA.id,
          expertId,
          ordinalValue: ratingForm.ordinalValue,
          confidence: ratingForm.confidence,
          notes: ratingForm.notes || undefined,
        },
      });
      showSuccess('Rating saved');
      setRatingDialogOpen(false);
      setRatingDA(null);
    } catch (err) {
      showError('Failed to save rating');
      console.error(err);
    }
  }, [systemId, ratingDA, experts, ratingForm, ratingMutation, showSuccess, showError]);

  const totalDAs = das.length;
  const ratedDAs = useMemo(() => {
    const ratedIds = new Set(ratings.filter(r => r.targetType === 'DA').map(r => r.targetId));
    return ratedIds.size;
  }, [ratings]);

  const isLoading = hierarchyLoading || dasLoading || ratingsLoading;

  if (isLoading) {
    return <LoadingSpinner message="Loading design alternatives..." />;
  }

  if (hierarchyError || dasError) {
    return (
      <Box p={3}>
        <ErrorAlert
          title="Failed to Load Data"
          message="Could not load design alternatives data."
          onRetry={() => window.location.reload()}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Design Alternatives Manager
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {totalDAs} DAs defined
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • {ratedDAs}/{totalDAs} rated
          </Typography>
          {totalDAs > 0 && (
            <Box sx={{ flexGrow: 1, maxWidth: 200, ml: 2 }}>
              <LinearProgress 
                variant="determinate" 
                value={(ratedDAs / totalDAs) * 100} 
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          )}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, flexGrow: 1, overflow: 'hidden' }}>
        <Paper sx={{ width: 280, overflow: 'auto', p: 1 }}>
          <Typography variant="subtitle2" sx={{ px: 1, py: 1, color: 'text.secondary' }}>
            Components ({componentNodes.length})
          </Typography>
          {componentNodes.length === 0 ? (
            <Alert severity="info" sx={{ m: 1 }}>
              No components found. Create components in the Hierarchy Editor first.
            </Alert>
          ) : (
            componentNodes.map(node => (
              <ComponentTreeItem
                key={node.id}
                node={node}
                allNodes={hierarchy}
                selectedId={selectedComponent?.id || null}
                onSelect={setSelectedComponent}
                daCount={das.filter(da => da.componentId === node.id).length}
              />
            ))
          )}
        </Paper>

        <Paper sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
          {!selectedComponent ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%',
              color: 'text.secondary'
            }}>
              <DescriptionIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
              <Typography>Select a component to manage its Design Alternatives</Typography>
            </Box>
          ) : (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6">{selectedComponent.name}</Typography>
                  {selectedComponent.description && (
                    <Typography variant="body2" color="text.secondary">
                      {selectedComponent.description}
                    </Typography>
                  )}
                </Box>
                <Button
                  variant="contained"
                  startIcon={createMutation.isPending ? undefined : <AddIcon />}
                  onClick={handleOpenAddDialog}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? 'Adding...' : 'Add DA'}
                </Button>
              </Box>

              {currentDAs.length === 0 ? (
                <EmptyState
                  title="No Design Alternatives"
                  message="Click 'Add DA' to create one for this component."
                />
              ) : (
                <Grid container spacing={2}>
                  {currentDAs.map(da => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={da.id}>
                      <DACard
                        da={da}
                        ratings={getRatingsByDA(da.id)}
                        onEdit={() => handleOpenEditDialog(da)}
                        onDelete={() => handleOpenDeleteConfirm(da.id)}
                        onRate={() => handleOpenRatingDialog(da)}
                        isDeleting={deleteMutation.isPending && deletingDAId === da.id}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}
        </Paper>
      </Box>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingDA ? 'Edit Design Alternative' : 'Add Design Alternative'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Name"
              value={daForm.name}
              onChange={(e) => setDaForm({ ...daForm, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={daForm.description}
              onChange={(e) => setDaForm({ ...daForm, description: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              label="Priority"
              type="number"
              value={daForm.priority}
              onChange={(e) => setDaForm({ ...daForm, priority: parseInt(e.target.value) || 1 })}
              fullWidth
              helperText="Ordinal priority (1 = highest)"
              slotProps={{ htmlInput: { min: 1 } }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveDA} 
            variant="contained" 
            disabled={!daForm.name.trim() || createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending ? 'Saving...' : (editingDA ? 'Save' : 'Add')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={ratingDialogOpen} onClose={() => setRatingDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Rate Quality: {ratingDA?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            <Box>
              <Typography gutterBottom>
                Quality Rating: {RATING_LABELS[ratingForm.ordinalValue - 1]}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {[1, 2, 3, 4, 5].map((level) => (
                  <IconButton
                    key={level}
                    onClick={() => setRatingForm({ ...ratingForm, ordinalValue: level })}
                    size="large"
                  >
                    {level <= ratingForm.ordinalValue ? (
                      <StarIcon sx={{ color: '#ffc107' }} />
                    ) : (
                      <StarBorderIcon sx={{ color: '#ffc107' }} />
                    )}
                  </IconButton>
                ))}
              </Box>
            </Box>

            <Box>
              <Typography gutterBottom>
                Confidence: {Math.round(ratingForm.confidence * 100)}%
              </Typography>
              <Slider
                value={ratingForm.confidence}
                onChange={(_, value) => setRatingForm({ ...ratingForm, confidence: value as number })}
                min={0}
                max={1}
                step={0.1}
                marks={[
                  { value: 0, label: 'Low' },
                  { value: 0.5, label: 'Medium' },
                  { value: 1, label: 'High' },
                ]}
              />
            </Box>

            <TextField
              label="Notes (optional)"
              value={ratingForm.notes}
              onChange={(e) => setRatingForm({ ...ratingForm, notes: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRatingDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveRating} 
            variant="contained"
            disabled={ratingMutation.isPending}
          >
            {ratingMutation.isPending ? 'Saving...' : 'Save Rating'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this Design Alternative? This will also delete all associated ratings. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Helper function - will be replaced by a proper createExpert mutation
const showInfo = (message: string) => {
  console.log('Info:', message);
};
