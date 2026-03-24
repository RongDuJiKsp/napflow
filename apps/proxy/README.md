# NapFlow Proxy

独立 Node.js 代理层（TypeScript），用于承接前端入口流量并转发 API 请求。

## 路由规则

- `/api/*` -> `${API_TARGET}/*`（自动去掉 `/api` 前缀）
- `/__proxy-xxx__` -> proxy 内部路由（如 `/__proxy-health__`）
- 其他路径 -> `${WEB_TARGET}`

## 环境变量

- `PORT`：代理监听端口，默认 `3000`
- `WEB_TARGET`：前端 Next.js 服务地址，默认 `http://localhost:3000`
- `API_TARGET`：后端服务地址，默认 `http://localhost:8848`

proxy 使用 `dotenv` 自动加载环境变量文件，加载优先级如下：

- `.env.${NODE_ENV}.local`
- `.env.${NODE_ENV}`
- `.env.local`
- `.env`

已内置：

- `.env.development`：本地开发环境（localhost）
- `.env.production`：生产环境（docker 内部服务名）

## 本地启动

```bash
pnpm --filter proxy start:dev
```

默认监听 `http://localhost:3100`。

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
