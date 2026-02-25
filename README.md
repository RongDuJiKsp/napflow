
# NapFlow

NapFlow 是一个基于**可视化工作流**的 QQ 机器人管理平台，提供从机器人创建、工作流编排、插件发布到运行时监控的一站式解决方案。用户可以通过直观的拖拽式工作流编辑器设计机器人的自动化逻辑，并将工作流发布为可复用的插件绑定到机器人上运行。

## ✨ 核心功能

### 🤖 机器人管理
- **Bot 生命周期管理**：支持创建、启动、停止、杀死、重拉（强制重新加载）等操作
- **适配器系统**：目前支持 **NapCat WebSocket** 适配器，通过 WebSocket 客户端连接 NapCat 服务
- **Bot 状态实时展示**：运行中 / 离线 / 已停止 / 致命错误 / 已杀死等状态可视化
- **自动启动配置**：支持设置服务端启动后自动启动 Bot
- **Bot 健康监控**：实时展示 Bot 级别的节点队列和任务队列监控数据

### 📋 工作流编辑器
- **可视化拖拽编辑**：基于 React Flow 的节点-连线式工作流编辑器
- **多种节点类型**：
  - **触发器节点（Trigger）**：支持私聊触发和群聊触发，可配置触发 UID / GID
  - **回复节点（Reply）**：支持向用户、群组或触发源上下文发送消息
  - **条件节点（If）**：支持 IF / ELSE IF / ELSE 多分支条件判断，提供字符串比较（相等、包含、不包含等）和数值比较（大于、小于等）
- **环境变量系统**：支持定义 String / Number / StringArray / NumberArray 类型的环境变量，节点参数中可通过 `$` 引用
- **变量引用输入框**：基于 Lexical 的富文本输入框，输入 `$` 自动弹出变量选择菜单
- **右键上下文菜单**：支持在画布右键创建新节点、对节点右键进行操作
- **节点编辑侧边栏**：选中节点后在侧边栏展示详细配置面板
- **便签节点（Sticky Note）**：在编辑器中添加备忘便签
- **草稿自动保存**：编辑内容自动保存为草稿

### 🚀 插件发布系统
- **工作流→插件转换**：将工作流发布为可复用的插件
- **版本管理**：每次发布生成独立版本，支持填写版本号和描述
- **差异对比（Diff）**：发布前通过 Monaco Diff Editor 对比当前草稿与上次发布版本的差异
- **多步骤发布流程**：差异确认 → 版本信息填写 → 发布结果展示

### 🔗 插件绑定
- **插件市场**：展示所有可用工作流应用的已发布版本
- **多插件绑定**：支持同时选择多个插件/版本批量绑定到 Bot
- **环境变量配置**：绑定插件到 Bot 后，可以为该绑定实例独立配置环境变量值，实现同一插件在不同 Bot 上的个性化运行
- **绑定管理**：查看已绑定插件列表，支持解绑操作

### 📊 系统健康监控
- **仪表盘总览**：内存健康度、事件循环健康度、GC 健康度三大核心仪表盘
- **CPU 监控**：CPU 使用率趋势折线图
- **内存监控**：内存使用趋势折线图
- **事件循环监控**：事件循环延迟趋势图
- **GC 监控**：垃圾回收相关指标趋势图
- **定时轮询**：数据自动刷新

### 👥 用户与权限管理
- **登录认证**：基于 JWT 的邮箱+密码认证体系
- **账户设置**：修改个人信息（昵称）、修改密码（含密码复杂度校验）
- **工作区管理（管理员）**：
  - 查看所有账户列表
  - 创建新账户
  - 账户升级（添加权限组）
  - 账户降级（移除权限组）
  - 禁用账户

## 🏗️ 技术栈

### 前端（apps/web）
| 类别 | 技术 |
|------|------|
| 框架 | **Next.js 16**（App Router）+ **React 19** |
| UI 组件 | **HeroUI**、**Ant Design 6**、**Headless UI** |
| 样式 | **Tailwind CSS 4** |
| 工作流编辑器 | **@xyflow/react**（React Flow）|
| 代码编辑/对比 | **Monaco Editor** |
| 富文本输入 | **Lexical** |
| 状态管理 | **Zustand** + **Immer** |
| 数据请求 | **TanStack React Query** + **Alova** |
| 图表 | **Ant Design Charts** |
| 工具库 | **ahooks**、**dayjs**、**tailwind-merge** |
| 图标 | **Remix Icon**（@remixicon/react）|

