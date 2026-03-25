import pino from 'pino'
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

export const loggerIgnoreMiddleware = (keywords: string[]) => {
  const logMethod: NonNullable<pino.LoggerOptions['hooks']>['logMethod'] = function (args, method) {
    const [obj, msg] = args

    let text: string | undefined
    try{
      if(typeof msg === 'string')
        text = msg
      else if(typeof obj === 'string')
        text = obj
      else
        text = JSON.stringify(obj)
    }
    catch{}

    if (keywords.some(keyword => text?.includes(keyword)))
      return

    method.apply(this, args)
  }
  return logMethod
}
