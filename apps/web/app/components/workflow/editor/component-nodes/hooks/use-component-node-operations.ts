import { useCallback } from 'react'
import type { ComponentNode } from '../types'
import { ComponentNodeCreatorMap } from '../constants'
import { useReactFlow } from '@xyflow/react'
import { createWorkflowEdge } from '../../utils/nodes'
import type { WorkflowEdge, WorkflowNode } from '../../types'
import { useStoreImmerCurd } from '../../hooks/use-reactflow-ext'
import { ComponentNodesEnum } from '@shared/common/workflow/component-node'
import { useLoopNodeOperator } from '../nodes/loop/hooks/use-loop-operator'
import { useIterateNodeOperator } from '../nodes/iterate/hooks/use-iterate-operator'

export const useComponentNodeOperations = () => {
  const reactflow = useReactFlow<WorkflowNode, WorkflowEdge>()
  const { editNode } = useStoreImmerCurd()
  const { handleDeleteLoopNode } = useLoopNodeOperator()
  const { handleDeleteIterateNode } = useIterateNodeOperator()
  const handleConnect = useCallback(
    (
      source: ComponentNode,
      target: ComponentNode,
      sourceHandle: string | null,
      targetHandle: string | null,
    ) => {
      const sourceCreator = ComponentNodeCreatorMap[source.data.type]
      const targetCreator = ComponentNodeCreatorMap[target.data.type]

      // 查create表允许的前置后置节点 不允许则结束
      if (
        !sourceCreator.nextNodes?.includes(target.data.type)
        || !targetCreator.prevNodes?.includes(source.data.type)
      )
        return
      // 父节点不一致的节点不允许连接
      if (source.parentId !== target.parentId) return

      reactflow.addEdges(
        createWorkflowEdge({
          source: source.id,
          target: target.id,
          sourceHandle,
          targetHandle,
        }),
      )
    },
    [reactflow],
  )
  const handleDeleteNode = useCallback(
    (node: ComponentNode) => {
      // Loop 节点需要连带删除子节点
      if (node.data.type === ComponentNodesEnum.Loop) {
        handleDeleteLoopNode(node.id)
        return
      }
      if (node.data.type === ComponentNodesEnum.Iterate) {
        handleDeleteIterateNode(node.id)
        return
      }
      const nodeId = node.id
      reactflow.setEdges(edges =>
        edges.filter(e => e.source !== nodeId && e.target !== nodeId),
      )
      reactflow.setNodes(nodes => nodes.filter(n => n.id !== nodeId))
    },
    [reactflow, handleDeleteIterateNode, handleDeleteLoopNode],
  )
  const handleFoldUnfoldNode = useCallback(
    (node: ComponentNode) => {
      editNode<ComponentNode>(node.id, (draft) => {
        draft.data.expanded = !draft.data.expanded
      })
    },
    [editNode],
  )
  return {
    handleConnect,
    handleDeleteNode,
    handleFoldUnfoldNode,
  }
}

export const useComponentContainerNodeOperations = () => {
  const reactflow = useReactFlow<WorkflowNode, WorkflowEdge>()
  const moveConstructorNodeAndChildren = useCallback((parentNode: ComponentNode, subNode: ComponentNode) => {
    parentNode.style = { ...parentNode.style, width: 500, height: 150 }
    subNode.position = {
      x: 40,
      y: 60,
    }
    reactflow.addNodes(parentNode)
    reactflow.addNodes(subNode)
  }, [reactflow])
  return { moveConstructorNodeAndChildren }
}
