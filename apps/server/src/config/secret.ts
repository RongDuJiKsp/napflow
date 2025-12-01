import * as crypto from 'node:crypto'
// 如果没有设置JWT_SECRET_KEY，则每次启动时生成一个随机的JWT_SECRET_KEY
export const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY ?? crypto.randomBytes(32).toString('hex')
