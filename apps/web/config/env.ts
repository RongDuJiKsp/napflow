// if not provide , use '/api/xxx' as common area
export const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? '/api'

export const isDevelopment = process.env.NEXT_PUBLIC_NODE_ENV === 'development'
export const isProduction = process.env.NEXT_PUBLIC_NODE_ENV === 'production'
