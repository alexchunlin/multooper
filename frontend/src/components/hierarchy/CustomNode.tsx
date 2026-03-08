import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { Paper, Typography, IconButton, Box, Chip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import type { NodeType } from '../../types/system';

interface CustomNodeData {
  label: string;
  type: NodeType;
  description?: string;
  childCount: number;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onAddChild: (id: string) => void;
}

const nodeTypeColors: Record<NodeType, string> = {
  system: '#1976d2',
  subsystem: '#2e7d32',
  module: '#ed6c02',
  component: '#9c27b0',
};

const nodeTypeLabels: Record<NodeType, string> = {
  system: 'System',
  subsystem: 'Subsystem',
  module: 'Module',
  component: 'Component',
};

export const CustomNode: React.FC<NodeProps<CustomNodeData>> = memo(({ id, data }) => {
  const color = nodeTypeColors[data.type];
  
  return (
    <Paper
      elevation={3}
      sx={{
        padding: 2,
        minWidth: 200,
        maxWidth: 300,
        border: `2px solid ${color}`,
        backgroundColor: '#fff',
      }}
    >
      <Handle type="target" position={Position.Top} />
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Chip
            label={nodeTypeLabels[data.type]}
            size="small"
            sx={{
              backgroundColor: color,
              color: '#fff',
              fontSize: '0.7rem',
              height: 20,
            }}
          />
          <Box>
            <IconButton
              size="small"
              onClick={() => data.onAddChild(id)}
              title="Add child"
              sx={{ padding: 0.5 }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => data.onEdit(id)}
              title="Edit"
              sx={{ padding: 0.5 }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => data.onDelete(id)}
              title="Delete"
              sx={{ padding: 0.5 }}
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
        
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', wordBreak: 'break-word' }}>
          {data.label}
        </Typography>
        
        {data.description && (
          <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
            {data.description}
          </Typography>
        )}
        
        {data.childCount > 0 && (
          <Typography variant="caption" color="text.secondary">
            {data.childCount} child{data.childCount !== 1 ? 'ren' : ''}
          </Typography>
        )}
      </Box>
      
      <Handle type="source" position={Position.Bottom} />
    </Paper>
  );
});

CustomNode.displayName = 'CustomNode';
