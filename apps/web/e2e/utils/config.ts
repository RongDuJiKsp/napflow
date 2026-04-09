import path from 'node:path'
import dotenv from 'dotenv'
import z from 'zod'
const envFiles = [
  '.env.e2e.local',
  '.env.e2e',
  '.env.development.local',
  '.env.development',
  '.env.local',
  '.env',
]

for (const file of envFiles)
  dotenv.config({ path: path.resolve(process.cwd(), file), override: false })

export const E2E_ENVS = z.object({
  baseUrl: z.string().catch('http://localhost'),
  accountEmail: z.email().catch('root@napflow.com'),
  accountPassword: z.string().catch('root'),
}).parse(process.env)

console.log('Using E2E Envs')
console.table(E2E_ENVS)
