import type { NextConfig } from 'next'
import { codeInspectorPlugin } from 'code-inspector-plugin'
const nextConfig: NextConfig = {
  /* config options here */
  redirects() {
    return [
      {
        source: '/',
        destination: '/bots',
        permanent: false, // 307
      },
    ]
  },
  rewrites() {
    return [
      {
        source: '/__intern_view__/:path*',
        destination: '/data-report/:path*',
      },
    ]
  },
  logging: {
    browserToTerminal: true,
  },
  turbopack: {
    rules: codeInspectorPlugin({
      bundler: 'turbopack',
    }),
  },
}

export default nextConfig
