# NapFlow Web

NapFlow 前端应用（Next.js），包含工作流编辑器、Bot 管理、插件发布与健康监控等界面。

## 技术栈

| 类别          | 技术                                          |
| ------------- | --------------------------------------------- |
| 框架          | **Next.js 16**（App Router）+ **React 19**    |
| UI 组件       | **HeroUI**、**Ant Design 6**、**Headless UI** |
| 样式          | **Tailwind CSS 4**                            |
| 工作流编辑器  | **@xyflow/react**（React Flow）               |
| 代码编辑/对比 | **Monaco Editor**                             |
| 富文本输入    | **Lexical**                                   |
| 状态管理      | **Zustand** + **Immer**                       |
| 数据请求      | **TanStack React Query** + **Alova**          |
| 图表          | **Ant Design Charts**                         |
| 工具库        | **ahooks**、**dayjs**、**tailwind-merge**     |
| 图标          | **Remix Icon**（@remixicon/react）            |

## 环境变量

前端环境变量通过 `process.env.XXX` 读取，其中 `NEXT_PUBLIC_` 前缀的变量会被注入到浏览器端代码中。

| 变量名                     | 说明                                                                    | 读取位置                            | 默认值             | 是否必填 |
| -------------------------- | ----------------------------------------------------------------------- | ----------------------------------- | ------------------ | -------- |
| `NEXT_PUBLIC_API_URL`      | 前端请求的 API 基础路径。推荐设置为 `/api`，由独立 proxy 服务转发到后端 | `config/env.ts`                     | `/api`             | 否       |
| `NEXT_PUBLIC_NODE_ENV`     | 前端运行环境标识，导出 `isDevelopment` / `isProduction`                 | `config/env.ts`                     | 自动取 `$NODE_ENV` | 否       |
| `STRENGTH_PASSWORD_LENGTH` | 前端密码强度校验的最小长度，正整数字符串                                | `app/components/_base/constants.ts` | `8`                | 否       |

> **说明**：当前推荐由独立 Node.js proxy 承接入口流量并转发 `/api/*` 到后端，前端保留 `NEXT_PUBLIC_API_URL=/api` 即可。若将 `NEXT_PUBLIC_API_URL` 设置为完整后端地址（如 `http://localhost:8848`），前端会直连后端，不经过 proxy。

## 本地启动

```bash
pnpm start:dev
```

默认访问 `http://localhost:3000`。

## 构建与生产启动

```bash
pnpm build
pnpm start:prod
```

## 测试

```bash
# 单元测试
pnpm test:unit

# E2E 测试
pnpm test:e2e
```

## 说明

- 项目使用 App Router，业务页面位于 `app/(auth)` 与 `app/(noauth)`。
- 推荐通过独立 proxy 访问（前端 `NEXT_PUBLIC_API_URL=/api`，由 proxy 转发到后端）。
