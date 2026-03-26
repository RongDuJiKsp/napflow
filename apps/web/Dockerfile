FROM node:22-alpine AS base
WORKDIR /app

# precheck
# pass
# 准备pnpm 上下文
RUN corepack enable
# deps
# 如果这个文件在构建上下文中不存在，说明不是在项目根目录
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json  apps/web/
COPY apps/shared  apps/shared/
RUN pnpm install --frozen-lockfile
# copy files
# configs
COPY apps/web/tsconfig.json apps/web/postcss.config.mjs apps/web/next.config.ts apps/web/vitest.config.ts apps/web/playwright.config.ts apps/web/
COPY apps/web/.env apps/web/.env.production apps/web/
COPY apps/web/eslint.config.mjs apps/web/
# code
COPY apps/web/app   apps/web/app
COPY apps/web/config apps/web/config
COPY apps/web/public apps/web/public
COPY apps/web/utils apps/web/utils
# tests
COPY apps/web/test apps/web/test
COPY apps/web/e2e apps/web/e2e
# build
WORKDIR /app/apps/web
RUN pnpm test:unit
RUN pnpm build
# entrypoint
ENV WEB_PORT=3000
EXPOSE ${WEB_PORT}
CMD ["pnpm", "start:prod"]