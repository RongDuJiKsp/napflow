import { useCallback, useEffect } from 'react'
import type { Socket } from 'socket.io-client'

import { createComponentNode } from '@workflow/editor/component-nodes/utils/node'
import { useAppReactflowInstance } from '@workflow/editor/hooks/reactflow-re-exports'
import { useWorkflowDraft } from '@workflow/editor/hooks/use-workflow-draft'
import {
  AgentClientRPCListener,
  type ClientRPCListenerHandler,
} from './client-rpc'
import { useCreation } from 'ahooks'
import { ClientRpc } from '@shared/rpc/agent/client-rpc/tools'
import { useWorkflowHistory } from '../../../hooks/use-workflow-history'
import { useWorkflowCommOperations, useWorkflowViewOperations } from '../../../hooks/use-workflow-view-operations'
import { useComponentNodeOperations } from '../../../component-nodes/hooks/use-component-node-operations'

export const useAgentClientRPCImpl = (socket?: Socket) => {
  const reactflow = useAppReactflowInstance()
  const { getCurrentStateSnapshot, submitSyncDraft } = useWorkflowDraft()
  const { handleConnect } = useWorkflowViewOperations()
  const { handleDeleteNode, handleCheckedEditNode } = useWorkflowCommOperations()
  const { handleMoveConstructorNode: handleMoveConstructorCustomNode } = useComponentNodeOperations()
  const { capture } = useWorkflowHistory()

  const addCustomNode = useCallback<ClientRPCListenerHandler<'addCustomNode'>>(
    ({ type, position }) => {
      const ret = capture('Agent操作：添加节点', () => {
        const node = createComponentNode(type)
        node.position = position

        handleMoveConstructorCustomNode(node)
        return node.id
      })
      submitSyncDraft()
      return ClientRpc.success({ nodeId: ret })
    },
    [capture, submitSyncDraft, handleMoveConstructorCustomNode],
  )

  const readCurrent = useCallback<
    ClientRPCListenerHandler<'readCurrent'>
  >(() => {
    const snapshot = getCurrentStateSnapshot()
    return ClientRpc.success({
      nodes: snapshot.nodes,
      edges: snapshot.edges,
      envs: snapshot.envs,
    })
  }, [getCurrentStateSnapshot])

  const connectNode = useCallback<ClientRPCListenerHandler<'connectNode'>>(
    ({ source, sourceHandle, target, targetHandle }) => {
      capture('Agent操作：连接两个节点', () => {
        handleConnect({ source, target, sourceHandle, targetHandle })
      })
      if (!reactflow.getEdges().some(e => e.source === source && e.target === target)) {
        // 只有在确实添加了连接时才提交draft，避免重复提交
        return ClientRpc.fail('failed to connect nodes, maybe due to invalid connection')
      }
      submitSyncDraft()
      return ClientRpc.success()
    },
    [reactflow, capture, submitSyncDraft, handleConnect],
  )

  const deleteEdge = useCallback<ClientRPCListenerHandler<'deleteEdge'>>(
    ({ edgeId }) => {
      if (!reactflow.getEdges().some(e => e.id === edgeId))
        return ClientRpc.fail('edge not found')

      capture('Agent操作：删除边', () => {
        reactflow.setEdges(edges => edges.filter(e => e.id !== edgeId))
      })
      submitSyncDraft()
      return ClientRpc.success()
    },
    [reactflow, capture, submitSyncDraft],
  )

  const deleteNode = useCallback<ClientRPCListenerHandler<'deleteNode'>>(
    ({ nodeId }) => {
      const node = reactflow.getNode(nodeId)
      if (!node) return ClientRpc.fail('node not found')

      capture('Agent操作：删除节点', () => {
        handleDeleteNode(node)
      })
      submitSyncDraft()
      return ClientRpc.success()
    },
    [reactflow, capture, submitSyncDraft, handleDeleteNode],
  )

  const editNodeData = useCallback<ClientRPCListenerHandler<'editNodeData'>>(
    ({ nodeId, data }) => {
      const node = reactflow.getNode(nodeId)
      if (!node) return ClientRpc.fail('node not found')

      capture('Agent操作：编辑节点数据', () => {
        handleCheckedEditNode(nodeId, data)
      })

      submitSyncDraft()
      return ClientRpc.success()
    },
    [reactflow, capture, submitSyncDraft, handleCheckedEditNode],
  )

  const listener = useCreation(() => {
    const rpc = new AgentClientRPCListener()
    rpc.listenMethod('addCustomNode', addCustomNode)
    rpc.listenMethod('readCurrent', readCurrent)
    rpc.listenMethod('connectNode', connectNode)
    rpc.listenMethod('deleteEdge', deleteEdge)
    rpc.listenMethod('deleteNode', deleteNode)
    rpc.listenMethod('editNodeData', editNodeData)
    return rpc
  }, [
    addCustomNode,
    readCurrent,
    connectNode,
    deleteEdge,
    deleteNode,
    editNodeData,
  ])

  useEffect(() => {
    if (socket) {
      listener.mount(socket)
      return () => {
        listener.unmount()
      }
    }
  }, [listener, socket])
}
