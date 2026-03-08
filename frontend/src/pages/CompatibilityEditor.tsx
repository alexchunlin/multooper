import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  Alert,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  TextField,
  CircularProgress,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { useSystemStore } from '../stores/systemStore';
import { useHierarchy, useDAs, useCompatibility, useUpdateCompatibility } from '../hooks/useApi';
import type { DesignAlternative } from '../types/da';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useToast } from '../components/common/ToastProvider';

const COMPATIBILITY_COLORS: Record<number, string> = {
  0: '#ef5350', // Red - Incompatible
  1: '#ff9800', // Orange - Poor
  2: '#ffc107', // Yellow - Moderate
  3: '#4caf50', // Green - Good
};

const COMPATIBILITY_LABELS: Record<number, string> = {
  0: 'Incompatible',
  1: 'Poor',
  2: 'Moderate',
  3: 'Good/Excellent',
};

interface CompatibilityCellProps {
  da1: DesignAlternative;
  da2: DesignAlternative;
  value: number | null;
  onClick: () => void;
}

const CompatibilityCell: React.FC<CompatibilityCellProps> = ({ da1, da2, value, onClick }) => {
  const displayValue = value !== null ? value : '-';
  const bgColor = value !== null ? COMPATIBILITY_COLORS[value] : '#e0e0e0';
  const label = value !== null ? COMPATIBILITY_LABELS[value] : 'Not rated';

  return (
    <Tooltip title={`${da1.name} ↔ ${da2.name}: ${label}`}>
      <Box
        onClick={onClick}
        sx={{
          width: 48,
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: bgColor,
          color: value === 0 || value === 3 ? 'white' : 'black',
          fontWeight: 'bold',
          cursor: 'pointer',
          border: '1px solid rgba(0,0,0,0.1)',
          transition: 'transform 0.1s, box-shadow 0.1s',
          '&:hover': {
            transform: 'scale(1.1)',
            boxShadow: 3,
            zIndex: 1,
          },
        }}
      >
        {displayValue}
      </Box>
    </Tooltip>
  );
};

