import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Alert,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TuneIcon from '@mui/icons-material/Tune';
import { useSystemStore } from '../stores/systemStore';
import { useOptimizationStore } from '../stores/optimizationStore';
import type { Solution, QualityVector } from '../types/optimization';
import type { DesignAlternative } from '../types/da';
import { v4 as uuidv4 } from 'uuid';

// HMMD Algorithm Implementation
const computeMinCompatibility = (
  selections: Record<string, string>,
  compatibilityRatings: Array<{ da1Id: string; da2Id: string; value: number }>
): number => {
  const daIds = Object.values(selections);
  let minCompat = Infinity;

  for (let i = 0; i < daIds.length; i++) {
    for (let j = i + 1; j < daIds.length; j++) {
      const rating = compatibilityRatings.find(r =>
        (r.da1Id === daIds[i] && r.da2Id === daIds[j]) ||
        (r.da1Id === daIds[j] && r.da2Id === daIds[i])
      );
      const compat = rating?.value ?? 0;
      minCompat = Math.min(minCompat, compat);
      if (minCompat === 0) return 0; // Early exit
    }
  }

  return minCompat === Infinity ? 0 : minCompat;
};

const computeQualityDistribution = (
  selections: Record<string, string>,
  das: DesignAlternative[],
  levels: number = 3
): number[] => {
  const distribution = Array(levels).fill(0);
  
  Object.values(selections).forEach(daId => {
    const da = das.find(d => d.id === daId);
    if (da && da.priority !== undefined) {
      const levelIndex = Math.min(da.priority - 1, levels - 1);
      distribution[levelIndex]++;
    }
  });

  return distribution;
};

const compareQualityVectors = (a: QualityVector, b: QualityVector): number => {
  // Compare w first
  if (a.w !== b.w) return b.w - a.w;
  
  // Compare e lexicographically (prefer more high-quality)
  for (let i = 0; i < a.e.length; i++) {
    if (a.e[i] !== b.e[i]) return b.e[i] - a.e[i];
  }
  
  return 0;
};

const isDominated = (solution: Solution, allSolutions: Solution[]): boolean => {
  for (const other of allSolutions) {
    if (other.id === solution.id) continue;
    
    const otherBetterW = other.qualityVector.w >= solution.qualityVector.w;
    const otherBetterE = solution.qualityVector.e.every((e, i) => other.qualityVector.e[i] >= e);
    const otherStrictlyBetter = 
      other.qualityVector.w > solution.qualityVector.w ||
      solution.qualityVector.e.some((e, i) => other.qualityVector.e[i] > e);
    
    if (otherBetterW && otherBetterE && otherStrictlyBetter) {
      return true;
    }
  }
  return false;
};

const cartesianProduct = <T,>(arrays: T[][]): T[][] => {
  if (arrays.length === 0) return [[]];
  
  return arrays.reduce(
    (acc, arr) => acc.flatMap(combo => arr.map(item => [...combo, item])),
    [[]] as T[][]
  );
};

