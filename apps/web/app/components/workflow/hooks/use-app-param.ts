import { defineZodParamChecker } from '@/utils/next'
import z from 'zod'

export const ZodCheckAppParam = z.object({
  appId: z.string().min(1),
})
export type AppParam = z.infer<typeof ZodCheckAppParam>

export const useAppParam = defineZodParamChecker(ZodCheckAppParam)
