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

| 变量名                     | 说明                                                                       | 读取位置                            | 默认值                  | 是否必填 |
| -------------------------- | -------------------------------------------------------------------------- | ----------------------------------- | ----------------------- | -------- |
| `NEXT_PUBLIC_API_URL`      | 前端请求的 API 基础路径。推荐设置为 `/api`，由独立 proxy 服务转发到后端    | `config/env.ts`                     | `/api`                  | 否       |
| `NEXT_PUBLIC_NODE_ENV`     | 前端运行环境标识，导出 `isDevelopment` / `isProduction`                    | `config/env.ts`                     | 自动取 `$NODE_ENV`      | 否       |
| `STRENGTH_PASSWORD_LENGTH` | 前端密码强度校验的最小长度，正整数字符串                                   | `app/components/_base/constants.ts` | `8`                     | 否       |

> **说明**：当前推荐由独立 Node.js proxy 承接入口流量并转发 `/api/*` 到后端，前端保留 `NEXT_PUBLIC_API_URL=/api` 即可。若将 `NEXT_PUBLIC_API_URL` 设置为完整后端地址（如 `http://localhost:8848`），前端会直连后端，不经过 proxy。

## Getting Started

First, run the development server:

```bash
pnpm dev
```

Open `http://localhost:3000` with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
