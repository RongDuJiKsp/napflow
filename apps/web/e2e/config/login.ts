import z from 'zod'
import { defineE2eEnvs } from './base'

export const E2E_LOGIN_ENVS = defineE2eEnvs(z.object({
  E2E_LOGIN_ACC_EMAIL: z.email().catch('root@napflow.com'),
  E2E_LOGIN_ACC_PASSWORD: z.string().catch('root'),
}))
