import { useReactFlow } from '@xyflow/react'
import type { WorkflowEdge, WorkflowNode } from '../../../../types'
import { useCallback } from 'react'
import { createComponentNode } from '../../../utils/node'
import type { IterateStartData } from '@shared/common/workflow/node-data/iterate-start'
import { ComponentNodesEnum } from '@shared/common/workflow/component-node'
import { createWorkflowEdge } from '../../../../utils/nodes'
import { ComponentNodeCreatorMap } from '../../../constants'
import type { ComponentNode } from '../../../types'
import { useCommContainerNodeOperation } from '../../../../hooks/use-comm-node-operation'
import { NodeClassic } from '@shared/common/workflow/core'
import { getLinkedLastNode } from '../../loop/hooks/use-loop-operator'
import { safeAssertWorkflowNodeAsComponentNode } from '../../../utils/node-asserts'

export const useIterateNodeOperator = () => {
  const reactflow = useReactFlow<WorkflowNode, WorkflowEdge>()
  const { deleteNodeAndChildren } = useCommContainerNodeOperation()

  const handleAddIterateNode = useCallback(
    (iterateNode: WorkflowNode) => {
      iterateNode.style = { ...iterateNode.style, width: 500, height: 150 }
      reactflow.addNodes(iterateNode)
      const iterateStartNode = createComponentNode<IterateStartData>(
        ComponentNodesEnum.IterateStart,
      )
      iterateStartNode.parentId = iterateNode.id
      iterateStartNode.position = {
        x: 40,
        y: 60,
      }
      iterateStartNode.extent = 'parent'
      reactflow.addNodes(iterateStartNode)
    },
    [reactflow],
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

      const lastNode = getLinkedLastNode(childNodes, allEdges, iterateStartNode)
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
      const iterateNode = safeAssertWorkflowNodeAsComponentNode(ComponentNodesEnum.Iterate, reactflow.getNode(iterateNodeId))
      if ( !iterateNode)
        return
      deleteNodeAndChildren(iterateNode)
    },
    [deleteNodeAndChildren, reactflow],
  )

  return {
    handleAddIterateNode,
    handleAddNodeToIterate,
    handleDeleteIterateNode,
  }
}
