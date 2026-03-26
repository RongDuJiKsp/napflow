import z from 'zod'

const EnvSchema = z.object({
  LISTEN_PORT: z.string().min(1).catch('80'),
  LISTEN_HOST: z.string().min(1).catch('127.0.0.1'),
  LOGGER_LEVEL: z.string().min(1).catch('info'),
  PROXY_TIMEOUT_MS: z.coerce.number().int().positive().catch(15000),
  WEB_TARGET: z.string().min(1),
  API_TARGET: z.string().min(1),
})

export const PROCESS_ENV = EnvSchema.parse(process.env)
