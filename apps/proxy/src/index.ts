import './env'
import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { PROCESS_ENV } from './config'
import { logger, loggerIgnoreMiddleware, loggerStream } from './logger'
import pino from 'pino'
import { ServerResponse } from 'node:http'
import { Code, Resp } from '@shared/data-transfer/_base'

const mountProxy = (app: express.Express) => {
  const webTarget = PROCESS_ENV.WEB_TARGET
  const apiTarget = PROCESS_ENV.API_TARGET
  const proxyTimeoutMs = PROCESS_ENV.PROXY_TIMEOUT_MS

  const webLogger = pino(
    {
      name: 'web-proxy',
      level: PROCESS_ENV.LOGGER_LEVEL,
      hooks: {
        logMethod: loggerIgnoreMiddleware(['__nextjs_', '_next/static']),
      },
    },
    loggerStream,
  )

  const apiLogger = pino(
    { name: 'api-proxy', level: PROCESS_ENV.LOGGER_LEVEL },
    loggerStream,
  )

  app.use(
    createProxyMiddleware({
      pathFilter: ['/api/**'],
      target: apiTarget,
      changeOrigin: true,
      ws: true,
      timeout: proxyTimeoutMs,
      proxyTimeout: proxyTimeoutMs,
      pathRewrite: {
        '^/api': '',
      },
      logger: apiLogger,
      on: {
        error: (err, _req, res) => {
          if(res instanceof ServerResponse)
            res.status(502).json(Resp.error(`网关层错误${err.message}`, Code.BadGateway))
        },
      },
    }),
  )

  app.use(
    createProxyMiddleware({
      target: webTarget,
      changeOrigin: true,
      ws: true,
      timeout: proxyTimeoutMs,
      proxyTimeout: proxyTimeoutMs,
      logger: webLogger,
    }),
  )
}

const bootstrap = () => {
  const app = express()
  app.disable('x-powered-by')

  mountProxy(app)

  const host = PROCESS_ENV.LISTEN_HOST
  const port = Number(PROCESS_ENV.LISTEN_PORT)
  const webTarget = PROCESS_ENV.WEB_TARGET
  const apiTarget = PROCESS_ENV.API_TARGET
  const proxyTimeoutMs = PROCESS_ENV.PROXY_TIMEOUT_MS

  app.listen(port, host, () => {
    logger.info(`listening on ${host}:${port}`)
    logger.info(`web target: ${webTarget}`)
    logger.info(`api target: ${apiTarget}`)
    logger.info(`proxy timeout(ms): ${proxyTimeoutMs}`)
  })
}

bootstrap()
