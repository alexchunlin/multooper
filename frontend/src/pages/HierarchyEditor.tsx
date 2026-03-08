import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import { CustomNode } from '../components/hierarchy/CustomNode';
import { useHierarchy, useCreateNode, useUpdateNode, useDeleteNode } from '../hooks/useApi';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../components/common/ToastProvider';
import { useSystemStore } from '../stores/systemStore';
import type { SystemNode } from '../types/system';

const nodeTypes = {
  custom: CustomNode,
};

function HierarchyEditorInner() {
  const { systemId } = useParams<{ systemId: string }>();
  const { currentSystemId, setCurrentSystem } = useSystemStore();
  const { showSuccess, showError } = useToast();
  const reactFlowInstance = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (systemId && systemId !== currentSystemId) {
      setCurrentSystem(systemId);
    }
  }, [systemId, currentSystemId, setCurrentSystem]);

  const { data: hierarchy = [], isLoading, error, refetch } = useHierarchy(currentSystemId ?? undefined);
  const createMutation = useCreateNode();
  const updateMutation = useUpdateNode();
  const deleteMutation = useDeleteNode();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);

  // Convert hierarchy nodes to ReactFlow nodes using stored positions
  useEffect(() => {
    if (hierarchy.length > 0) {
      const flowNodes: Node[] = hierarchy.map((node) => ({
        id: node.id,
        type: 'custom',
        position: { x: node.x || 0, y: node.y || 0 },
        data: {
          label: node.name,
          type: node.type,
          description: node.description,
          tags: node.tags || [],
          childCount: hierarchy.filter(n => n.parentId === node.id).length,
          onUpdate: handleUpdateNode,
          onDelete: handleDeleteNode,
          onAddChild: handleAddChildToNode,
          isSelected: selectedNodes.includes(node.id),
        },
        selected: selectedNodes.includes(node.id),
      }));

      const flowEdges: Edge[] = hierarchy
        .filter(node => node.parentId && !node.groupId)
        .map((node) => ({
          id: `${node.parentId}-${node.id}`,
          source: node.parentId!,
          target: node.id,
          type: 'default',
          animated: false,
          style: { stroke: '#b0b0b0', strokeWidth: 2 },
        }));

      setNodes(flowNodes);
      setEdges(flowEdges);
    }
  }, [hierarchy, selectedNodes]);

  const handleAddNode = useCallback(async (position: { x: number; y: number }, parentId?: string | null) => {
    try {
      await createMutation.mutateAsync({
        systemId: currentSystemId!,
        data: {
          name: 'New Node',
          type: 'component',
          parentId: parentId || undefined,
          description: '',
          tags: [],
          x: position.x,
          y: position.y,
        },
      });
      showSuccess('Node created');
      await refetch();
    } catch (err) {
      showError('Failed to create node');
      console.error(err);
    }
  }, [currentSystemId, createMutation, showSuccess, showError, refetch]);

  const handleUpdateNode = useCallback(async (nodeId: string, data: Partial<SystemNode>) => {
    try {
      await updateMutation.mutateAsync({
        systemId: currentSystemId!,
        nodeId,
        data,
      });
      showSuccess('Node updated');
    } catch (err) {
      showError('Failed to update node');
      console.error(err);
    }
  }, [currentSystemId, updateMutation, showSuccess, showError]);

  const handleDeleteNode = useCallback(async (nodeId: string) => {
    if (!window.confirm('Delete this node?')) return;

    try {
      await deleteMutation.mutateAsync({ systemId: currentSystemId!, nodeId });
      showSuccess('Node deleted');
    } catch (err) {
      showError('Failed to delete node');
      console.error(err);
    }
  }, [currentSystemId, deleteMutation, showSuccess, showError]);

  const handleAddChildToNode = useCallback(async (parentId: string) => {
    const node = nodes.find(n => n.id === parentId);
    if (!node) return;

    const position = {
      x: node.position.x + 350,
      y: node.position.y,
    };

    await handleAddNode(position, parentId);
  }, [nodes, handleAddNode]);

  const handlePaneDoubleClick = useCallback((event: React.MouseEvent) => {
    if (event.target instanceof HTMLElement && event.target.closest('.react-flow__node')) {
      return;
    }

    const flowBounds = reactFlowWrapper.current?.getBoundingClientRect();
    if (!flowBounds) return;

    const position = reactFlowInstance.project({
      x: event.clientX - flowBounds.left,
      y: event.clientY - flowBounds.top,
    });

    handleAddNode(position);
  }, [reactFlowInstance, handleAddNode]);

  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    if (event.shiftKey || event.ctrlKey) {
      setSelectedNodes(prev => {
        if (prev.includes(node.id)) {
          return prev.filter(id => id !== node.id);
        } else {
          return [...prev, node.id];
        }
      });
    } else {
      setSelectedNodes([node.id]);
    }
  }, []);

  const handleCreateGroup = useCallback(async () => {
    if (selectedNodes.length < 2) return;

    try {
      const centerNode = nodes.find(n => n.id === selectedNodes[0]);
      if (!centerNode) return;

      const groupNode = await createMutation.mutateAsync({
        systemId: currentSystemId!,
        data: {
          name: 'New Group',
          type: 'group',
          description: '',
          tags: [],
          x: centerNode.position.x - 50,
          y: centerNode.position.y - 50,
        },
      });

      const groupId = groupNode.id;
      for (const nodeId of selectedNodes) {
        await updateMutation.mutateAsync({
          systemId: currentSystemId!,
          nodeId,
          data: { groupId },
        });
      }

      showSuccess('Group created');
      setSelectedNodes([]);
      await refetch();
    } catch (err) {
      showError('Failed to create group');
      console.error(err);
    }
  }, [selectedNodes, nodes, currentSystemId, createMutation, updateMutation, showSuccess, showError, refetch]);

  const handlePaneClick = useCallback((event: React.MouseEvent) => {
    if (event.target instanceof HTMLElement && event.target.closest('.react-flow__node')) {
      return;
    }

    setSelectedNodes([]);
  }, []);

  const handleNodesChange = useCallback(async (changes: any[]) => {
    await onNodesChange(changes);

    for (const change of changes) {
      if (change.type === 'position' && 'position' in change && 'id' in change) {
        const node = hierarchy.find(n => n.id === change.id);
        if (node) {
          await updateMutation.mutateAsync({
            systemId: currentSystemId!,
            nodeId: node.id,
            data: {
              x: change.position!.x,
              y: change.position!.y,
            },
          });
        }
      }
    }
  }, [hierarchy, currentSystemId, updateMutation, onNodesChange]);

  const handleConnect = useCallback(async (params: any) => {
    if (!params.source || !params.target) return;

    try {
      await updateMutation.mutateAsync({
        systemId: currentSystemId!,
        nodeId: params.target,
        data: { parentId: params.source || undefined },
      });
      showSuccess('Connected nodes');
    } catch (err) {
      showError('Failed to connect nodes');
      console.error(err);
    }
  }, [currentSystemId, updateMutation, showSuccess, showError]);

  const filteredNodes = useMemo(() => {
    if (!searchTerm) return nodes;

    const searchLower = searchTerm.toLowerCase();
    return nodes.filter(node => {
      const nodeData = hierarchy.find(n => n.id === node.id);
      if (!nodeData) return false;

      const matchesName = nodeData.name.toLowerCase().includes(searchLower);
      const matchesDescription = nodeData.description?.toLowerCase().includes(searchLower);
      const matchesTags = nodeData.tags?.some(tag => tag.toLowerCase().includes(searchLower));

      return matchesName || matchesDescription || matchesTags;
    });
  }, [nodes, searchTerm, hierarchy]);

  const fitView = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.2, duration: 800 });
    }
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
            sx={{ width: 300 }}
          />
        </Box>
      </Box>

      {hierarchy.length === 0 ? (
        <Paper sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#1e1e1e' }} elevation={3}>
          <EmptyState
            title="No Hierarchy Yet"
            message="Double-click anywhere on the canvas to create your first node."
          />
        </Paper>
      ) : (
        <Paper
          ref={reactFlowWrapper}
          sx={{ flex: 1, overflow: 'hidden', bgcolor: '#1e1e1e' }}
          elevation={3}
        >
          <ReactFlow
            nodes={filteredNodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={handleConnect}
            onPaneClick={handlePaneClick}
            onDoubleClick={handlePaneDoubleClick}
            onNodeClick={handleNodeClick}
            nodeTypes={nodeTypes}
            minZoom={0.1}
            maxZoom={2}
            fitView
            fitViewOptions={{ padding: 0.2, duration: 800 }}
            multiSelectionKeyCode="Shift"
          >
            <Controls />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />

            {/* Selection info */}
            {selectedNodes.length >= 2 && (
              <Panel position="bottom-left">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCreateGroup}
                  sx={{ backgroundColor: '#1976d2' }}
                >
                  Create Group ({selectedNodes.length} nodes)
                </Button>
              </Panel>
            )}

            <Panel position="top-right">
              <Tooltip title="Center view">
                <IconButton
                  onClick={fitView}
                  sx={{ backgroundColor: '#1e1e1e', '&:hover': { backgroundColor: '#2e2e2e' } }}
                >
                  <CenterFocusStrongIcon />
                </IconButton>
              </Tooltip>
            </Panel>
          </ReactFlow>
        </Paper>
      )}
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
