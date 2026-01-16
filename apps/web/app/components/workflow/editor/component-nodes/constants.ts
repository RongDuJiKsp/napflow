import { ReplyNodeCreator } from './nodes/reply/creator'
import { TriggerNodeCreator } from './nodes/trigger/creator'
import type { ComponentCreator } from './types'
import { ComponentNodesEnum } from './types'

export const COMPONENT_NODE_PANEL_ID = 'component-node-panel'

export const ComponentNodeCreatorMap = {
  [ComponentNodesEnum.Trigger]: TriggerNodeCreator,
  [ComponentNodesEnum.Reply]: ReplyNodeCreator,
} as Record<ComponentNodesEnum, ComponentCreator<unknown>>
