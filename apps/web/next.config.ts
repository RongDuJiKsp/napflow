import type { NextConfig } from 'next'

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
}

export default nextConfig