### 后端（apps/server）
| 类别 | 技术 |
|------|------|
| 框架 | **NestJS 11** |
| 数据库 | **MySQL**（TypeORM）|
| 认证 | **JWT**（jsonwebtoken）+ **bcrypt** |
| 数据校验 | **Zod** + **nestjs-zod** |
| Bot 协议 | **@rdjksp/node-napcat-ts** |
| 统计分析 | **simple-statistics** |

### 共享包（apps/shared）
前后端共享的类型定义、Zod Schema 和常量，包括：
- 账户相关类型
- Bot / 适配器相关类型与状态枚举
- 工作流与节点数据结构
- 健康检查数据模型
- 数据传输对象（DTO）

### 基础设施
| 类别 | 技术 |
|------|------|
| 包管理 | **pnpm 10** Workspace（Monorepo）|
| 构建 | Docker 多阶段构建 |
| CI/CD | GitHub Actions（Tag 触发自动构建 Docker 镜像并推送 DockerHub）|
| 代码规范 | ESLint + Prettier + oxlint + sonarjs |
| 测试 | **Vitest**（单元测试 + E2E 测试）|
| 语言 | **TypeScript 5** |

## 📁 项目结构

```
napflow/
├── apps/
│   ├── web/                          # 前端应用（Next.js）
│   │   ├── app/
│   │   │   ├── (auth)/               # 需要登录的路由组
│   │   │   │   └── (commonLayout)/   # 带顶部导航的公共布局
│   │   │   │       ├── bots/         # 机器人管理页面
│   │   │   │       ├── workflows/    # 工作流管理页面
│   │   │   │       ├── health-check/ # 系统健康监控页面
│   │   │   │       └── settings/     # 设置页面（账户/工作区/偏好）
│   │   │   ├── (noauth)/             # 无需登录的路由组
│   │   │   │   └── login/            # 登录页
│   │   │   ├── components/           # 组件库
│   │   │   │   ├── _base/            # 基础通用组件
│   │   │   │   ├── account/          # 登录/认证组件
│   │   │   │   ├── bot/              # 机器人相关组件
│   │   │   │   ├── workflow/         # 工作流编辑器 & 应用管理组件
│   │   │   │   ├── health-check/     # 健康检查仪表盘组件
│   │   │   │   ├── setting/          # 设置相关组件
│   │   │   │   └── common-layout/    # 公共布局组件（导航栏、用户信息）
│   │   │   └── hooks/                # 全局 Hooks
│   │   │       ├── query/            # TanStack Query 数据查询 Hooks
│   │   │       ├── account/          # 账户相关 Hooks
│   │   │       ├── antd-charts/      # 图表配置 Hooks
│   │   │       └── utils/            # 工具 Hooks
│   │   ├── config/                   # 环境变量配置
│   │   └── utils/                    # 工具函数
│   │
│   ├── server/                       # 后端应用（NestJS）
│   │   └── src/
│   │       ├── apps/
│   │       │   ├── account/          # 账户模块（注册/登录/JWT/权限）
│   │       │   ├── workflow/         # 工作流 CRUD 模块
│   │       │   ├── runtime/          # Bot 运行时模块
│   │       │   │   ├── bot/          # Bot 管理/适配器/绑定/健康检查
│   │       │   │   └── core/         # 工作流运行时引擎
│   │       │   ├── health-check/     # 系统健康检查模块
│   │       │   ├── db/               # 数据库模块（TypeORM 实体）
│   │       │   └── app-config/       # 应用配置模块
│   │       ├── decorator/            # 自定义装饰器
│   │       └── utils/                # 后端工具函数
│   │
│   └── shared/                       # 前后端共享包
│       ├── common/                   # 共享类型与枚举
│       │   ├── account/              # 账户类型
│       │   ├── bot/                  # Bot 与适配器类型
│       │   ├── workflow/             # 工作流与节点类型
│       │   └── health-check/         # 健康检查类型
│       └── data-transfer/            # 数据传输对象（DTO）
│
├── .github/workflows/                # CI/CD 配置
├── package.json                      # 根 Monorepo 配置
└── pnpm-workspace.yaml               # pnpm Workspace 配置
```

