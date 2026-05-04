import z from 'zod'

const EnvSchema = z
  .object({
    LISTEN_PORT: z.string().min(1).catch('80'),
    LISTEN_HOST: z.string().min(1).catch('127.0.0.1'),
    LOGGER_LEVEL: z.string().min(1).catch('info'),
    PROXY_TIMEOUT_MS: z.coerce.number().int().positive().catch(15000),
    WEB_TARGET: z.string().min(1),
    API_TARGET: z.string().min(1),
    SECURITY_KEY_PATH: z.string().optional(),
    SECURITY_CERT_PATH: z.string().optional(),
  })
  .superRefine((env, ctx) => {
    if (!!env.SECURITY_KEY_PATH !== !!env.SECURITY_CERT_PATH) {
      ctx.addIssue({
        code: 'custom',
        message:
          'SECURITY_KEY_PATH 和 SECURITY_CERT_PATH 必须同时提供或同时省略',
      })
    }
  })

export const PROCESS_ENV = EnvSchema.parse(process.env)
