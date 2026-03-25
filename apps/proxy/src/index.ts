import './env'
import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { PROCESS_ENV } from './config'
import { proxyLogger } from './logger'

const mountProxy = (app: express.Express) => {
  const webTarget = PROCESS_ENV.WEB_TARGET
  const apiTarget = PROCESS_ENV.API_TARGET

  app.use(
    '/api',
    createProxyMiddleware({
      target: apiTarget,
      changeOrigin: true,
      ws: true,
      pathRewrite: {
        '^/api': '',
      },
      logger: proxyLogger,
    }),
  )

  app.use(
    createProxyMiddleware({
      target: webTarget,
      changeOrigin: true,
      ws: true,
      logger: proxyLogger,
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

  app.listen(port, host, () => {
    proxyLogger.info(`[proxy] listening on ${host}:${port}`)
    proxyLogger.info(`[proxy] web target: ${webTarget}`)
    proxyLogger.info(`[proxy] api target: ${apiTarget}`)
  })
}

bootstrap()
