import type { OnEdgesChange, OnNodesChange } from '@xyflow/react'
import { applyEdgeChanges, applyNodeChanges, useStore } from '@xyflow/react'
import type { Draft } from 'immer'
import { produce } from 'immer'
import type { Dispatch, SetStateAction } from 'react'
import { useCallback } from 'react'
import { useWorkflowStoreApi } from './reactflow-re-exports'
import type { WorkflowEdge, WorkflowNode } from '../types'

// like useNodesState but conn with store
export const useStoreNodesState = (): [
  WorkflowNode[],
  Dispatch<SetStateAction<WorkflowNode[]>>,
  OnNodesChange<WorkflowNode>,
] => {
  const rfStore = useWorkflowStoreApi()
  const nodes = useStore(s => s.nodes) as WorkflowNode[]
  const setNodes = useCallback<Dispatch<SetStateAction<WorkflowNode[]>>>(
    (dispatch) => {
      const { nodes: storeNodes, setNodes: setStoreNodes } = rfStore.getState()
      setStoreNodes(
        typeof dispatch === 'function' ? dispatch(storeNodes) : dispatch,
      )
    },
    [rfStore],
  )
  const handleNodesChange: OnNodesChange<WorkflowNode> = (changes) => {
    setNodes(nds => applyNodeChanges(changes, nds))
  }
  return [nodes, setNodes, handleNodesChange]
}

export const useStoreEdgesState = (): [
  WorkflowEdge[],
  Dispatch<SetStateAction<WorkflowEdge[]>>,
  OnEdgesChange<WorkflowEdge>,
] => {
  const rfStore = useWorkflowStoreApi()
  const edges = useStore(s => s.edges) as WorkflowEdge[]
  const setEdges = useCallback<Dispatch<SetStateAction<WorkflowEdge[]>>>(
    (dispatch) => {
      const { edges: storeEdges, setEdges: setStoreEdges } = rfStore.getState()
      setStoreEdges(
        typeof dispatch === 'function' ? dispatch(storeEdges) : dispatch,
      )
    },
    [rfStore],
  )
  const handleEdgesChange: OnEdgesChange<WorkflowEdge> = (changes) => {
    setEdges(eds => applyEdgeChanges(changes, eds))
  }
  return [edges, setEdges, handleEdgesChange]
}

export const useStoreImmerCurd = () => {
  const rfStore = useWorkflowStoreApi()

  const editNodes = useCallback(
    (recipe: (draft: Draft<WorkflowNode[]>) => void) => {
      const { nodes, setNodes } = rfStore.getState()
      setNodes(produce(nodes, recipe))
    },
    [rfStore],
  )
  const editNode = useCallback(
    <Cast = WorkflowNode>(
      nodeId: string,
      recipe: (draft: Draft<Cast>) => void,
    ) => {
      editNodes((drafts) => {
        for (const node of drafts) {
          if (node.id !== nodeId) continue

          recipe(node as Draft<Cast>)
        }
      })
    },
    [editNodes],
  )

  const editEdges = useCallback(
    (recipe: (draft: Draft<WorkflowEdge[]>) => void) => {
      const { edges, setEdges } = rfStore.getState()
      setEdges(produce(edges, recipe))
    },
    [rfStore],
  )
  const editEdge = useCallback(
    <Cast = WorkflowEdge>(
      edgeId: string,
      recipe: (draft: Draft<Cast>) => void,
    ) => {
      editEdges((drafts) => {
        for (const edge of drafts) {
          if (edge.id !== edgeId) continue

          recipe(edge as Draft<Cast>)
        }
      })
    },
    [editEdges],
  )

  return {
    editNode,
    editNodes,
    editEdge,
    editEdges,
  }
}
