import z from 'zod'

export enum UserRole {
  Admin = 'Admin',
  User = 'User',
}
// base
export const ZodCheckUserRoleType = z.enum(UserRole)
export type UserRoleType = z.infer<typeof ZodCheckUserRoleType>

export const ZodCheckAccount = z.object({
  email: z.email(),
  nickname: z.string(),
  userGroup: z.array(
    z.object({
      groupType: ZodCheckUserRoleType,
    }),
  ),
})
export type Account = z.infer<typeof ZodCheckAccount>

export const ZodCheckAccountInfo = ZodCheckAccount.extend({
  userGroup: z.array(
    z.object({
      groupType: ZodCheckUserRoleType,
      createdAt: z.date(),
    }),
  ),
  createdAt: z.date(),
  updatedAt: z.date(),
  disabledAt: z.date().nullable(), // 注意 定义POJO时 使用nullable而不是optional
})
export type AccountInfo = z.infer<typeof ZodCheckAccountInfo>