export const OptimizationPage: React.FC = () => {
  const {
    hierarchy,
    designAlternatives,
    compatibilityRatings,
  } = useSystemStore();

  const {
    solutions,
    paretoSolutions,
    isRunning,
    progress,
    setSolutions,
    setParetoSolutions,
    setRunning,
    setProgress,
    clearResults,
  } = useOptimizationStore();

  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);
  const [minCompatibility, setMinCompatibility] = useState(1);

  const componentNodes = useMemo(() =>
    hierarchy.filter(n => n.type === 'component'),
    [hierarchy]
  );

  const componentsWithDAs = useMemo(() =>
    componentNodes.filter(c =>
      designAlternatives.some(da => da.componentId === c.id)
    ),
    [componentNodes, designAlternatives]
  );

  const handleSelectAllComponents = () => {
    setSelectedComponents(componentsWithDAs.map(c => c.id));
  };

  const runOptimization = useCallback(async () => {
    if (selectedComponents.length < 2) {
      alert('Please select at least 2 components');
      return;
    }

    setRunning(true);
    setProgress(0);
    clearResults();

    // Get DAs for each selected component
    const componentDAs = selectedComponents.map(compId =>
      designAlternatives.filter(da => da.componentId === compId)
    );

    // Check if all components have DAs
    if (componentDAs.some(das => das.length === 0)) {
      alert('Some selected components have no Design Alternatives');
      setRunning(false);
      return;
    }

    // Generate all combinations
    const daArrays = componentDAs.map(das => das.map(da => da.id));
    const allCombinations = cartesianProduct(daArrays);
    const totalCombinations = allCombinations.length;

    const allSolutions: Solution[] = [];
    let processed = 0;

    // Process in batches to avoid blocking UI
    const batchSize = 100;
    
    for (let i = 0; i < allCombinations.length; i += batchSize) {
      const batch = allCombinations.slice(i, i + batchSize);
      
      for (const combo of batch) {
        const selections: Record<string, string> = {};
        selectedComponents.forEach((compId, idx) => {
          selections[compId] = combo[idx];
        });

        const w = computeMinCompatibility(selections, compatibilityRatings);
        
        if (w >= minCompatibility) {
          const e = computeQualityDistribution(selections, designAlternatives);
          
          const solution: Solution = {
            id: uuidv4(),
            systemId: 'current',
            selections,
            qualityVector: {
              w,
              e,
              wLabel: w === 3 ? 'Excellent' : w === 2 ? 'Good' : w === 1 ? 'Poor' : 'Incompatible',
              eLabel: `(${e.join(', ')})`,
            },
            isParetoEfficient: false,
            createdAt: new Date(),
            version: 1,
          };
          
          allSolutions.push(solution);
        }

        processed++;
      }

      setProgress((processed / totalCombinations) * 100);
      
      // Allow UI to update
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    // Find Pareto-efficient solutions
    const pareto = allSolutions.filter(s => !isDominated(s, allSolutions));
    pareto.forEach((s, idx) => {
      s.isParetoEfficient = true;
      s.paretoRank = idx + 1;
    });

    // Sort by quality
    pareto.sort((a, b) => compareQualityVectors(a.qualityVector, b.qualityVector));
    allSolutions.sort((a, b) => compareQualityVectors(a.qualityVector, b.qualityVector));

    setSolutions(allSolutions);
    setParetoSolutions(pareto);
    setRunning(false);
    setProgress(100);
  }, [selectedComponents, designAlternatives, compatibilityRatings, minCompatibility, setRunning, setProgress, clearResults, setSolutions, setParetoSolutions]);

  const getDAName = (daId: string) => {
    const da = designAlternatives.find(d => d.id === daId);
    return da?.name || daId;
  };

  const getComponentName = (compId: string) => {
    const comp = hierarchy.find(n => n.id === compId);
    return comp?.name || compId;
  };

  if (componentNodes.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom>
          Optimization Dashboard
        </Typography>
        <Alert severity="info">
          No components found. Create components in the Hierarchy Editor and add Design Alternatives first.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Optimization Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Run HMMD optimization to find Pareto-efficient system configurations
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <TuneIcon />
              <Typography variant="h6">Configuration</Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Components to Optimize</InputLabel>
                  <Select
                    multiple
                    value={selectedComponents}
                    onChange={(e) => setSelectedComponents(e.target.value as string[])}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((id) => (
                          <Chip key={id} label={getComponentName(id)} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {componentsWithDAs.map(comp => (
                      <MenuItem key={comp.id} value={comp.id}>
                        <Checkbox checked={selectedComponents.includes(comp.id)} />
                        <ListItemText 
                          primary={comp.name} 
                          secondary={`${designAlternatives.filter(da => da.componentId === comp.id).length} DAs`}
                        />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button size="small" onClick={handleSelectAllComponents} sx={{ mt: 1 }}>
                  Select All
                </Button>
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Min Compatibility</InputLabel>
                  <Select
                    value={minCompatibility}
                    label="Min Compatibility"
                    onChange={(e) => setMinCompatibility(e.target.value as number)}
                  >
                    <MenuItem value={0}>0 (Include incompatible)</MenuItem>
                    <MenuItem value={1}>1 (Poor+)</MenuItem>
                    <MenuItem value={2}>2 (Moderate+)</MenuItem>
                    <MenuItem value={3}>3 (Good only)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={isRunning ? <StopIcon /> : <PlayArrowIcon />}
                  onClick={isRunning ? () => setRunning(false) : runOptimization}
                  disabled={selectedComponents.length < 2}
                  color={isRunning ? 'error' : 'primary'}
                  sx={{ height: 56 }}
                >
                  {isRunning ? 'Stop' : 'Run Optimization'}
                </Button>
              </Grid>
            </Grid>

            {isRunning && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Processing combinations... {Math.round(progress)}%
                </Typography>
                <LinearProgress variant="determinate" value={progress} />
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <EmojiEventsIcon color="primary" />
                <Typography variant="h6">Results Summary</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="h3" color="primary">
                    {paretoSolutions.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pareto-efficient
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="h3">
                    {solutions.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total feasible
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {paretoSolutions.length > 0 && (
        <Paper sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Pareto-Efficient Solutions
          </Typography>
          <TableContainer>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Rank</TableCell>
                  <TableCell>w(S)</TableCell>
                  <TableCell>e(S)</TableCell>
                  {selectedComponents.map(compId => (
                    <TableCell key={compId}>
                      <Tooltip title={getComponentName(compId)}>
                        <span>{getComponentName(compId).slice(0, 10)}...</span>
                      </Tooltip>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paretoSolutions.slice(0, 50).map((solution, idx) => (
                  <TableRow 
                    key={solution.id}
                    sx={{ 
                      backgroundColor: idx === 0 ? 'rgba(76, 175, 80, 0.1)' : undefined,
                    }}
                  >
                    <TableCell>
                      <Chip 
                        label={`#${idx + 1}`} 
                        size="small" 
                        color={idx === 0 ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={solution.qualityVector.w}
                        size="small"
                        color={
                          solution.qualityVector.w === 3 ? 'success' :
                          solution.qualityVector.w === 2 ? 'warning' :
                          'error'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {solution.qualityVector.eLabel}
                      </Typography>
                    </TableCell>
                    {selectedComponents.map(compId => (
                      <TableCell key={compId}>
                        <Tooltip title={getDAName(solution.selections[compId])}>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 100 }}>
                            {getDAName(solution.selections[compId])}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {paretoSolutions.length > 50 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Showing first 50 of {paretoSolutions.length} Pareto-efficient solutions
            </Typography>
          )}
        </Paper>
      )}

      {solutions.length === 0 && !isRunning && progress === 100 && (
        <Alert severity="warning">
          No feasible solutions found with the current constraints. Try lowering the minimum compatibility threshold.
        </Alert>
      )}
    </Box>
  );
};
