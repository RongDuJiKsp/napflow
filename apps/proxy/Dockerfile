FROM node:22-alpine AS base
WORKDIR /app

ARG NPM_REGISTRY=https://registry.npmjs.org
ENV NPM_CONFIG_REGISTRY=${NPM_REGISTRY}
ENV COREPACK_NPM_REGISTRY=${NPM_REGISTRY}

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/proxy/package.json apps/proxy/
COPY apps/shared  apps/shared/
RUN pnpm install --frozen-lockfile

COPY apps/proxy/src apps/proxy/src
COPY apps/proxy/tsconfig.json apps/proxy/tsconfig.build.json apps/proxy/
COPY apps/proxy/nest-cli.json apps/proxy/
COPY apps/proxy/.env apps/proxy/.env.production apps/proxy/

WORKDIR /app/apps/proxy
RUN pnpm build

ENV WEBUI_PORT=80
EXPOSE ${WEBUI_PORT}
CMD ["pnpm", "start:prod"]
