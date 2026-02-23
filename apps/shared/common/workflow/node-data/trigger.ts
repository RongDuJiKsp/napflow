import z from 'zod'

export enum TriggerOn {
  Friend = 'friend',
  Group = 'group',
}

// raw object schema，不含 superRefine，供 server 端 extend 使用
export const TriggerDataRawSchema = z.object({
  on: z.enum(TriggerOn),
  userId: z.string().optional(),
  groupId: z.string().optional(),
})

export const TriggerDataSchema = TriggerDataRawSchema.superRefine(
  (data, ctx) => {
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
  },
)

export type TriggerData = z.infer<typeof TriggerDataSchema>
