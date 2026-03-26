import z from 'zod'

const EnvSchema = z.object({
  LISTEN_PORT: z.string().default('80'),
  LISTEN_HOST: z.string().default('0.0.0.0'),
  LOGGER_LEVEL: z.string().default('info'),
  PROXY_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),
  WEB_TARGET: z.string(),
  API_TARGET: z.string(),
})

export const PROCESS_ENV = EnvSchema.parse(process.env)
