import { useReactFlow } from '@xyflow/react'
import type { WorkflowEdge, WorkflowNode } from '../../../../types'
import { useCallback } from 'react'
import { createComponentNode } from '../../../utils/node'
import type { LoopStartData } from '@shared/common/workflow/node-data/loop-start'
import { ComponentNodesEnum } from '@shared/common/workflow/component-node'
import { createWorkflowEdge } from '../../../../utils/nodes'
import { ComponentNodeCreatorMap } from '../../../constants'
import type { ComponentNode } from '../../../types'
import { useCommNodeOperation } from '../../../../hooks/use-comm-node-operation'
import { NodeClassic } from '@shared/common/workflow/core'

/**
 * 从 headNode 开始，沿边依次遍历，返回整条链路上的所有节点（包含 headNode 自身）
 * 仅在 nodes 范围内查找后继节点
 */
export const getLinkedNodes = <GNode extends WorkflowNode, GEdge extends WorkflowEdge>(
  nodes: GNode[],
  edges: GEdge[],
  headNode: GNode,
): GNode[] => {
  const nodeMap = new Map(nodes.map(n => [n.id, n]))
  const result: GNode[] = [headNode]
  let currentId = headNode.id

  while (true) {
    const nextEdge = edges.find(
      e => e.source === currentId && nodeMap.has(e.target),
    )
    if (!nextEdge) break
    const nextNode = nodeMap.get(nextEdge.target)!
    result.push(nextNode)
    currentId = nextEdge.target
  }

  return result
}

/**
 * 从 headNode 开始，沿边走到链路末尾，返回最后一个节点
 * 仅在 nodes 范围内查找后继节点
 */
export const getLinkedLastNode = <GNode extends WorkflowNode, GEdge extends WorkflowEdge>(
  nodes: GNode[],
  edges: GEdge[],
  headNode: GNode,
): GNode => {
  const linkedNodes = getLinkedNodes(nodes, edges, headNode)
  return linkedNodes[linkedNodes.length - 1]
}

export const useLoopNodeOperator = () => {
  const reactflow = useReactFlow<WorkflowNode, WorkflowEdge>()
  const { deleteNodeAndChildren } = useCommNodeOperation()
  const handleAddLoopNode = useCallback(
    (loopNode: WorkflowNode) => {
      // 设置容器节点的初始宽高，配合 NodeResizer 使用
      loopNode.style = { ...loopNode.style, width: 500, height: 150 }
      reactflow.addNodes(loopNode)
      const loopStartNode = createComponentNode<LoopStartData>(
        ComponentNodesEnum.LoopStart,
      )
      // 使用 ReactFlow 的 parentId 属性建立父子关系
      loopStartNode.parentId = loopNode.id
      // loop-start 放置在容器内部左上方（相对于父节点的坐标）
      loopStartNode.position = {
        x: 40,
        y: 60,
      }
      // 子节点不超出容器范围
      loopStartNode.extent = 'parent'
      reactflow.addNodes(loopStartNode)
    },
    [reactflow],
  )

  /** 在 loop 内部链路末尾添加一个新节点 */
  const handleAddNodeToLoop = useCallback(
    (loopNodeId: string, nodeType: ComponentNodesEnum) => {
      const allNodes = reactflow.getNodes()
      const allEdges = reactflow.getEdges()

      // 找到 loop 内的所有子节点
      const childNodes = allNodes.filter(
        n => n.parentId === loopNodeId,
      ) as ComponentNode[]
      if (childNodes.length === 0) return

      // 找到 loop-start 节点
      const loopStartNode = childNodes.find(
        n => n.data.type === ComponentNodesEnum.LoopStart,
      )
      if (!loopStartNode) return

      // 从 loop-start 开始沿边走到链路末尾
      const lastNode = getLinkedLastNode(childNodes, allEdges, loopStartNode)
      if (!lastNode) return

      // 检查连接合法性：末尾节点的 nextNodes 是否包含新节点类型
      const lastCreator
        = ComponentNodeCreatorMap[lastNode.data.type]
      const newCreator = ComponentNodeCreatorMap[nodeType]
      if (
        !lastCreator.nextNodes?.includes(nodeType)
        || !newCreator.prevNodes?.includes(
          lastNode.data.type,
        )
      ) {
        console.warn(`无法在 ${lastNode.data.type} 后面添加 ${nodeType}`)
        return
      }

      // 创建新节点
      const newNode = createComponentNode(nodeType)
      newNode.parentId = loopNodeId
      newNode.extent = 'parent'
      // 放置在最后一个节点的右侧
      newNode.position = {
        x: lastNode.position.x + 250,
        y: lastNode.position.y,
      }

      // 创建从末尾节点到新节点的边
      const newEdge = createWorkflowEdge({
        source: lastNode.id,
        target: newNode.id,
      })

      reactflow.addNodes(newNode)
      reactflow.addEdges(newEdge)
    },
    [reactflow],
  )

  /** 删除 Loop 节点及其所有子节点和相关边 */
  const handleDeleteLoopNode = useCallback(
    (loopNodeId: string) => {
      const loopNode = reactflow.getNode(loopNodeId)
      if (
        !loopNode
        || loopNode.type !== NodeClassic.Component
        || (loopNode as ComponentNode).data.type !== ComponentNodesEnum.Loop
      )
        return
      deleteNodeAndChildren(loopNode)
    },
    [deleteNodeAndChildren, reactflow],
  )

  return { handleAddLoopNode, handleAddNodeToLoop, handleDeleteLoopNode }
}
