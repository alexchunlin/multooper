import React, { useState, useCallback, useMemo, useEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  Panel,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import type { Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import { CustomNode } from '../components/hierarchy/CustomNode';
import { NodeDetailsPanel } from '../components/hierarchy/NodeDetailsPanel';
import { useHierarchy, useCreateNode, useUpdateNode, useDeleteNode } from '../hooks/useApi';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../components/common/ToastProvider';
import { useSystemStore } from '../stores/systemStore';
import type { SystemNode, NodeType } from '../types/system';

const nodeTypes = {
  custom: CustomNode,
};

const layoutNodes = (nodes: SystemNode[]): { nodes: Node[]; edges: Edge[] } => {
  const flowNodes: Node[] = [];
  const flowEdges: Edge[] = [];
  
  const levels = new Map<string, number>();
  const calculateLevel = (nodeId: string): number => {
    if (levels.has(nodeId)) return levels.get(nodeId)!;
    
    const node = nodes.find(n => n.id === nodeId);
    if (!node || !node.parentId) {
      levels.set(nodeId, 0);
      return 0;
    }
    
    const parentLevel = calculateLevel(node.parentId);
    levels.set(nodeId, parentLevel + 1);
    return parentLevel + 1;
  };
  
  nodes.forEach(node => calculateLevel(node.id));
  
  const nodesByLevel = new Map<number, SystemNode[]>();
  nodes.forEach(node => {
    const level = levels.get(node.id) || 0;
    if (!nodesByLevel.has(level)) nodesByLevel.set(level, []);
    nodesByLevel.get(level)!.push(node);
  });
  
  const NODE_WIDTH = 220;
  const NODE_HEIGHT = 120;
  const HORIZONTAL_SPACING = 50;
  const VERTICAL_SPACING = 80;
  
  nodesByLevel.forEach((levelNodes, level) => {
    const totalWidth = levelNodes.length * NODE_WIDTH + (levelNodes.length - 1) * HORIZONTAL_SPACING;
    const startX = -totalWidth / 2;
    
    levelNodes.forEach((node, index) => {
      const x = startX + index * (NODE_WIDTH + HORIZONTAL_SPACING);
      const y = level * (NODE_HEIGHT + VERTICAL_SPACING);
      
      flowNodes.push({
        id: node.id,
        type: 'custom',
        position: { x, y },
        data: {
          label: node.name,
          type: node.type,
          description: node.description,
          childCount: nodes.filter(n => n.parentId === node.id).length,
        },
      });
      
      if (node.parentId) {
        flowEdges.push({
          id: `${node.parentId}-${node.id}`,
          source: node.parentId,
          target: node.id,
          type: 'smoothstep',
        });
      }
    });
  });
  
  return { nodes: flowNodes, edges: flowEdges };
};

function HierarchyEditorInner() {
  const { currentSystemId } = useSystemStore();
  const { showSuccess, showError } = useToast();
  const reactFlowInstance = useReactFlow();
  
  const { data: hierarchy = [], isLoading, error, refetch } = useHierarchy(currentSystemId ?? undefined);
  const createMutation = useCreateNode();
  const updateMutation = useUpdateNode();
  const deleteMutation = useDeleteNode();
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<SystemNode | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [addingChildTo, setAddingChildTo] = useState<string | null>(null);
  
  useEffect(() => {
    if (hierarchy.length > 0) {
      const { nodes: flowNodes, edges: flowEdges } = layoutNodes(hierarchy);
      setNodes(flowNodes);
      setEdges(flowEdges);
    }
  }, [hierarchy, setNodes, setEdges]);
  
  const handleAddNode = useCallback((parentId: string | null = null) => {
    setSelectedNode(null);
    setAddingChildTo(parentId);
    setPanelOpen(true);
  }, []);
  
  const handleEditNode = useCallback((nodeId: string) => {
    const node = hierarchy.find(n => n.id === nodeId);
    if (node) {
      setSelectedNode(node);
      setAddingChildTo(null);
      setPanelOpen(true);
    }
  }, [hierarchy]);
  
  const handleDeleteNode = useCallback(async (nodeId: string) => {
    try {
      await deleteMutation.mutateAsync({ systemId: currentSystemId!, nodeId });
      showSuccess('Node deleted');
    } catch (err) {
      showError('Failed to delete node');
      console.error(err);
    }
  }, [currentSystemId, deleteMutation, showSuccess, showError]);
  
  const handleSaveNode = useCallback(async (id: string, data: Partial<SystemNode>) => {
    try {
      if (addingChildTo) {
        await createMutation.mutateAsync({
          systemId: currentSystemId!,
          data: {
            name: data.name || 'New Node',
            type: (data.type || 'component') as NodeType,
            parentId: addingChildTo,
            description: data.description,
          },
        });
        showSuccess('Node created');
        setAddingChildTo(null);
      } else {
        await updateMutation.mutateAsync({
          systemId: currentSystemId!,
          nodeId: id,
          data: {
            name: data.name,
            description: data.description,
            parentId: data.parentId ?? undefined,
          },
        });
        showSuccess('Node updated');
      }
    } catch (err) {
      showError('Failed to save node');
      console.error(err);
    }
  }, [currentSystemId, addingChildTo, createMutation, updateMutation, showSuccess, showError]);
  
  const handleAddChild = useCallback((parentId: string) => {
    handleAddNode(parentId);
  }, [handleAddNode]);
  
  const customNodeData = useMemo(() => {
    return {
      onEdit: handleEditNode,
      onDelete: handleDeleteNode,
      onAddChild: handleAddChild,
    };
  }, [handleEditNode, handleDeleteNode, handleAddChild]);
  
  const nodesWithHandlers = useMemo(() => {
    return nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        ...customNodeData,
      },
    }));
  }, [nodes, customNodeData]);
  
  const filteredNodes = useMemo(() => {
    if (!searchTerm) return nodesWithHandlers;
    
    return nodesWithHandlers.filter(node => {
      const nodeData = hierarchy.find(n => n.id === node.id);
      return nodeData?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             nodeData?.description?.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [nodesWithHandlers, searchTerm, hierarchy]);
  
  const fitView = useCallback(() => {
    reactFlowInstance?.fitView({ padding: 0.2 });
  }, [reactFlowInstance]);

  if (isLoading) {
    return <LoadingSpinner message="Loading hierarchy..." />;
  }

  if (error) {
    return (
      <Box p={3}>
        <ErrorAlert
          title="Failed to Load Hierarchy"
          message={error.message || 'Could not load system hierarchy.'}
          onRetry={() => refetch()}
        />
      </Box>
    );
  }
  
  return (
    <Box sx={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Hierarchy Editor
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {hierarchy.length} nodes in system
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
            }}
            sx={{ width: 250 }}
          />
          
          <Tooltip title="Add root node">
            <Button
              variant="contained"
              startIcon={createMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
              onClick={() => handleAddNode(null)}
              disabled={createMutation.isPending}
            >
              Add Root
            </Button>
          </Tooltip>
        </Box>
      </Box>
      
      {hierarchy.length === 0 ? (
        <Paper sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }} elevation={3}>
          <EmptyState
            title="No Hierarchy Yet"
            message="Start building your system hierarchy by adding a root node."
            actionLabel="Add Root Node"
            onAction={() => handleAddNode(null)}
          />
        </Paper>
      ) : (
        <Paper sx={{ flex: 1, overflow: 'hidden' }} elevation={3}>
          <ReactFlow
            nodes={filteredNodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.1}
            maxZoom={2}
          >
            <Controls />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            
            <Panel position="top-right">
              <Tooltip title="Center view">
                <IconButton
                  onClick={fitView}
                  sx={{ backgroundColor: 'white', '&:hover': { backgroundColor: '#f5f5f5' } }}
                >
                  <CenterFocusStrongIcon />
                </IconButton>
              </Tooltip>
            </Panel>
          </ReactFlow>
        </Paper>
      )}
      
      <NodeDetailsPanel
        open={panelOpen}
        node={selectedNode}
        onClose={() => {
          setPanelOpen(false);
          setSelectedNode(null);
          setAddingChildTo(null);
        }}
        onSave={handleSaveNode}
        onDelete={handleDeleteNode}
        parentId={addingChildTo}
        isSaving={createMutation.isPending || updateMutation.isPending}
      />
    </Box>
  );
}

export const HierarchyEditor: React.FC = () => {
  return (
    <ReactFlowProvider>
      <HierarchyEditorInner />
    </ReactFlowProvider>
  );
};
