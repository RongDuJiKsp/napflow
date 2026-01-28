import z from 'zod'
import type {
  ComponentCreator,
} from '../../types'
import { RiWebhookLine } from '@remixicon/react'
import TriggerNode from './node'
import TriggerPanel from './panel'
import { ComponentNodesEnum } from '@shared/common/workflow/component-node'
import { VarTypes } from '@shared/common/workflow/component-node'

export enum TriggerOn {
  Friend = 'friend',
  Group = 'group',
}

export const TriggerDataSchema = z
  .object({
    on: z.enum(TriggerOn),
    userId: z.string().optional(),
    groupId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.on === TriggerOn.Friend && !data.userId) {
      ctx.addIssue({
        code: 'custom',
        message: '当on为friend时，userId不能为空',
        path: ['userId'],
      })
    }
    if (data.on === TriggerOn.Group && !data.groupId) {
      ctx.addIssue({
        code: 'custom',
        message: '当on为group时，groupId不能为空',
        path: ['groupId'],
      })
    }
  })
export type TriggerData = z.infer<typeof TriggerDataSchema>

export const TriggerNodeCreator: ComponentCreator<TriggerData> = {
  create: () => ({
    on: TriggerOn.Friend,
  }),
  schema: TriggerDataSchema,
  label: '触发器',
  icon: RiWebhookLine,
  nodeComponent: TriggerNode,
  editPanelComponent: TriggerPanel,
  prevNodes: [],
  nextNodes: [ComponentNodesEnum.Reply],
  env: [
    { type: VarTypes.String, name: 'trigger.triggerid' },
    { type: VarTypes.Number, name: 'trigger.uid' },
    { type: VarTypes.Number, name: 'trigger.gid' },
    { type: VarTypes.Number, name: 'trigger.messageid' },
    { type: VarTypes.String, name: 'trigger.msgreadable' },
  ],
}
