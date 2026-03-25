import { pino } from 'pino'
import { PROCESS_ENV } from './config'
import pretty from 'pino-pretty'
const stream = pretty({
  colorize: true,
  ignore: 'pid,hostname',
})

export const proxyLogger = pino({
  name: 'proxy',
  level: PROCESS_ENV.LOGGER_LEVEL,
}, stream)
