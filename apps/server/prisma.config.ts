import { defineConfig } from 'prisma/config'
export default defineConfig({
  schema: './src/prisma',
  datasource: {
    // 有些时候不需要db Url ，然而cli没有url就不跑 因此用example url
    url: process.env.DATABASE_URL ?? 'mysql://user:password@host:3306/db',
  },
})
