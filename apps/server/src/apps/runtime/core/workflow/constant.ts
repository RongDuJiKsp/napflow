import { ComponentNodesEnum } from '@shared/common/workflow/component-node'
import type { CommNode, CommNodeType } from './node'
import { TriggerDataCtxSchema, TriggerNode } from './nodes/trigger-node'
import { ReplyDataCtxSchema, ReplyNode } from './nodes/reply-node'
import { IfDataCtxSchema, IfNode } from './nodes/if-node'
import { LoopDataCtxSchema, LoopNode } from './nodes/loop-node'
import { LoopStartDataCtxSchema, LoopStartNode } from './nodes/loop-start-node'
import { IterateDataCtxSchema, IterateNode } from './nodes/iterate-node'
import {
  IterateStartDataCtxSchema,
  IterateStartNode,
} from './nodes/iterate-start-node'
import { DifyDataCtxSchema, DifyNode } from './nodes/dify-node'
import type { Class } from 'type-fest'
import type z from 'zod'

export const NodeKlassMap: Record<ComponentNodesEnum, Class<CommNode>> = {
  [ComponentNodesEnum.Trigger]: TriggerNode,
  [ComponentNodesEnum.Reply]: ReplyNode,
  [ComponentNodesEnum.If]: IfNode,
  [ComponentNodesEnum.Loop]: LoopNode,
  [ComponentNodesEnum.LoopStart]: LoopStartNode,
  [ComponentNodesEnum.Iterate]: IterateNode,
  [ComponentNodesEnum.IterateStart]: IterateStartNode,
  [ComponentNodesEnum.Dify]: DifyNode,
}

export const NodeSchemaMap: Record<
  ComponentNodesEnum,
  z.ZodType<CommNodeType['data']>
> = {
  [ComponentNodesEnum.Trigger]: TriggerDataCtxSchema,
  [ComponentNodesEnum.Reply]: ReplyDataCtxSchema,
  [ComponentNodesEnum.If]: IfDataCtxSchema,
  [ComponentNodesEnum.Loop]: LoopDataCtxSchema,
  [ComponentNodesEnum.LoopStart]: LoopStartDataCtxSchema,
  [ComponentNodesEnum.Iterate]: IterateDataCtxSchema,
  [ComponentNodesEnum.IterateStart]: IterateStartDataCtxSchema,
  [ComponentNodesEnum.Dify]: DifyDataCtxSchema,
}
