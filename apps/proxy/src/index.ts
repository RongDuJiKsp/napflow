import express, { type Request, type Response } from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import './env'
import { PROCESS_ENV } from './config'

const bootstrap = () => {
  const app = express()
  app.disable('x-powered-by')

  const host = PROCESS_ENV.LISTEN_HOST
  const port = Number(PROCESS_ENV.LISTEN_PORT)
  const webTarget = PROCESS_ENV.WEB_TARGET
  const apiTarget = PROCESS_ENV.API_TARGET

  app.get('/__proxy-health__', (_req: Request, res: Response) => {
    res.status(200).json({ ok: true })
  })

  app.use(/^\/__proxy-/, (_req: Request, res: Response) => {
    res.status(404).json({ ok: false, message: 'unknown proxy internal route' })
  })

  app.use(
    '/api',
    createProxyMiddleware({
      target: apiTarget,
      changeOrigin: true,
      ws: true,
      pathRewrite: {
        '^/api': '',
      },
    }),
  )

  app.use(
    createProxyMiddleware({
      target: webTarget,
      changeOrigin: true,
      ws: true,
    }),
  )

  app.listen(port, host, () => {
    console.log(`[proxy] listening on ${host}:${port}`)
    console.log(`[proxy] web target: ${webTarget}`)
    console.log(`[proxy] api target: ${apiTarget}`)
  })
}

bootstrap()
