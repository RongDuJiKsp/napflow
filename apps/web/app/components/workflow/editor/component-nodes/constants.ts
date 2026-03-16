import { ComponentNodesEnum } from '@shared/common/workflow/component-node'
import { ReplyNodeCreator } from './nodes/reply/creator'
import { TriggerNodeCreator } from './nodes/trigger/creator'
import { TimerNodeCreator } from './nodes/timer/creator'
import { IfNodeCreator } from './nodes/if/creator'
import { LoopNodeCreator } from './nodes/loop/creator'
import { LoopStartNodeCreator } from './nodes/loop-start/creator'
import { IterateNodeCreator } from './nodes/iterate/creator'
import { IterateStartNodeCreator } from './nodes/iterate-start/creator'
import { DifyNodeCreator } from './nodes/dify/creator'
import { JsonReadNodeCreator } from './nodes/json-read/creator'
import { ArrayIndexReadNodeCreator } from './nodes/array-index-read/creator'
import type { ComponentCreator } from './types'

export const COMPONENT_NODE_PANEL_ID = 'component-node-panel'

export const ComponentNodeCreatorMap = {
  [ComponentNodesEnum.Trigger]: TriggerNodeCreator,
  [ComponentNodesEnum.Timer]: TimerNodeCreator,
  [ComponentNodesEnum.Reply]: ReplyNodeCreator,
  [ComponentNodesEnum.If]: IfNodeCreator,
  [ComponentNodesEnum.Loop]: LoopNodeCreator,
  [ComponentNodesEnum.LoopStart]: LoopStartNodeCreator,
  [ComponentNodesEnum.Iterate]: IterateNodeCreator,
  [ComponentNodesEnum.IterateStart]: IterateStartNodeCreator,
  [ComponentNodesEnum.Dify]: DifyNodeCreator,
  [ComponentNodesEnum.JsonRead]: JsonReadNodeCreator,
  [ComponentNodesEnum.ArrayIndexRead]: ArrayIndexReadNodeCreator,
} as Record<ComponentNodesEnum, ComponentCreator<unknown>>
