import z from 'zod'
import { defineZodResp } from '../_base'

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

export const Account = z.object({
  email: z.string(),
  nickname: z.string(),
  userGroup: z.array(
    z.object({
      groupType: z.string(),
      createdAt: z.date(),
    }),
  ),
  createdAt: z.date(),
  updatedAt: z.date(),
  disabledAt: z.date().nullable(), // 注意 定义POJO时 使用nullable而不是optional
})
export type AccountType = z.infer<typeof Account>
