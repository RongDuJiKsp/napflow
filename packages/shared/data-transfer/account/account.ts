import z from 'zod'
import { defineZodResp } from '../_base'
// base
export const UserRoleType = z.enum(['Admin', 'User'])

export const Account = z.object({
  email: z.string(),
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
// req resp

export const LoginReq = z.object({
  email: z.string(),
  password: z.string(),
})
export type LoginReqType = z.infer<typeof LoginReq>

export const LoginResp = defineZodResp(
  z.object({
    token: z.string(),
  }),
)
export type LoginRespType = z.infer<typeof LoginResp>

export const AccountInfoListQuery = z.object({
  isDisabled: z.boolean().optional(), // 用户是否被禁用
  groups: z.array(UserRoleType).optional(), // 用户组
})
export type AccountInfoListQueryType = z.infer<typeof AccountInfoListQuery>

export const AccountInfoListResp = defineZodResp(
  z.array(AccountInfo),
)
export type AccountInfoListRespType = z.infer<typeof AccountInfoListResp>

export const AccountUpDownGradeReq = z.object({
  email: z.string(),
  groupType: z.array(UserRoleType),
})
export type AccountUpDownGradeReqType = z.infer<typeof AccountUpDownGradeReq>

export const AccountUpDownGradeResp = defineZodResp(
  z.object({
    effectLines: z.number(),
  }),
)
export type AccountUpDownGradeRespType = z.infer<typeof AccountUpDownGradeResp>

export const AccountDisableReq = z.object({
  email: z.string(),
})
export type AccountDisableReqType = z.infer<typeof AccountDisableReq>

export const AccountDisableResp = defineZodResp(
  z.undefined().optional(),
)
export type AccountDisableRespType = z.infer<typeof AccountDisableResp>