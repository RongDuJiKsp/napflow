# NapFlow Proxy

独立 Node.js 代理层（TypeScript），用于承接前端入口流量并转发 API 请求。

## 路由规则

- `/api/*` -> `${API_TARGET}/*`（自动去掉 `/api` 前缀）
- 其他路径 -> `${WEB_TARGET}`

## 环境变量

- `LISTEN_PORT`：代理监听端口，默认 `80`
- `LISTEN_HOST`：代理监听主机，默认 `127.0.0.1`
- `LOGGER_LEVEL`：日志级别，默认 `info`
- `WEB_TARGET`：前端 Next.js 服务地址（必填）
- `API_TARGET`：后端服务地址（必填）
- `PROXY_TIMEOUT_MS`：代理请求超时（毫秒），默认 `15000`

proxy 使用 `dotenv` 自动加载环境变量文件，加载优先级如下：

- `.env.${NODE_ENV}.local`
- `.env.${NODE_ENV}`
- `.env.local`
- `.env`

已内置：

- `.env.development`：本地开发目标（`WEB_TARGET=http://localhost:3000`、`API_TARGET=http://localhost:8848`）
- `.env.production`：容器部署目标（`WEB_TARGET=http://web:3000`、`API_TARGET=http://server:8848`）

## 本地启动

```bash
pnpm --filter proxy start:dev
```

默认监听 `http://127.0.0.1:80`（生产环境通常通过 `LISTEN_HOST=0.0.0.0` 暴露）。

## 构建与运行

```bash
pnpm --filter proxy build
pnpm --filter proxy start:prod
```

`build` 使用 `tsc` 编译到 `dist` 目录。

## 代码规范

```bash
pnpm --filter proxy lint:all
```

ESLint 复用了仓库根配置，并增加了 `dist` 忽略规则。
