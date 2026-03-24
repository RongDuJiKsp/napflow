FROM node:22-alpine AS base
WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/proxy/package.json apps/proxy/
RUN pnpm install --frozen-lockfile

COPY apps/proxy/src apps/proxy/src
COPY apps/proxy/tsconfig.json apps/proxy/tsconfig.json
COPY apps/proxy/.env.production apps/proxy/.env.production
COPY apps/proxy/.env.development apps/proxy/.env.development

WORKDIR /app/apps/proxy
RUN pnpm build

FROM node:22-alpine AS runtime
WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/proxy/package.json apps/proxy/
RUN pnpm install --frozen-lockfile --prod

COPY --from=base /app/apps/proxy/dist apps/proxy/dist
COPY --from=base /app/apps/proxy/.env.production apps/proxy/.env.production
COPY --from=base /app/apps/proxy/.env.development apps/proxy/.env.development

WORKDIR /app/apps/proxy

EXPOSE 3000
CMD ["pnpm", "start:prod"]
