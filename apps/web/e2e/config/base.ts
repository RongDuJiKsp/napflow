import path from 'node:path'
import dotenv from 'dotenv'
import type z from 'zod'
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

export const defineE2eEnvs = <S extends z.ZodObject>(schema: S) => schema.parse(process.env)
