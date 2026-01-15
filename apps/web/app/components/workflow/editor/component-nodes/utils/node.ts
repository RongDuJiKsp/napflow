import { NodeClassic } from '@shared/common/workflow/core'
import { createWorkflowNode } from '../../utils/nodes'
import { ComponentNodeCreatorMap } from '../constants'
import type { ComponentNode, ComponentNodesEnum } from '../types'

export const createComponentNode = <T>(nodeClassic: ComponentNodesEnum): ComponentNode<T> => {
  const creator = ComponentNodeCreatorMap[nodeClassic]
  return createWorkflowNode({
    type: NodeClassic.Component,
    data: <ComponentNode<T>['data']>{
      title: creator.label,
      desc: '',
      ...creator.create(),
    },
  })
}
