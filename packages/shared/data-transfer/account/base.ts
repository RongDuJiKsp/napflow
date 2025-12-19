import z from 'zod'

export enum UserRole {
  Admin = 'Admin',
  User = 'User',
}
// base
export const UserRoleType = z.enum(UserRole)
export type UserRoleTypeType = z.infer<typeof UserRoleType>

export const Account = z.object({
  email: z.email(),
  nickname: z.string(),
  userGroup: z.array(
    z.object({
      groupType: UserRoleType,
    }),
  ),
})
export type AccountType = z.infer<typeof Account>

export const AccountInfo = Account.extend({
  userGroup: z.array(
    z.object({
      groupType: UserRoleType,
      createdAt: z.date(),
    }),
  ),
  createdAt: z.date(),
  updatedAt: z.date(),
  disabledAt: z.date().nullable(), // 注意 定义POJO时 使用nullable而不是optional
})
export type AccountInfoType = z.infer<typeof AccountInfo>
