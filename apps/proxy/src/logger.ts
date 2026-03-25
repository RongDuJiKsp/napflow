import { pino } from 'pino'
import { PROCESS_ENV } from './config'
import pretty from 'pino-pretty'
export const loggerStream = pretty({
  colorize: true,
  ignore: 'pid,hostname',
})

export const logger = pino({
  name: 'proxy',
  level: PROCESS_ENV.LOGGER_LEVEL,
}, loggerStream)