export const CompatibilityEditor: React.FC = () => {
  const { currentSystemId } = useSystemStore();
  const { showSuccess, showError } = useToast();

  const [component1Id, setComponent1Id] = useState<string>('');
  const [component2Id, setComponent2Id] = useState<string>('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPair, setEditingPair] = useState<{ da1: DesignAlternative; da2: DesignAlternative } | null>(null);
  const [ratingValue, setRatingValue] = useState(2);
  const [ratingNotes, setRatingNotes] = useState('');

  // Load data from API
  const { data: hierarchy = [], isLoading: hierarchyLoading } = useHierarchy(currentSystemId ?? undefined);
  const { data: designAlternatives = [], isLoading: dasLoading } = useDAs(currentSystemId ?? undefined);
  const { data: compatibilityRatings = [], isLoading: ratingsLoading, refetch } = useCompatibility(currentSystemId ?? undefined);

  const updateMutation = useUpdateCompatibility();

  const getCompatibilityRating = (da1Id: string, da2Id: string) => {
    return compatibilityRatings.find(
      r => (r.da1Id === da1Id && r.da2Id === da2Id) ||
            (r.da1Id === da2Id && r.da2Id === da1Id)
    );
  };

  const componentNodes = useMemo(() =>
    hierarchy.filter(n => n.type === 'component'),
    [hierarchy]
  );

  const getDAsForComponent = (compId: string) =>
    designAlternatives.filter(da => da.componentId === compId);

  const component1DAs = useMemo(() =>
    component1Id ? designAlternatives.filter(da => da.componentId === component1Id) : [],
    [component1Id, designAlternatives]
  );

  const component2DAs = useMemo(() =>
    component2Id ? designAlternatives.filter(da => da.componentId === component2Id) : [],
    [component2Id, designAlternatives]
  );

  const handleCellClick = (da1: DesignAlternative, da2: DesignAlternative) => {
    const existing = getCompatibilityRating(da1.id, da2.id);
    setEditingPair({ da1, da2 });
    setRatingValue(existing?.value ?? 2);
    setRatingNotes('');
    setEditDialogOpen(true);
  };

  const handleSaveRating = async () => {
    if (!editingPair || !currentSystemId) return;

    try {
      await updateMutation.mutateAsync({
        systemId: currentSystemId,
        data: {
          da1Id: editingPair.da1.id,
          da2Id: editingPair.da2.id,
          value: ratingValue,
        },
      });

      showSuccess('Compatibility rating saved');
      setEditDialogOpen(false);
      setEditingPair(null);
      refetch();
    } catch (err) {
      showError('Failed to save compatibility rating');
      console.error(err);
    }
  };

  const handleBatchFill = async (value: number) => {
    if (!component1Id || !component2Id || !currentSystemId) return;

    const updates: Array<{ da1Id: string; da2Id: string; value: number }> = [];

    component1DAs.forEach(da1 => {
      component2DAs.forEach(da2 => {
        const existing = getCompatibilityRating(da1.id, da2.id);
        if (!existing) {
          updates.push({
            da1Id: da1.id,
            da2Id: da2.id,
            value,
          });
        }
      });
    });

    try {
      for (const update of updates) {
        await updateMutation.mutateAsync({
          systemId: currentSystemId,
          data: update,
        });
      }
      showSuccess(`Filled ${updates.length} ratings`);
      refetch();
    } catch (err) {
      showError('Failed to batch fill ratings');
      console.error(err);
    }
  };

  const stats = useMemo(() => {
    const totalPairs = componentNodes.length * (componentNodes.length - 1) / 2;
    const ratedPairs = compatibilityRatings.length;
    const incompatiblePairs = compatibilityRatings.filter(r => r.value === 0).length;
    const goodPairs = compatibilityRatings.filter(r => r.value >= 2).length;

    return { totalPairs, ratedPairs, incompatiblePairs, goodPairs };
  }, [componentNodes, compatibilityRatings]);

  if (hierarchyLoading || dasLoading || ratingsLoading) {
    return <LoadingSpinner message="Loading compatibility data..." />;
  }

  if (componentNodes.length < 2) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom>
          Compatibility Matrix Editor
        </Typography>
        <Alert severity="info">
          You need at least 2 components with Design Alternatives to rate compatibility.
          Create components in Hierarchy Editor and add DAs in DA Manager first.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Compatibility Matrix Editor
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Chip
            icon={<CheckCircleIcon />}
            label={`${stats.ratedPairs} pairs rated`}
            color="primary"
            variant="outlined"
          />
          <Chip
            icon={<WarningIcon />}
            label={`${stats.incompatiblePairs} incompatible`}
            color="error"
            variant="outlined"
          />
          <Chip
            label={`${stats.goodPairs} good/excellent`}
            color="success"
            variant="outlined"
          />
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Select Component Pair to Rate
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Component 1</InputLabel>
            <Select
              value={component1Id}
              label="Component 1"
              onChange={(e) => setComponent1Id(e.target.value)}
            >
              {componentNodes.map(node => (
                <MenuItem key={node.id} value={node.id} disabled={node.id === component2Id}>
                  {node.name} ({getDAsForComponent(node.id).length} DAs)
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="h6" color="text.secondary">
            ↔
          </Typography>

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Component 2</InputLabel>
            <Select
              value={component2Id}
              label="Component 2"
              onChange={(e) => setComponent2Id(e.target.value)}
            >
              {componentNodes.map(node => (
                <MenuItem key={node.id} value={node.id} disabled={node.id === component1Id}>
                  {node.name} ({getDAsForComponent(node.id).length} DAs)
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {component1Id && component2Id && (
            <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={() => handleBatchFill(0)}
                disabled={updateMutation.isPending}
              >
                Fill 0s
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="success"
                onClick={() => handleBatchFill(3)}
                disabled={updateMutation.isPending}
              >
                Fill 3s
              </Button>
            </Box>
          )}
        </Box>
      </Paper>

      {component1Id && component2Id ? (
        <Paper sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {updateMutation.isPending && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress />
              </Box>
            )}

            {/* Header row */}
            <Box sx={{ display: 'flex', gap: 1, pl: 15 }}>
              {component2DAs.map(da => (
                <Tooltip key={da.id} title={da.description || da.name}>
                  <Box sx={{
                    width: 48,
                    textAlign: 'center',
                    fontSize: '0.7rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {da.name.slice(0, 8)}
                  </Box>
                </Tooltip>
              ))}
            </Box>

            {/* Matrix rows */}
            {component1DAs.map(da1 => (
              <Box key={da1.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title={da1.description || da1.name}>
                  <Box sx={{
                    width: 120,
                    fontSize: '0.8rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {da1.name}
                  </Box>
                </Tooltip>
                {component2DAs.map(da2 => {
                  const rating = getCompatibilityRating(da1.id, da2.id);
                  return (
                    <CompatibilityCell
                      key={`${da1.id}-${da2.id}`}
                      da1={da1}
                      da2={da2}
                      value={rating?.value ?? null}
                      onClick={() => handleCellClick(da1, da2)}
                    />
                  );
                })}
              </Box>
            ))}

            {/* Legend */}
            <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Typography variant="caption" color="text.secondary">
                Legend:
              </Typography>
              {[0, 1, 2, 3].map(val => (
                <Box key={val} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{
                    width: 20,
                    height: 20,
                    backgroundColor: COMPATIBILITY_COLORS[val],
                    border: '1px solid rgba(0,0,0,0.2)',
                  }} />
                  <Typography variant="caption">
                    {val}: {COMPATIBILITY_LABELS[val]}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Paper>
      ) : (
        <Paper sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
          <Typography color="text.secondary">
            Select two different components above to view and edit their compatibility matrix.
          </Typography>
        </Paper>
      )}

      {/* Rating Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Rate Compatibility
        </DialogTitle>
        <DialogContent>
          {editingPair && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" gutterBottom>
                <strong>{editingPair.da1.name}</strong> ↔ <strong>{editingPair.da2.name}</strong>
              </Typography>

              <Box sx={{ mt: 3 }}>
                <Typography gutterBottom>
                  Compatibility: {ratingValue} - {COMPATIBILITY_LABELS[ratingValue]}
                </Typography>
                <Slider
                  value={ratingValue}
                  onChange={(_, value) => setRatingValue(value as number)}
                  min={0}
                  max={3}
                  step={1}
                  marks={[
                    { value: 0, label: '0' },
                    { value: 1, label: '1' },
                    { value: 2, label: '2' },
                    { value: 3, label: '3' },
                  ]}
                  sx={{
                    '& .MuiSlider-thumb': {
                      backgroundColor: COMPATIBILITY_COLORS[ratingValue],
                    },
                    '& .MuiSlider-track': {
                      backgroundColor: COMPATIBILITY_COLORS[ratingValue],
                    },
                  }}
                />
              </Box>

              <Box sx={{ mt: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {[0, 1, 2, 3].map(val => (
                  <Chip
                    key={val}
                    label={`${val}: ${COMPATIBILITY_LABELS[val]}`}
                    onClick={() => setRatingValue(val)}
                    sx={{
                      backgroundColor: ratingValue === val ? COMPATIBILITY_COLORS[val] : undefined,
                      color: ratingValue === val && (val === 0 || val === 3) ? 'white' : undefined,
                    }}
                  />
                ))}
              </Box>

              <TextField
                label="Notes (optional)"
                value={ratingNotes}
                onChange={(e) => setRatingNotes(e.target.value)}
                fullWidth
                multiline
                rows={2}
                sx={{ mt: 3 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveRating} variant="contained" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
