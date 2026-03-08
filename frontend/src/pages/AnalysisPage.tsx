import React, { useMemo, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Grid,
  Button,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import TimelineIcon from '@mui/icons-material/Timeline';
import TableChartIcon from '@mui/icons-material/TableChart';
import DownloadIcon from '@mui/icons-material/Download';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import * as d3 from 'd3';
import { useSystemStore } from '../stores/systemStore';
import { useSolutions, useSolutionStats, useHierarchy, useDAs } from '../hooks/useApi';
import type { Solution } from '../types/optimization';

const ParetoChart: React.FC<{ solutions: Solution[] }> = ({ solutions }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || solutions.length === 0) return;

    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const width = 500 - margin.left - margin.right;
    const height = 350 - margin.top - margin.bottom;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Calculate quality scores for plotting
    const data = solutions.map(s => ({
      solution: s,
      w: s.qualityVector.w,
      eScore: s.qualityVector.e.reduce((sum, val, idx) => sum + val * (s.qualityVector.e.length - idx), 0),
    }));

    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, Math.max(...data.map(d => d.w)) + 0.5])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, Math.max(...data.map(d => d.eScore)) + 1])
      .range([height, 0]);

    // Axes
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(4))
      .append('text')
      .attr('x', width / 2)
      .attr('y', 40)
      .attr('fill', 'black')
      .style('text-anchor', 'middle')
      .text('Compatibility w(S)');

    svg.append('g')
      .call(d3.axisLeft(yScale))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -50)
      .attr('x', -height / 2)
      .attr('fill', 'black')
      .style('text-anchor', 'middle')
      .text('Quality Score');

    // Points
    svg.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.w))
      .attr('cy', d => yScale(d.eScore))
      .attr('r', 6)
      .attr('fill', (_, i) => i === 0 ? '#4caf50' : '#1976d2')
      .attr('opacity', 0.7)
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .style('cursor', 'pointer');

    // Add labels for top solutions
    data.slice(0, 5).forEach((d, i) => {
      svg.append('text')
        .attr('x', xScale(d.w) + 10)
        .attr('y', yScale(d.eScore) + 4)
        .attr('font-size', '10px')
        .attr('fill', '#666')
        .text(`#${i + 1}`);
    });

    // Title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -5)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text('Pareto Frontier');

  }, [solutions]);

  return <svg ref={svgRef}></svg>;
};

const QualityDistributionChart: React.FC<{ solutions: Solution[] }> = ({ solutions }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || solutions.length === 0) return;

    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const width = 400 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Aggregate quality distributions
    const levelCounts = [0, 0, 0];
    solutions.forEach(s => {
      s.qualityVector.e.forEach((count, idx) => {
        if (idx < levelCounts.length) {
          levelCounts[idx] += count;
        }
      });
    });

    const data = levelCounts.map((count, i) => ({
      level: `Priority ${i + 1}`,
      count: count / solutions.length,
    }));

    const xScale = d3.scaleBand()
      .domain(data.map(d => d.level))
      .range([0, width])
      .padding(0.3);

    const yScale = d3.scaleLinear()
      .domain([0, Math.max(...data.map(d => d.count)) * 1.1])
      .range([height, 0]);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    svg.append('g')
      .call(d3.axisLeft(yScale).ticks(5));

    svg.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', d => xScale(d.level)!)
      .attr('y', d => yScale(d.count))
      .attr('width', xScale.bandwidth())
      .attr('height', d => height - yScale(d.count))
      .attr('fill', (_, i) => ['#4caf50', '#ff9800', '#f44336'][i]);

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -5)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text('Avg Quality Distribution');

  }, [solutions]);

  return <svg ref={svgRef}></svg>;
};

