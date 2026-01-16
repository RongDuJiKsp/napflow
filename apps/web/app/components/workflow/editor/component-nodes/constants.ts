import { TriggerNodeCreator } from './trigger/creator'
import { ComponentNodesEnum } from './types'

export const ComponentNodeCreatorMap = {
  [ComponentNodesEnum.Trigger]: TriggerNodeCreator,
}
