import { useReactFlow } from '@xyflow/react'
import type { WorkflowEdge, WorkflowNode } from '../../../../types'
import { useCallback } from 'react'
import {
  createComponentNode,
  createComponentSubNode,
} from '../../../utils/node'
import type { IterateStartData } from '@shared/common/workflow/node-data/iterate-start'
import { ComponentNodesEnum } from '@shared/common/workflow/core/component-node'
import { createWorkflowEdge } from '../../../../utils/nodes'
import { ComponentNodeCreatorMap } from '../../../constants'
import type { ComponentNode } from '../../../types'
import { useCommContainerNodeOperation } from '../../../../hooks/use-comm-node-operation'
import { getLinkedLastNode } from '../../loop/hooks/use-loop-operator'
import { safeAssertWorkflowNodeAsComponentNode } from '../../../utils/node-asserts'
import { useComponentContainerNodeOperations } from '../../../hooks/use-component-node-operations'

export const useIterateNodeOperator = () => {
  const reactflow = useReactFlow<WorkflowNode, WorkflowEdge>()
  const { moveConstructorNodeAndChildren }
    = useComponentContainerNodeOperations()
  const { deleteNodeAndChildren } = useCommContainerNodeOperation()

  // 从一个未加入到 reactflow 画板的 iterate 节点移动构造节点并且放入画板
  const handleMoveConstructorIterateNode = useCallback(
    (node: WorkflowNode) => {
      const iterateNode = safeAssertWorkflowNodeAsComponentNode(
        ComponentNodesEnum.Iterate,
        node,
      )
      if (!iterateNode) {
        console.warn('节点类型错误，无法移动构造节点')
        return
      }
      const iterateStartNode = createComponentSubNode<IterateStartData>(
        iterateNode,
        ComponentNodesEnum.IterateStart,
      )
      moveConstructorNodeAndChildren(iterateNode, iterateStartNode)
    },
    [moveConstructorNodeAndChildren],
  )

  const handleAddNodeToIterate = useCallback(
    (iterateNodeId: string, nodeType: ComponentNodesEnum) => {
      const allNodes = reactflow.getNodes()
      const allEdges = reactflow.getEdges()

      const childNodes = allNodes.filter(
        n => n.parentId === iterateNodeId,
      ) as ComponentNode[]
      if (childNodes.length === 0) return

      const iterateStartNode = childNodes.find(
        n => n.data.type === ComponentNodesEnum.IterateStart,
      )
      if (!iterateStartNode) return

      const lastNode = getLinkedLastNode(
        childNodes,
        allEdges,
        iterateStartNode,
      )
      if (!lastNode) return

      const lastCreator = ComponentNodeCreatorMap[lastNode.data.type]
      const newCreator = ComponentNodeCreatorMap[nodeType]
      if (
        !lastCreator.nextNodes?.includes(nodeType)
        || !newCreator.prevNodes?.includes(lastNode.data.type)
      ) {
        console.warn(`无法在 ${lastNode.data.type} 后面添加 ${nodeType}`)
        return
      }

      const newNode = createComponentNode(nodeType)
      newNode.parentId = iterateNodeId
      newNode.extent = 'parent'
      newNode.position = {
        x: lastNode.position.x + 250,
        y: lastNode.position.y,
      }

      const newEdge = createWorkflowEdge({
        source: lastNode.id,
        target: newNode.id,
      })

      reactflow.addNodes(newNode)
      reactflow.addEdges(newEdge)
    },
    [reactflow],
  )

  const handleDeleteIterateNode = useCallback(
    (iterateNodeId: string) => {
      const iterateNode = safeAssertWorkflowNodeAsComponentNode(
        ComponentNodesEnum.Iterate,
        reactflow.getNode(iterateNodeId),
      )
      if (!iterateNode) return
      deleteNodeAndChildren(iterateNode)
    },
    [deleteNodeAndChildren, reactflow],
  )

  return {
    handleMoveConstructorIterateNode,
    handleAddNodeToIterate,
    handleDeleteIterateNode,
  }
}