## 🚀 快速开始

### 环境要求
- **Node.js** >= 22
- **pnpm** >= 10
- **MySQL** 数据库

### 环境变量配置

项目前后端各自通过 `.env` 文件管理环境变量。环境变量文件按以下优先级加载（前面的优先级更高）：

```
.env.{NODE_ENV}.local  →  .env.{NODE_ENV}  →  .env.local  →  .env
```

#### .env 文件清单

| 文件路径 | 用途 | 是否纳入版本控制 |
|----------|------|:----------------:|
| `apps/web/.env` | 前端基础配置 | ✅ 是 |
| `apps/web/.env.development` | 前端开发模式覆盖 | ✅ 是 |
| `apps/web/.env.production` | 前端生产模式覆盖 | ✅ 是 |
| `apps/web/.env*.local` | 前端本地私有覆盖 | ❌ 否（.gitignore） |
| `apps/server/.env` | 后端基础配置 | ✅ 是 |
| `apps/server/.env.development` | 后端开发模式覆盖 | ✅ 是 |
| `apps/server/.env.production` | 后端生产模式覆盖 | ✅ 是 |
| `apps/server/.env.local` | 后端本地私有覆盖（存放数据库密码等敏感信息） | ❌ 否（.gitignore） |

#### 前端环境变量（apps/web）

前端环境变量通过 `process.env.XXX` 读取，其中 `NEXT_PUBLIC_` 前缀的变量会被注入到浏览器端代码中。

| 变量名 | 说明 | 读取位置 | 默认值 | 是否必填 |
|--------|------|----------|--------|----------|
| `SERVER_URL` | 后端服务地址，用于 Next.js rewrites 代理转发 | `next.config.ts` | `http://localhost:8848` | 否 |
| `NEXT_PUBLIC_API_URL` | 前端请求的 API 基础路径。以 `/` 开头时启用 Next.js 代理转发到 `SERVER_URL` | `config/env.ts`、`next.config.ts` | `/api` | 否 |
| `NEXT_PUBLIC_NODE_ENV` | 前端运行环境标识，导出 `isDevelopment` / `isProduction` | `config/env.ts` | 自动取 `$NODE_ENV` | 否 |
| `STRENGTH_PASSWORD_LENGTH` | 前端密码强度校验的最小长度，正整数字符串 | `app/components/_base/constants.ts` | `8` | 否 |

> **说明**：当 `NEXT_PUBLIC_API_URL` 以 `/` 开头时，Next.js 会通过 rewrites 将 `/api/*` 的请求代理转发到 `SERVER_URL`，适用于前后端分离部署时解决跨域问题。如果将 `NEXT_PUBLIC_API_URL` 设置为完整的后端地址（如 `http://localhost:8848`），则前端会直接请求后端，不经过代理。

#### 后端环境变量（apps/server）

后端环境变量由 `AppConfigService`（`src/apps/app-config/app-config.service.ts`）通过 Zod Schema 统一解析校验，启动时如果必填项缺失或格式错误会直接报错退出。

