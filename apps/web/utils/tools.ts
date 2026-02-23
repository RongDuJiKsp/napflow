import crypto from 'node:crypto'
export const md5Fn = <T extends (...args: any[]) => any>(fn: T) =>
  // eslint-disable-next-line sonarjs/hashing
  crypto.createHash('md5').update(fn.toString()).digest('hex')
