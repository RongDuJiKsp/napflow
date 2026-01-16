import type { Edge as BaseEdge, Node as BaseNode, OnEdgesChange, OnNodesChange } from '@xyflow/react'
import { applyEdgeChanges, applyNodeChanges, useStore, useStoreApi } from '@xyflow/react'
import type { Draft } from 'immer'
import { produce } from 'immer'
import type { Dispatch, SetStateAction } from 'react'
import { useCallback } from 'react'

// like useNodesState but conn with store
export const useStoreNodesState = <Node extends BaseNode = BaseNode>(): [Node[], Dispatch<SetStateAction<Node[]>>, OnNodesChange<Node>] => {
  const rfStore = useStoreApi<Node>()
  const nodes = useStore(s => s.nodes) as Node[]
  const setNodes = useCallback<Dispatch<SetStateAction<Node[]>>>((dispatch) => {
    const { nodes: storeNodes, setNodes: setStoreNodes } = rfStore.getState()
    setStoreNodes((typeof dispatch === 'function') ? dispatch(storeNodes) : dispatch)
  }, [rfStore])
  const handleNodesChange: OnNodesChange<Node> = (changes) => {
    setNodes(nds => applyNodeChanges(changes, nds))
  }
  return [nodes, setNodes, handleNodesChange]
}

export const useStoreEdgesState = <Edge extends BaseEdge = BaseEdge>(): [Edge[], Dispatch<SetStateAction<Edge[]>>, OnEdgesChange<Edge>] => {
  const rfStore = useStoreApi<BaseNode, Edge>()
  const edges = useStore(s => s.edges) as Edge[]
  const setEdges = useCallback<Dispatch<SetStateAction<Edge[]>>>((dispatch) => {
    const { edges: storeEdges, setEdges: setStoreEdges } = rfStore.getState()
    setStoreEdges((typeof dispatch === 'function') ? dispatch(storeEdges) : dispatch)
  }, [rfStore])
  const handleEdgesChange: OnEdgesChange<Edge> = (changes) => {
    setEdges(eds => applyEdgeChanges(changes, eds))
  }
  return [edges, setEdges, handleEdgesChange]
}

export const useStoreImmerCurd = <Node extends BaseNode = BaseNode, Edge extends BaseEdge = BaseEdge>() => {
  const rfStore = useStoreApi<Node, Edge>()

  const editNodes = useCallback((recipe: (draft: Draft<Node[]>) => void) => {
    const { nodes, setNodes } = rfStore.getState()
    setNodes(produce(nodes, recipe))
  }, [rfStore])
  const editNode = useCallback(<Cast extends Node = Node>(nodeId: string, recipe: (draft: Draft<Cast>) => void) => {
    editNodes((drafts) => {
      for(const node of drafts) {
        if(node.id !== nodeId)
          continue

        recipe(node as Draft<Cast>)
      }
    })
  }, [editNodes])

  const editEdges = useCallback((recipe: (draft: Draft<Edge[]>) => void) => {
    const { edges, setEdges } = rfStore.getState()
    setEdges(produce(edges, recipe))
  }, [rfStore])
  const editEdge = useCallback(<Cast extends Edge = Edge>(edgeId: string, recipe: (draft: Draft<Cast>) => void) => {
    editEdges((drafts) => {
      for(const edge of drafts) {
        if(edge.id !== edgeId)
          continue

        recipe(edge as Draft<Cast>)
      }
    })
  }, [editEdges])

  return {
    editNode,
    editNodes,
    editEdge,
    editEdges,
  }
}
