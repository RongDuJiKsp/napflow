FROM node:22-alpine AS base
WORKDIR /app

# precheck
# pass
# 准备pnpm 上下文
RUN corepack enable
# deps
# 如果这个文件在构建上下文中不存在，说明不是在项目根目录
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/server/package.json  apps/server/
COPY apps/shared  apps/shared/
RUN pnpm install --frozen-lockfile
# copy files
# configs
COPY apps/server/tsconfig.json apps/server/tsconfig.build.json apps/server/nest-cli.json apps/server/vitest.config.ts  apps/server/
COPY apps/server/.env apps/server/.env.production apps/server/
COPY apps/server/eslint.config.mjs apps/server/
# code
COPY apps/server/src apps/server/src
# tests
COPY apps/server/test apps/server/test
# build
WORKDIR /app/apps/server
RUN pnpm run test:unit
RUN pnpm build
# entrypoint
ENV HOST_NAME=${SERVER_HOST_NAME:-0.0.0.0}
ENV PORT=${SERVER_PORT:-8848}
EXPOSE ${PORT}
CMD ["pnpm", "start:prod"]