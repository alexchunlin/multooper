import React, { useState, useRef, useEffect, memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { Paper, Typography, IconButton, Box, Chip, TextField, MenuItem } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import type { NodeType } from '../../types/system';

interface CustomNodeData {
  label: string;
  type: NodeType;
  description?: string;
  childCount: number;
  tags?: string[];
  onUpdate: (nodeId: string, data: any) => void;
  onDelete: (nodeId: string) => void;
  onAddChild: (nodeId: string) => void;
  isSelected?: boolean;
}

const nodeTypeColors: Record<NodeType, string> = {
  system: '#1976d2',
  subsystem: '#2e7d32',
  module: '#ed6c02',
  component: '#7b1fa2',
  group: '#424242',
};

const nodeTypeLabels: Record<NodeType, string> = {
  system: 'System',
  subsystem: 'Subsystem',
  module: 'Module',
  component: 'Component',
  group: 'Group',
};

export const CustomNode: React.FC<NodeProps<CustomNodeData>> = memo(({ id, data }) => {
  const [editingField, setEditingField] = useState<'name' | 'description' | 'tags' | 'type' | null>(null);
  const [editedName, setEditedName] = useState(data.label);
  const [editedDescription, setEditedDescription] = useState(data.description || '');
  const [editedTags, setEditedTags] = useState<string[]>(data.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [showActions, setShowActions] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);

  const color = nodeTypeColors[data.type];

  useEffect(() => {
    setEditedName(data.label);
    setEditedDescription(data.description || '');
    setEditedTags(data.tags || []);
  }, [data]);

  useEffect(() => {
    if (editingField && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingField]);

  const handleSave = () => {
    if (editingField === 'name' && editedName.trim()) {
      data.onUpdate(id, { name: editedName.trim() });
    } else if (editingField === 'description') {
      data.onUpdate(id, { description: editedDescription || undefined });
    } else if (editingField === 'tags') {
      data.onUpdate(id, { tags: editedTags });
    }
    setEditingField(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setEditingField(null);
      setEditedName(data.label);
      setEditedDescription(data.description || '');
      setEditedTags(data.tags || []);
    }
  };

  const handleBlur = () => {
    if (editingField) {
      handleSave();
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !editedTags.includes(tagInput.trim())) {
      setEditedTags([...editedTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditedTags(editedTags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleTypeChange = (newType: NodeType) => {
    data.onUpdate(id, { type: newType });
  };

  const isGroup = data.type === 'group';
  const typeLabel = nodeTypeLabels[data.type] || data.type;

  return (
    <Paper
      ref={nodeRef}
      elevation={data.isSelected ? 8 : 3}
      sx={{
        minWidth: isGroup ? 400 : 320,
        maxWidth: 600,
        borderRadius: 4,
        border: data.isSelected ? `3px solid ${color}` : `2px solid ${color}`,
        backgroundColor: isGroup ? 'rgba(66, 66, 66, 0.8)' : '#2e2e2e',
        color: '#ffffff',
        cursor: 'move',
        userSelect: 'none',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{
          backgroundColor: color,
          width: 20,
          height: 20,
          border: '3px solid #2e2e2e',
        }}
      />

      <Box sx={{ p: 3 }}>
        {/* Header with type and actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          {editingField === 'type' ? (
            <TextField
              select
              size="small"
              value={data.type}
              onChange={(e) => handleTypeChange(e.target.value as NodeType)}
              sx={{
                '& .MuiSelect-select': {
                  py: 0.5,
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                },
              }}
              SelectProps={{
                MenuProps: {
                  PaperProps: {
                    sx: { bgcolor: '#2e2e2e' },
                  },
                },
              }}
            >
              {(Object.keys(nodeTypeLabels) as NodeType[]).map((value) => (
                <MenuItem key={value} value={value} sx={{ color: '#ffffff' }}>
                  {nodeTypeLabels[value]}
                </MenuItem>
              ))}
            </TextField>
          ) : (
            <Chip
              label={typeLabel}
              size="small"
              onClick={() => setEditingField('type')}
              sx={{
                backgroundColor: color,
                color: '#ffffff',
                fontSize: '0.7rem',
                height: 20,
                fontWeight: 'bold',
                cursor: 'pointer',
                '&:hover': {
                  opacity: 0.8,
                },
              }}
            />
          )}

          {!isGroup && (
            <Box sx={{ display: 'flex', gap: 0.25 }}>
              <IconButton
                size="small"
                onClick={() => data.onAddChild(id)}
                title="Add child"
                sx={{ padding: 0.5, color: '#ffffff', opacity: showActions ? 1 : 0 }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => data.onDelete(id)}
                title="Delete"
                sx={{ padding: 0.5, color: '#ef5350', opacity: showActions ? 1 : 0 }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Box>

        {/* Name field */}
        {editingField === 'name' ? (
          <TextField
            ref={inputRef}
            size="small"
            fullWidth
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            sx={{
              '& .MuiInputBase-input': {
                color: '#ffffff',
                fontSize: '1rem',
                fontWeight: 'bold',
                p: 0.5,
              },
            }}
          />
        ) : (
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 'bold',
              wordBreak: 'break-word',
              color: '#ffffff',
              cursor: 'pointer',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
            onClick={() => setEditingField('name')}
          >
            {data.label}
          </Typography>
        )}

        {/* Description field */}
        {data.description !== undefined && (
          editingField === 'description' ? (
            <TextField
              size="small"
              fullWidth
              multiline
              rows={2}
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              sx={{
                mt: 1,
                '& .MuiInputBase-input': {
                  color: '#b0b0b0',
                  fontSize: '0.8rem',
                  p: 0.5,
                },
              }}
            />
          ) : data.description ? (
            <Typography
              variant="caption"
              sx={{
                wordBreak: 'break-word',
                color: '#b0b0b0',
                cursor: 'pointer',
                mt: 0.5,
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
              onClick={() => setEditingField('description')}
            >
              {data.description}
            </Typography>
          ) : (
            <Typography
              variant="caption"
              sx={{
                color: '#606060',
                cursor: 'pointer',
                mt: 0.5,
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
              onClick={() => setEditingField('description')}
            >
              + Add description
            </Typography>
          )
        )}

        {/* Tags field */}
        {editingField === 'tags' ? (
          <Box sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
              <TextField
                size="small"
                placeholder="Add tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                sx={{
                  flex: 1,
                  '& .MuiInputBase-input': {
                    color: '#b0b0b0',
                    fontSize: '0.8rem',
                    p: 0.5,
                  },
                }}
              />
              <IconButton size="small" onClick={handleAddTag} sx={{ color: '#ffffff' }}>
                <AddIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={handleSave} sx={{ color: '#ffffff' }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {editedTags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  onDelete={() => handleRemoveTag(tag)}
                  sx={{
                    fontSize: '0.8rem',
                    backgroundColor: '#3e3e3e',
                    color: '#b0b0b0',
                  }}
                />
              ))}
            </Box>
          </Box>
        ) : editedTags.length > 0 ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
            {editedTags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                size="small"
                sx={{
                  fontSize: '0.8rem',
                  backgroundColor: '#3e3e3e',
                  color: '#b0b0b0',
                }}
              />
            ))}
            <Chip
              label="+"
              size="small"
              onClick={() => setEditingField('tags')}
              sx={{
                fontSize: '0.8rem',
                backgroundColor: 'transparent',
                color: '#606060',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: '#3e3e3e',
                  color: '#b0b0b0',
                },
              }}
            />
          </Box>
        ) : (
          <Typography
            variant="caption"
            sx={{
              color: '#606060',
              cursor: 'pointer',
              mt: 0.5,
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
            onClick={() => setEditingField('tags')}
          >
            + Add tags
          </Typography>
        )}

        {/* Child count */}
        {data.childCount > 0 && !isGroup && (
          <Typography variant="caption" sx={{ color: '#b0b0b0', mt: 0.5 }}>
            {data.childCount} child{data.childCount !== 1 ? 'ren' : ''}
          </Typography>
        )}
      </Box>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          backgroundColor: color,
          width: 20,
          height: 20,
          border: '3px solid #2e2e2e',
        }}
      />
    </Paper>
  );
});

CustomNode.displayName = 'CustomNode';
