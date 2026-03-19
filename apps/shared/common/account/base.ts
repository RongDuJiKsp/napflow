import z from 'zod'
import { UserRole } from './core'
import { ZodCheckUser } from './entity'

export const ZodCheckUserGroup = z.object({
  groupType: z.enum(UserRole),
})
export type UserGroup = z.infer<typeof ZodCheckUserGroup>

export const ZodCheckUserGroupRecord = ZodCheckUserGroup.extend({
  createdAt: z.date(),
})
export type UserGroupRecord = z.infer<typeof ZodCheckUserGroupRecord>

export const ZodCheckAccount = ZodCheckUser.pick({
  email: true,
  nickname: true,
}).extend({
  userGroup: z.array(ZodCheckUserGroup),
})
export type Account = z.infer<typeof ZodCheckAccount>

export const ZodCheckAccountInfo = ZodCheckAccount.extend(
  ZodCheckUser.pick({
    createdAt: true,
    updatedAt: true,
    disabledAt: true,
  }).shape,
).extend({
  userGroup: z.array(ZodCheckUserGroupRecord),
})
export type AccountInfo = z.infer<typeof ZodCheckAccountInfo>
