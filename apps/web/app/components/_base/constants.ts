import z from 'zod'

const ZodConstantsVaild = z.object({
  STRENGTH_PASSWORD_LENGTH: z
    .string()
    .default('8')
    .transform(val => Number(val))
    .pipe(z.number().nonnegative().int()),
})

const { STRENGTH_PASSWORD_LENGTH } = ZodConstantsVaild.parse({
  STRENGTH_PASSWORD_LENGTH: process.env.STRENGTH_PASSWORD_LENGTH,
})
export { STRENGTH_PASSWORD_LENGTH }
