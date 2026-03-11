import { NodeClassic } from '@shared/common/workflow/core'
import { createWorkflowNode } from '../../utils/nodes'
import { ComponentNodeCreatorMap } from '../constants'
import type { ComponentNodesEnum } from '@shared/common/workflow/component-node'
import type { ComponentNode } from '../types'

export const createComponentNode = <T>(
  nodeClassic: ComponentNodesEnum,
): ComponentNode<T> => {
  const creator = ComponentNodeCreatorMap[nodeClassic]
  return createWorkflowNode({
    type: NodeClassic.Component,
    data: <ComponentNode<T>['data']>{
      title: creator.label,
      desc: '',
      type: nodeClassic,
      vars: creator.env ?? [],
      ...(creator.create() as T),
    },
  })
}

export const createComponentSubNode = <T>(parentNode: ComponentNode, nodeClassic: ComponentNodesEnum): ComponentNode<T> => {
  const subNode = createComponentNode<T>(nodeClassic)
  subNode.parentId = parentNode.id
  subNode.extent = 'parent'
  return subNode
}
