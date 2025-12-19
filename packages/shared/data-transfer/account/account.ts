import z from 'zod'
import { defineZodResp } from '../_base'
import { AccountInfo, UserRoleType } from './base'

// req resp

// @/account/login
export const LoginReq = AccountInfo.pick({ email: true }).extend({
  password: z.string(),
})
export type LoginReqType = z.infer<typeof LoginReq>

export const LoginResp = defineZodResp(
  z.object({
    token: z.string(),
  }),
)
export type LoginRespType = z.infer<typeof LoginResp>

// @/account/account
export const AccountInfoListQuery = z.object({
  isDisabled: z.boolean().optional(), // 用户是否被禁用
  groups: z.array(UserRoleType).optional(), // 用户组
})
export type AccountInfoListQueryType = z.infer<typeof AccountInfoListQuery>

export const AccountInfoListResp = defineZodResp(z.array(AccountInfo))
export type AccountInfoListRespType = z.infer<typeof AccountInfoListResp>

// @/account/cur-account @/account/account-info
export const AccountInfoResp = defineZodResp(AccountInfo.nullable())
export type AccountInfoRespType = z.infer<typeof AccountInfoResp>

// @/account/upgrade @/account/downgrade
export const AccountUpDownGradeReq = AccountInfo.pick({ email: true }).extend({
  groupType: z.array(UserRoleType),
})
export type AccountUpDownGradeReqType = z.infer<typeof AccountUpDownGradeReq>

export const AccountUpDownGradeResp = defineZodResp(
  z.object({
    effectLines: z.number(),
  }),
)
export type AccountUpDownGradeRespType = z.infer<typeof AccountUpDownGradeResp>

// @/account/disable
export const AccountDisableReq = AccountInfo.pick({ email: true })
export type AccountDisableReqType = z.infer<typeof AccountDisableReq>

// @/account/create
export const AccountCreateReq = AccountInfo.pick({
  email: true,
  nickname: true,
}).extend({ password: z.string() })
export type AccountCreateReqType = z.infer<typeof AccountCreateReq>

// @/account/change-password
export const AccountChangePasswordReq = z.object({
  originPassword: z.string(),
  password: z.string(),
})
export type AccountChangePasswordReqType = z.infer<
  typeof AccountChangePasswordReq
>

// @/account/change-nickname
export const AccountChangeNicknameReq = AccountInfo.pick({ nickname: true })
export type AccountChangeNicknameReqType = z.infer<
  typeof AccountChangeNicknameReq
>
