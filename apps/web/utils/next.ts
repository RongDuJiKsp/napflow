import { useParams } from 'next/navigation'
import z from 'zod'

export const defineZodParamChecker = <T>(schema: z.ZodType<T>) => {
  return () => {
    const params = useParams()
    const check = schema.safeParse(params)
    if(!check.success)
      throw new Error(z.prettifyError(check.error))

    return check.data
  }
}
