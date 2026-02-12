import { ComponentNodesEnum } from '@shared/common/workflow/component-node'
import type { CommNode, CommNodeType } from './node'
import { TriggerDataSchema, TriggerNode } from './nodes/trigger-node'
import { ReplyDataSchema, ReplyNode } from './nodes/reply-node'
import { IfDataSchema, IfNode } from './nodes/if-node'
import type { Class } from 'type-fest'
import type z from 'zod'

export const NodeKlassMap: Record<ComponentNodesEnum, Class<CommNode>> = {
  [ComponentNodesEnum.Trigger]: TriggerNode,
  [ComponentNodesEnum.Reply]: ReplyNode,
  [ComponentNodesEnum.If]: IfNode,
}

export const NodeSchemaMap: Record<ComponentNodesEnum, z.ZodType<CommNodeType['data']>> = {
  [ComponentNodesEnum.Trigger]: TriggerDataSchema,
  [ComponentNodesEnum.Reply]: ReplyDataSchema,
  [ComponentNodesEnum.If]: IfDataSchema,
}