export const AnalysisPage: React.FC = () => {
  const { currentSystemId } = useSystemStore();
  const { data: hierarchy = [], isLoading: hierarchyLoading } = useHierarchy(currentSystemId ?? undefined);
  const { data: designAlternatives = [], isLoading: dasLoading } = useDAs(currentSystemId ?? undefined);
  const { data: paretoSolutions = [], isLoading: solutionsLoading } = useSolutions(currentSystemId ?? undefined, true);
  const { data: stats } = useSolutionStats(currentSystemId ?? undefined);

  const isLoading = hierarchyLoading || dasLoading || solutionsLoading;
  const totalSolutions = stats?.totalSolutions ?? 0;

  const getDAName = (daId: string) => {
    const da = designAlternatives.find(d => d.id === daId);
    return da?.name || daId;
  };

  const getComponentName = (compId: string) => {
    const comp = hierarchy.find(n => n.id === compId);
    return comp?.name || compId;
  };

  const statistics = useMemo(() => {
    if (paretoSolutions.length === 0) return null;

    const avgW = paretoSolutions.reduce((sum, s) => sum + s.qualityVector.w, 0) / paretoSolutions.length;
    const maxW = Math.max(...paretoSolutions.map(s => s.qualityVector.w));
    const minW = Math.min(...paretoSolutions.map(s => s.qualityVector.w));

    // Most frequently selected DAs
    const daFrequency: Record<string, number> = {};
    paretoSolutions.forEach(s => {
      Object.values(s.selections).forEach(daId => {
        daFrequency[daId] = (daFrequency[daId] || 0) + 1;
      });
    });

    const topDAs = Object.entries(daFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([daId, count]) => {
        const da = designAlternatives.find(d => d.id === daId);
        return {
          name: da?.name || daId,
          count,
          percentage: (count / paretoSolutions.length) * 100,
        };
      });

    return { avgW, maxW, minW, topDAs };
  }, [paretoSolutions, designAlternatives]);

  const exportToCSV = () => {
    if (paretoSolutions.length === 0) return;

    const componentIds = Object.keys(paretoSolutions[0].selections);
    const headers = ['Rank', 'w(S)', 'e(S)', ...componentIds.map(id => getComponentName(id))];
    
    const rows = paretoSolutions.map((s, idx) => [
      idx + 1,
      s.qualityVector.w,
      s.qualityVector.eLabel,
      ...componentIds.map(compId => getDAName(s.selections[compId])),
    ]);

    const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pareto_solutions.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (paretoSolutions.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom>
          Analysis & Results
        </Typography>
        <Alert severity="info">
          No saved solutions. Run optimization and save results from the Optimization Dashboard.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Analysis & Results
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {paretoSolutions.length} Pareto-efficient solutions from {totalSolutions} total saved
            {stats?.lastRunAt && ` • Last optimization: ${new Date(stats.lastRunAt).toLocaleString()}`}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={exportToCSV}
        >
          Export CSV
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <EmojiEventsIcon color="primary" />
                <Typography variant="h6">Best Solution</Typography>
              </Box>
              {paretoSolutions[0] && (
                <Box>
                  <Typography variant="h4" color="success.main">
                    w = {paretoSolutions[0].qualityVector.w}
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    e = {paretoSolutions[0].qualityVector.eLabel}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {statistics && (
          <>
            <Grid size={{ xs: 12, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Compatibility Range
                  </Typography>
                  <Typography variant="h5">
                    {statistics.minW} - {statistics.maxW}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg: {statistics.avgW.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Most Frequently Selected DAs
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {statistics.topDAs.map(da => (
                      <Tooltip key={da.name} title={`${da.percentage.toFixed(0)}% of solutions`}>
                        <Chip
                          label={`${da.name} (${da.count})`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Tooltip>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
      </Grid>

      <Grid container spacing={2} sx={{ flex: 1, overflow: 'hidden' }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <TimelineIcon />
              <Typography variant="h6">Visualizations</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', flex: 1 }}>
              <ParetoChart solutions={paretoSolutions} />
              <QualityDistributionChart solutions={paretoSolutions} />
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <TableChartIcon />
              <Typography variant="h6">Top Solutions</Typography>
            </Box>
            <TableContainer sx={{ flex: 1 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Rank</TableCell>
                    <TableCell>w(S)</TableCell>
                    <TableCell>e(S)</TableCell>
                    <TableCell>Configuration</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paretoSolutions.slice(0, 15).map((solution, idx) => (
                    <TableRow key={solution.id}>
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
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {Object.entries(solution.selections).slice(0, 3).map(([compId, daId]) => (
                            <Tooltip key={compId} title={`${getComponentName(compId)}: ${getDAName(daId)}`}>
                              <Chip
                                label={getDAName(daId).slice(0, 10)}
                                size="small"
                                variant="outlined"
                              />
                            </Tooltip>
                          ))}
                          {Object.keys(solution.selections).length > 3 && (
                            <Chip label="..." size="small" variant="outlined" />
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
