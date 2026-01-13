import z from 'zod'
import type { ComponentCreator } from '../types'
import { RiWebhookLine } from '@remixicon/react'
import TriggerNode from './node'
import TriggerPanel from './panel'

export enum TriggerOn {
  Friend = 'friend',
  Group = 'group',
}

export const TriggerDataSchema = z.object({
  on: z.enum(TriggerOn),
  userId: z.number().optional(),
  groupId: z.number().optional(),
}).superRefine((data, ctx) => {
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
}
