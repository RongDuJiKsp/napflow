import { useReactFlow } from '@xyflow/react'
import type { WorkflowEdge, WorkflowNode } from '../../../../types'
import { useCallback } from 'react'
import { createComponentNode } from '../../../utils/node'
import type { LoopStartData } from '@shared/common/workflow/node-data/loop-start'
import { ComponentNodesEnum } from '@shared/common/workflow/component-node'
import { createWorkflowEdge } from '../../../../utils/nodes'
import { ComponentNodeCreatorMap } from '../../../constants'
import type { ComponentNode } from '../../../types'

export const useLoopNodeOperator = () => {
  const reactflow = useReactFlow<WorkflowNode, WorkflowEdge>()
  const handleAddLoopNode = useCallback((loopNode: WorkflowNode) => {
    reactflow.addNodes(loopNode)
    const loopStartNode = createComponentNode<LoopStartData>(ComponentNodesEnum.LoopStart)
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
  }, [reactflow])

    /** 在 loop 内部链路末尾添加一个新节点 */
  const handleAddNodeToLoop = useCallback(
    (loopNodeId: string, nodeType: ComponentNodesEnum) => {
      const allNodes = reactflow.getNodes()
      const allEdges = reactflow.getEdges()

      // 找到 loop 内的所有子节点
      const childNodes = allNodes.filter(n => n.parentId === loopNodeId) as ComponentNode[]
      if (childNodes.length === 0) return

      // 找到 loop-start 节点
      const loopStartNode = childNodes.find(
        n => n.data.type === ComponentNodesEnum.LoopStart,
      )
      if (!loopStartNode) return

      // 构建子节点 ID 集合
      const childIdSet = new Set(childNodes.map(n => n.id))

      // 从 loop-start 开始沿边走到链路末尾
      let currentId = loopStartNode.id
      while (true) {
        const nextEdge = allEdges.find(
          e => e.source === currentId && childIdSet.has(e.target),
        )
        if (!nextEdge) break
        currentId = nextEdge.target
      }

      // currentId 就是链路末尾节点
      const lastNode = childNodes.find(n => n.id === currentId)
      if (!lastNode) return

      // 检查连接合法性：末尾节点的 nextNodes 是否包含新节点类型
      const lastCreator = ComponentNodeCreatorMap[(lastNode.data).type as ComponentNodesEnum]
      const newCreator = ComponentNodeCreatorMap[nodeType]
      if (
        !lastCreator.nextNodes?.includes(nodeType)
        || !newCreator.prevNodes?.includes((lastNode.data).type as ComponentNodesEnum)
      ) {
        console.warn(`无法在 ${(lastNode.data).type} 后面添加 ${nodeType}`)
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
      const allNodes = reactflow.getNodes()

      // 收集 loop 节点本身和所有子节点 ID
      const toDeleteIds = new Set<string>([loopNodeId])
      for (const n of allNodes) {
        if (n.parentId === loopNodeId)
          toDeleteIds.add(n.id)
      }

      reactflow.setEdges(edges =>
        edges.filter(e => !toDeleteIds.has(e.source) && !toDeleteIds.has(e.target)),
      )
      reactflow.setNodes(nodes => nodes.filter(n => !toDeleteIds.has(n.id)))
    },
    [reactflow],
  )

  return { handleAddLoopNode, handleAddNodeToLoop, handleDeleteLoopNode }
}
