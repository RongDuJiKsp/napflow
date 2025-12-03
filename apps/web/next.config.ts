import type { NextConfig } from 'next'
import type { Rewrite } from 'next/dist/lib/load-custom-routes'

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
  rewrites(): Rewrite[] {
    const rewrites: Rewrite[] = []
    // 如果 NEXT_PUBLIC_API_URL 以 / 开头，那么就转发到 SERVER_URL
    if(process.env.NEXT_PUBLIC_API_URL?.startsWith('/')) {
      rewrites.push({
        source: `${process.env.NEXT_PUBLIC_API_URL}/:slug*`,
        destination: `${process.env.SERVER_URL ?? 'http://localhost:8848'}/:slug*`,
      })
    }
    return rewrites
  },
  output: 'standalone',
}

export default nextConfig
