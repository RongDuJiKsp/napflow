import { TriggerNodeCreator } from './trigger/creator'
import type { ComponentCreator } from './types'
import { ComponentNodesEnum } from './types'

export const ComponentNodeCreatorMap: Record<ComponentNodesEnum, ComponentCreator> = {
  [ComponentNodesEnum.Trigger]: TriggerNodeCreator,
}
