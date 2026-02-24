import { useCallback } from 'react'
import type { ComponentNode } from '../types'
import { ComponentNodeCreatorMap } from '../constants'
import { useReactFlow } from '@xyflow/react'
import { createWorkflowEdge } from '../../utils/nodes'
import type { WorkflowEdge, WorkflowNode } from '../../types'
import { useStoreImmerCurd } from '../../hooks/use-reactflow-ext'
import { ComponentNodesEnum } from '@shared/common/workflow/component-node'

export const useComponentNodeOperations = () => {
  const reactflow = useReactFlow<WorkflowNode, WorkflowEdge>()
  const { editNode } = useStoreImmerCurd()
  const handleConnenct = useCallback(
    (
      source: ComponentNode,
      target: ComponentNode,
      sourceHandle: string | null,
      targetHandle: string | null,
    ) => {
      const sourceCreator = ComponentNodeCreatorMap[source.data.type]
      const targetCreator = ComponentNodeCreatorMap[target.data.type]

      if (
        !sourceCreator.nextNodes?.includes(target.data.type)
        || !targetCreator.prevNodes?.includes(source.data.type)
      )
        return

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
      // 收集需要删除的节点 ID
      const toDeleteIds = new Set<string>([node.id])

      // 如果删除的是 Loop 容器节点，同时删除其所有子节点
      if (node.data.type === ComponentNodesEnum.Loop) {
        const allNodes = reactflow.getNodes()
        for (const n of allNodes) {
          if (n.parentId === node.id)
            toDeleteIds.add(n.id)
        }
      }

      reactflow.setEdges(edges =>
        edges.filter(e => !toDeleteIds.has(e.source) && !toDeleteIds.has(e.target)),
      )
      reactflow.setNodes(nodes => nodes.filter(n => !toDeleteIds.has(n.id)))
    },
    [reactflow],
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
    handleConnenct,
    handleDeleteNode,
    handleFoldUnfoldNode,
  }
}
