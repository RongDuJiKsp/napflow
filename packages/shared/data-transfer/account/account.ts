import z from 'zod'

export const LoginReq = z.object({
  email: z.string(),
  password: z.string(),
})
export type LoginReqType = z.infer<typeof LoginReq>

export const LoginResp = z.object({
  token: z.string(),
})
export type LoginRespType = z.infer<typeof LoginResp>

export const Account = z.object({
  email: z.string(),
  nickname: z.string(),
  userGroup: z.array(z.enum(['Admin', 'User'])),
  createAt: z.date(),
  updatedAt: z.date(),
  disabledAt: z.date().optional(),
})
export type AccountType = z.infer<typeof Account>
