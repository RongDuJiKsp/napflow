import type { Edge as BaseEdge, Node as BaseNode, OnEdgesChange, OnNodesChange } from '@xyflow/react'
import { applyEdgeChanges, applyNodeChanges, useStore, useStoreApi } from '@xyflow/react'
import type { Dispatch, SetStateAction } from 'react'
import { useCallback } from 'react'

// like useNodesState but conn with store
export const useStoreNodesState = <Node extends BaseNode>(): [Node[], Dispatch<SetStateAction<Node[]>>, OnNodesChange<Node>] => {
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

export const useStoreEdgesState = <Edge extends BaseEdge>(): [Edge[], Dispatch<SetStateAction<Edge[]>>, OnEdgesChange<Edge>] => {
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
