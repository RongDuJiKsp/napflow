import z from 'zod'
import { UserRole } from './core'

export const ZodCheckUser = z.object({
  email: z.email(),
  nickname: z.string().min(1),
  password: z.string().min(1),
  createdAt: z.date(),
  updatedAt: z.date(),
  disabledAt: z.date().nullable(),
})
export type User = z.infer<typeof ZodCheckUser>

export const ZodCheckUserGroup = z.object({
  ofUser: z.string(),
  groupType: z.enum(UserRole),
  createdAt: z.date(),
})
export type UserGroup = z.infer<typeof ZodCheckUserGroup>
