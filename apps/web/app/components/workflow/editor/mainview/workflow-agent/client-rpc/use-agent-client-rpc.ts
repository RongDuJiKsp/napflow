import { useCallback, useEffect } from 'react'
import type { Socket } from 'socket.io-client'
import { ComponentNodesEnum } from '@shared/common/workflow/core/component-node'
import { createComponentNode } from '../../../component-nodes/utils/node'
import { useAppReactflowInstance } from '../../../hooks/reactflow-re-exports'
import { useWorkflowDraft } from '../../../hooks/use-workflow-draft'
import { useLoopNodeOperator } from '../../../component-nodes/nodes/loop/hooks/use-loop-operator'
import { useIterateNodeOperator } from '../../../component-nodes/nodes/iterate/hooks/use-iterate-operator'
import { AgentClientRPCListener, type ClientRPCListenerHandler } from './client-rpc'
import { useCreation } from 'ahooks'

export const useAgentClientRPCImpl = (socket?: Socket) => {
  const reactflow = useAppReactflowInstance()
  const { getCurrentStateSnapshot, submitSyncDraft } = useWorkflowDraft()
  const { handleAddLoopNode } = useLoopNodeOperator()
  const { handleMoveConstructorIterateNode } = useIterateNodeOperator()

  const addCustomNode = useCallback<
    ClientRPCListenerHandler<'addCustomNode'>
  >(async ({ type, position }) => {
    const node = createComponentNode(type)
    node.position = position

    if (type === ComponentNodesEnum.Loop)
      handleAddLoopNode(node)
    else if (type === ComponentNodesEnum.Iterate)
      handleMoveConstructorIterateNode(node)
    else reactflow.addNodes(node)

    submitSyncDraft()
    return { success: true }
  }, [
    handleAddLoopNode,
    handleMoveConstructorIterateNode,
    reactflow,
    submitSyncDraft,
  ])

  const readCurrent = useCallback<
    ClientRPCListenerHandler<'readCurrent'>
  >(async () => {
    const snapshot = getCurrentStateSnapshot()
    return {
      success: true,
      data: {
        nodes: snapshot.nodes,
        edges: snapshot.edges,
        envs: snapshot.envs,
      },
    }
  }, [getCurrentStateSnapshot])

  const listener = useCreation(
    () => {
      const rpc = new AgentClientRPCListener()
      rpc.listenMethod('addCustomNode', addCustomNode)
      rpc.listenMethod('readCurrent', readCurrent)
      return rpc
    },
    [addCustomNode, readCurrent],
  )

  useEffect(() => {
    if (socket) {
      listener.mount(socket)
      return () => {
        listener.unmount()
      }
    }
  }, [listener, socket])
}
