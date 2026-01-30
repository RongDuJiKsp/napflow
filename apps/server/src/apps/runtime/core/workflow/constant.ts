import { ComponentNodesEnum } from '@shared/common/workflow/component-node'
import type { CommNode, CommNodeType } from './node'
import { TriggerDataSchema, TriggerNode } from './nodes/trigger-node'
import { ReplyDataSchema, ReplyNode } from './nodes/reply-node'
import type { Class } from 'type-fest'
import type z from 'zod'

export const NodeKlassMap: Record<ComponentNodesEnum, Class<CommNode>> = {
  [ComponentNodesEnum.Trigger]: TriggerNode,
  [ComponentNodesEnum.Reply]: ReplyNode,
}

export const NodeSchemaMap: Record<ComponentNodesEnum, z.ZodType<CommNodeType['data']>> = {
  [ComponentNodesEnum.Trigger]: TriggerDataSchema,
  [ComponentNodesEnum.Reply]: ReplyDataSchema,
}
