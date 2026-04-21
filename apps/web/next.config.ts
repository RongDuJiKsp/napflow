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
  logging: {
    browserToTerminal: true,
  },
}

export default nextConfig
