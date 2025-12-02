import { defineConfig, env } from 'prisma/config'
export default defineConfig({
  schema: './src/prisma',
  datasource: {
    url: process.env.DATABASE_URL ? env('DATABASE_URL') : '',
  },
})
