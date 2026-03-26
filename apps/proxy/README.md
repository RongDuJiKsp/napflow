# NapFlow Proxy

独立 Node.js 代理层（TypeScript），用于承接前端入口流量并转发 API 请求。

## 路由规则

- `/api/*` -> 后端服务（自动去掉 `/api` 前缀）
- 其他路径 -> 前端服务

## 本地启动

```bash
pnpm --filter proxy start:dev
```

默认监听 `http://127.0.0.1:80`。

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
