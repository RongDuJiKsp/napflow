import express, { type Request, type Response } from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import './config'

const bootstrap = () => {
  const app = express()
  app.disable('x-powered-by')

  const port = Number(process.env.PORT || 3000)
  const webTarget = process.env.WEB_TARGET || 'http://localhost:3000'
  const apiTarget = process.env.API_TARGET || 'http://localhost:8848'

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

  app.listen(port, '0.0.0.0', () => {
    console.log(`[proxy] listening on 0.0.0.0:${port}`)
    console.log(`[proxy] web target: ${webTarget}`)
    console.log(`[proxy] api target: ${apiTarget}`)
  })
}

bootstrap()
