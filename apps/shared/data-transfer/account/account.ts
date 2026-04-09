import z from 'zod'
import { defineZodResp } from '../_base'
import { ZodCheckAccountInfo } from '../../common/account/base'
import { UserRole } from '@shared/common/account/core'

// req resp

// @/account/login
export const ZodCheckLoginReq = ZodCheckAccountInfo.pick({
  email: true,
}).extend({
  password: z.string().min(1, 'Password is required'),
})
export type LoginReq = z.infer<typeof ZodCheckLoginReq>

export const ZodCheckLoginResp = defineZodResp(
  z.object({
    token: z.string(),
  }),
)
export type LoginResp = z.infer<typeof ZodCheckLoginResp>

// @/account/account
export const ZodCheckAccountInfoListQuery = z.object({
  isDisabled: z.boolean().optional(), // 用户是否被禁用
  groups: z.array(z.enum(UserRole)).optional(), // 用户组
})
export type AccountInfoListQuery = z.infer<typeof ZodCheckAccountInfoListQuery>

export const ZodCheckAccountInfoListResp = defineZodResp(
  z.array(ZodCheckAccountInfo),
)
export type AccountInfoListResp = z.infer<typeof ZodCheckAccountInfoListResp>

// @/account/cur-account @/account/account-info
export const ZodCheckAccountInfoResp = defineZodResp(
  ZodCheckAccountInfo.nullable(),
)
export type AccountInfoResp = z.infer<typeof ZodCheckAccountInfoResp>

// @/account/upgrade @/account/downgrade
export const ZodCheckAccountUpDownGradeReq = ZodCheckAccountInfo.pick({
  email: true,
}).extend({
  groupType: z.array(z.enum(UserRole)),
})
export type AccountUpDownGradeReq = z.infer<
  typeof ZodCheckAccountUpDownGradeReq
>

export const ZodCheckAccountUpDownGradeResp = defineZodResp(
  z.object({
    effectLines: z.number(),
  }),
)
export type AccountUpDownGradeResp = z.infer<
  typeof ZodCheckAccountUpDownGradeResp
>

// @/account/disable
export const ZodCheckAccountDisableReq = ZodCheckAccountInfo.pick({
  email: true,
})
export type AccountDisableReq = z.infer<typeof ZodCheckAccountDisableReq>

// @/account/create
export const ZodCheckAccountCreateReq = ZodCheckAccountInfo.pick({
  email: true,
  nickname: true,
}).extend({ password: z.string() })
export type AccountCreateReq = z.infer<typeof ZodCheckAccountCreateReq>

// @/account/change-password
export const ZodCheckAccountChangePasswordReq = z.object({
  originPassword: z.string(),
  password: z.string(),
})
export type AccountChangePasswordReq = z.infer<
  typeof ZodCheckAccountChangePasswordReq
>

// @/account/change-nickname
export const ZodCheckAccountChangeNicknameReq = ZodCheckAccountInfo.pick({
  nickname: true,
})
export type AccountChangeNicknameReq = z.infer<
  typeof ZodCheckAccountChangeNicknameReq
>
