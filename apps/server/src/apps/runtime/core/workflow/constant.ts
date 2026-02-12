import { ComponentNodesEnum } from '@shared/common/workflow/component-node'
import type { CommNode, CommNodeType } from './node'
import { TriggerDataCtxSchema, TriggerNode } from './nodes/trigger-node'
import { ReplyDataCtxSchema, ReplyNode } from './nodes/reply-node'
import { IfDataCtxSchema, IfNode } from './nodes/if-node'
import type { Class } from 'type-fest'
import type z from 'zod'

export const NodeKlassMap: Record<ComponentNodesEnum, Class<CommNode>> = {
  [ComponentNodesEnum.Trigger]: TriggerNode,
  [ComponentNodesEnum.Reply]: ReplyNode,
  [ComponentNodesEnum.If]: IfNode,
}

export const NodeSchemaMap: Record<ComponentNodesEnum, z.ZodType<CommNodeType['data']>> = {
  [ComponentNodesEnum.Trigger]: TriggerDataCtxSchema,
  [ComponentNodesEnum.Reply]: ReplyDataCtxSchema,
  [ComponentNodesEnum.If]: IfDataCtxSchema,
}