| 变量名 | 说明 | 默认值 | 是否必填 |
|--------|------|--------|----------|
| `HOST_NAME` | 服务监听的主机名 | `localhost` | 否 |
| `PORT` | 服务监听的端口号 | `3000` | 否 |
| `MYSQL_USERNAME` | MySQL 数据库用户名 | — | **是** |
| `MYSQL_PWD` | MySQL 数据库密码 | — | **是** |
| `MYSQL_HOSTPORT` | MySQL 数据库地址（`host:port` 格式） | `localhost:3306` | 否 |
| `MYSQL_DATABASE` | MySQL 数据库名称（不存在时自动创建） | `napflow_db` | 否 |
| `ACC_ROOT_EMAIL` | 初始 Root 管理员邮箱（需符合邮箱格式） | — | **是** |
| `ACC_ROOT_NICKNAME` | 初始 Root 管理员昵称 | — | **是** |
| `ACC_ROOT_PASSWORD` | 初始 Root 管理员密码 | — | **是** |
| `SYNC_ROOT_ACCOUNT_FLAG` | 启用后每次启动同步 Root 账户为当前配置值；未设置时仅在不存在时创建 | 未设置（不启用） | 否 |
| `JWT_SECRET_KEY` | JWT 签名密钥。未设置时每次启动随机生成，重启后已签发 Token 失效 | 随机 32 字节 hex | 否 |

此外，`src/config/env.ts` 还导出了 `NODE_ENV`（默认 `production`）和 `IS_NODE_ENV_PROD` 供内部使用。

#### 最小配置示例

**前端** `apps/web/.env`（通常无需修改，直接使用默认值即可）：

```bash
SERVER_URL=http://localhost:8848
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_NODE_ENV=$NODE_ENV
```

**后端** `apps/server/.env`：

```bash
HOST_NAME=127.0.0.1
PORT=8848
ACC_ROOT_EMAIL=root@napflow.com
ACC_ROOT_NICKNAME=rootUser
ACC_ROOT_PASSWORD=root
```

**后端** `apps/server/.env.local`（存放数据库敏感配置，不纳入版本控制）：

```bash
MYSQL_USERNAME=root
MYSQL_PWD=yourpassword
MYSQL_HOSTPORT=localhost:3306
```

**后端** `apps/server/.env.development`（开发模式下固定 JWT 密钥，防止热重载后 Token 失效）：

```bash
JWT_SECRET_KEY=abcdef123456
```

> **注意**：生产环境建议通过 Docker 环境变量或 `.env.production` 文件注入敏感配置，不要将真实密码提交到版本控制中。各 `.env` 文件中已包含详细的注释说明，可直接查看对应文件了解更多信息。

### 安装依赖

```bash
pnpm install
```

### 开发模式

**启动前端（默认端口 3000）：**
```bash
cd apps/web
pnpm dev
```

**启动后端（默认端口 8848）：**
```bash
cd apps/server
pnpm start:dev
```

### 构建

**前端构建：**
```bash
cd apps/web
pnpm build
```

**后端构建：**
```bash
cd apps/server
pnpm build
```

### Docker 部署

**构建前端镜像：**
```bash
pnpm image:web
```

**构建后端镜像：**
```bash
pnpm image:server
```

### 运行测试

```bash
# 根目录运行所有测试
pnpm test

# 前端单元测试
cd apps/web && pnpm test

# 后端单元测试
cd apps/server && pnpm test

# 后端 E2E 测试
cd apps/server && pnpm test:e2e
```

### 发布指引

项目通过 **Git Tag** 触发 CI/CD 自动构建 Docker 镜像并推送至 DockerHub。提供两种发布方式：

#### 正式发布

基于 `package.json` 中的 `version` 字段创建正式版本标签（如 `v0.1.1`）：

```bash
pnpm release
```

> ⚠️ 发布前请确保 `package.json` 中的 `version` 已更新为目标版本号，且该版本标签尚未存在。

#### 快照发布（Snapshot）

创建带日期和序号的快照版本标签，适用于开发/测试阶段的预发布。标签格式为 `v{version}-snapshot-{YYMMDD}{NN}`：

```bash
pnpm release:snapshot
```

脚本会自动：
1. 读取 `package.json` 中的版本号
2. 拼接当天日期（`YYMMDD` 格式）
3. 统计当天已有的快照标签数量，自动递增序号（两位数，从 `01` 开始）
4. 创建标签并推送到远程仓库

示例（假设版本为 `0.1.1`，日期为 `2026-02-24`）：

| 执行次数 | 生成的 Tag |
|---------|-----------|
| 第 1 次 | `v0.1.1-snapshot-26022401` |
| 第 2 次 | `v0.1.1-snapshot-26022402` |
| 第 3 次 | `v0.1.1-snapshot-26022403` |


