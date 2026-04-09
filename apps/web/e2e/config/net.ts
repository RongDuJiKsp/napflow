import z from 'zod'
import { defineE2eEnvs } from './base'

export const E2E_NET_ENVS = defineE2eEnvs(z.object({
  E2E_BASE_URL: z.string().catch('http://localhost'),
}))
