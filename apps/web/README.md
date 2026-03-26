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
- 推荐通过独立 proxy 访问，由 proxy 转发到后端。
