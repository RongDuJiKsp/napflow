import z from 'zod'

const EnvSchema = z.object({
  LISTEN_PORT: z.string().default('3000'),
  LISTEN_HOST: z.string().default('0.0.0.0'),
  WEB_TARGET: z.string(),
  API_TARGET: z.string(),
})

export const PROCESS_ENV = EnvSchema.parse(process.env)
