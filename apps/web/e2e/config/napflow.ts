import z from 'zod'
import { defineE2eEnvs } from './base'

export const E2E_NAPFLOW_ENVS = defineE2eEnvs(z.object({
  E2E_NAPFLOW_WS_ENDPOINT: z.string().catch('ws://localhost:8081'),
  E2E_NAPFLOW_WS_TOKEN: z.string().catch('token'),
  E2E_NAPFLOW_WS_MAX_RETRIES: z.coerce.number().int().default(3),
  E2E_NAPFLOW_WS_RECONNECT_INTERVAL: z.coerce.number().int().default(3000),
  E2E_NAPFLOW_WS_HEARTBEAT_INTERVAL: z.coerce.number().int().default(30000),
}))
