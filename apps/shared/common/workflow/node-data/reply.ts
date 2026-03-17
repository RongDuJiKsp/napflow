import z from 'zod'

export enum ReplyTarget {
  User = 'user',
  Group = 'group',
  triggerSource = 'triggerSource',
}

export const ReplyDataSchema = z
  .object({
    content: z.string(),
    replyTarget: z.enum(ReplyTarget),
    userId: z.string().optional(),
    groupId: z.string().optional(),
    triggerSourceId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.replyTarget === ReplyTarget.User) {
      if (!data.userId) {
        ctx.addIssue({
          code: 'custom',
          message: '请选择回复目标',
        })
      }
    }
    if (data.replyTarget === ReplyTarget.Group) {
      if (!data.groupId) {
        ctx.addIssue({
          code: 'custom',
          message: '请选择回复目标',
        })
      }
    }
    if (data.replyTarget === ReplyTarget.triggerSource) {
      if (!data.triggerSourceId) {
        ctx.addIssue({
          code: 'custom',
          message: '请选择回复目标',
        })
      }
    }
  })

export type ReplyData = z.infer<typeof ReplyDataSchema>
