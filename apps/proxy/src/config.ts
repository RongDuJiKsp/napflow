import { resolve } from 'node:path'
import dotenv from 'dotenv'
//  该文件必须在启动文件顶部导入，确保在任何其他模块使用环境变量之前完成加载

export const NODE_ENV = process.env.NODE_ENV ?? 'production'

const envFiles = [
  `.env.${NODE_ENV}.local`,
  `.env.${NODE_ENV}`,
  '.env.local',
  '.env',
]

/**
 * @description 加载环境变量配置，按照优先级覆盖
 * 优先级：.env.{NODE_ENV}.local > .env.{NODE_ENV} > .env.local > .env
 */
const configEnv = () => {
  for (const envFile of envFiles)
    dotenv.config({ path: resolve(process.cwd(), envFile) })
}

configEnv()
