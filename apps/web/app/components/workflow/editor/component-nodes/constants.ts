import { ComponentNodesEnum } from '@shared/common/workflow/component-node'
import { ReplyNodeCreator } from './nodes/reply/creator'
import { TriggerNodeCreator } from './nodes/trigger/creator'
import { IfNodeCreator } from './nodes/if/creator'
import { LoopNodeCreator } from './nodes/loop/creator'
import { LoopStartNodeCreator } from './nodes/loop-start/creator'
import type { ComponentCreator } from './types'

export const COMPONENT_NODE_PANEL_ID = 'component-node-panel'

export const ComponentNodeCreatorMap = {
  [ComponentNodesEnum.Trigger]: TriggerNodeCreator,
  [ComponentNodesEnum.Reply]: ReplyNodeCreator,
  [ComponentNodesEnum.If]: IfNodeCreator,
  [ComponentNodesEnum.Loop]: LoopNodeCreator,
  [ComponentNodesEnum.LoopStart]: LoopStartNodeCreator,
} as Record<ComponentNodesEnum, ComponentCreator<unknown>>
