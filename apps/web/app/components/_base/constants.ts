import z from 'zod'

const ZodConstantsVaild = z.object({
  STRENGTH_PASSWORD_LENGTH: z.coerce.number().int().nonnegative().catch(8),
})

const { STRENGTH_PASSWORD_LENGTH } = ZodConstantsVaild.parse({
  STRENGTH_PASSWORD_LENGTH: process.env.STRENGTH_PASSWORD_LENGTH,
})
export { STRENGTH_PASSWORD_LENGTH }
