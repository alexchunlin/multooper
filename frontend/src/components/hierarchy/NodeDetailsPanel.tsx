import React, { useEffect, useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Divider,
  Alert,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import type { SystemNode, NodeType } from '../../types/system';

const schema = yup.object({
  name: yup.string().required('Name is required').min(1, 'Name must be at least 1 character'),
  type: yup.mixed<NodeType>().oneOf(['system', 'subsystem', 'module', 'component']).required(),
  description: yup.string().default(''),
});

interface NodeFormData {
  name: string;
  type: NodeType;
  description: string;
}

interface NodeDetailsPanelProps {
  open: boolean;
  node: SystemNode | null;
  onClose: () => void;
  onSave: (id: string, data: Partial<SystemNode>) => void;
  onDelete: (id: string) => void;
  parentId?: string | null;
  isSaving?: boolean;
}

export const NodeDetailsPanel: React.FC<NodeDetailsPanelProps> = ({
  open,
  node,
  onClose,
  onSave,
  onDelete,
  parentId,
  isSaving = false,
}) => {
  const isNew = !node;
  const [tags, setTags] = useState<string[]>(node?.tags || []);
  const [tagInput, setTagInput] = useState('');

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<NodeFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      type: 'component',
      description: '',
    },
  });

  useEffect(() => {
    if (node) {
      reset({
        name: node.name,
        type: node.type,
        description: node.description || '',
      });
      setTags(node.tags || []);
    } else {
      reset({
        name: '',
        type: parentId ? 'component' : 'system',
        description: '',
      });
      setTags([]);
    }
  }, [node, reset, parentId]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const onSubmit = (data: NodeFormData) => {
    if (node) {
      onSave(node.id, { ...data, tags });
    } else {
      onSave(crypto.randomUUID(), { ...data, tags });
    }
    onClose();
  };

  const handleDelete = () => {
    if (node && window.confirm(`Delete "${node.name}" and all its children?`)) {
      onDelete(node.id);
      onClose();
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: 400, bgcolor: '#1e1e1e' } }}
    >
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            {isNew ? 'Add New Node' : 'Edit Node'}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Name"
                fullWidth
                margin="normal"
                error={!!errors.name}
                helperText={errors.name?.message}
                autoFocus
              />
            )}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Type</InputLabel>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select {...field} label="Type" error={!!errors.type}>
                  <MenuItem value="system">System</MenuItem>
                  <MenuItem value="subsystem">Subsystem</MenuItem>
                  <MenuItem value="module">Module</MenuItem>
                  <MenuItem value="component">Component</MenuItem>
                </Select>
              )}
            />
          </FormControl>

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Description"
                fullWidth
                margin="normal"
                multiline
                rows={4}
                error={!!errors.description}
                helperText={errors.description?.message}
              />
            )}
          />

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ color: '#ffffff' }}>
              Tags
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                size="small"
                placeholder="Add tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                sx={{ flex: 1 }}
              />
              <IconButton
                onClick={handleAddTag}
                disabled={!tagInput.trim()}
                sx={{ color: '#ffffff' }}
              >
                <AddIcon />
              </IconButton>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  onDelete={() => handleRemoveTag(tag)}
                  sx={{
                    fontSize: '0.8rem',
                    backgroundColor: '#3e3e3e',
                    color: '#b0b0b0',
                    '&:hover': {
                      backgroundColor: '#4e4e4e',
                    },
                  }}
                />
              ))}
            </Box>
          </Box>

          {node && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="caption" display="block">
                ID: {node.id}
              </Typography>
              <Typography variant="caption" display="block">
                Children: {node.children.length}
              </Typography>
              <Typography variant="caption" display="block">
                Version: {node.version}
              </Typography>
            </Alert>
          )}

          <Box sx={{ mt: 'auto', pt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={(!isDirty && !isNew) || isSaving}
              sx={{ mb: 1 }}
            >
              {isNew ? 'Add Node' : 'Save Changes'}
            </Button>

            {!isNew && node && (
              <Button
                variant="outlined"
                color="error"
                fullWidth
                onClick={handleDelete}
              >
                Delete Node
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};
