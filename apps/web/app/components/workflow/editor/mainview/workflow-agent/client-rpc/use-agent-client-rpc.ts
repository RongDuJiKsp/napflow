import { useCallback, useEffect } from 'react'
import type { Socket } from 'socket.io-client'
import { ComponentNodesEnum } from '@shared/common/workflow/core/component-node'
import { createComponentNode } from '@workflow/editor/component-nodes/utils/node'
import { useAppReactflowInstance } from '@workflow/editor/hooks/reactflow-re-exports'
import { useWorkflowDraft } from '@workflow/editor/hooks/use-workflow-draft'
import { useLoopNodeOperator } from '@workflow/editor/component-nodes/nodes/loop/hooks/use-loop-operator'
import { useIterateNodeOperator } from '@workflow/editor/component-nodes/nodes/iterate/hooks/use-iterate-operator'
import {
  AgentClientRPCListener,
  type ClientRPCListenerHandler,
} from './client-rpc'
import { useCreation } from 'ahooks'
import { useComponentNodeOperations } from '../../../component-nodes/hooks/use-component-node-operations'
import { ClientRpc } from '@shared/rpc/agent/client-rpc/tools'
import { safeAssertIsComponentNode } from '../../../utils/node-asserts'
import { useWorkflowHistory } from '../../../hooks/use-workflow-history'

export const useAgentClientRPCImpl = (socket?: Socket) => {
  const reactflow = useAppReactflowInstance()
  const { getCurrentStateSnapshot, submitSyncDraft } = useWorkflowDraft()
  const { handleConnect } = useComponentNodeOperations()
  const { handleAddLoopNode } = useLoopNodeOperator()
  const { handleMoveConstructorIterateNode } = useIterateNodeOperator()
  const { capture } = useWorkflowHistory()

  const addCustomNode = useCallback<ClientRPCListenerHandler<'addCustomNode'>>(
    ({ type, position }) => {
      const ret = capture('Agent操作：添加节点', () => {
        const node = createComponentNode(type)
        node.position = position

        if (type === ComponentNodesEnum.Loop) handleAddLoopNode(node)
        else if (type === ComponentNodesEnum.Iterate)
          handleMoveConstructorIterateNode(node)
        else reactflow.addNodes(node)
        return node.id
      })
      submitSyncDraft()
      return ClientRpc.success({ nodeId: ret })
    },
    [
      handleAddLoopNode,
      handleMoveConstructorIterateNode,
      reactflow,
      submitSyncDraft,
      capture,
    ],
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
      const sourceNode = safeAssertIsComponentNode(reactflow.getNode(source))
      const targetNode = safeAssertIsComponentNode(reactflow.getNode(target))
      if (!sourceNode || !targetNode) return ClientRpc.fail('source or target node not found')
      capture('Agent操作：连接两个节点', () => {
        handleConnect(sourceNode, targetNode, sourceHandle, targetHandle)
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

  const listener = useCreation(() => {
    const rpc = new AgentClientRPCListener()
    rpc.listenMethod('addCustomNode', addCustomNode)
    rpc.listenMethod('readCurrent', readCurrent)
    rpc.listenMethod('connectNode', connectNode)
    return rpc
  }, [addCustomNode, readCurrent])

  useEffect(() => {
    if (socket) {
      listener.mount(socket)
      return () => {
        listener.unmount()
      }
    }
  }, [listener, socket])
}
