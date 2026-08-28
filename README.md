# NapFlow

**NapFlow** 是一个面向业务自动化的工作流编排平台，支持通过可视化节点与流程来设计、执行和管理自动化任务。它集成了 AI Agent 能力，可以通过自然语言对话辅助用户生成和编辑工作流，同时支持将工作流绑定到 QQ 机器人实例上运行。
// 我草 AI 怎么瞎编
// fix：Napflow是节点化的QQ机器人工作流编排平台，支持编写插件和绑定到机器人实例上，理论上支持OneBot协议的QQ机器人都支持，但写完Napflow的适配器就懒得写了

## ✨ 核心功能

### 🔧 可视化工作流编排

- **拖拽式节点编辑器**：基于 ReactFlow 的可视化工作流编辑器，支持节点拖拽、连线、分组等操作
- **丰富的节点类型**：
  - **触发器节点 (Trigger)**：消息触发、定时触发等
  - **逻辑节点 (If)**：条件分支判断
  - **代码执行节点 (Code Eval)**：在沙箱中执行自定义 JavaScript 代码
  - **Dify 访问节点**：调用 Dify AI 平台接口
  - **JSON 取字段节点**：从 JSON 数据中提取指定字段
  - **数组取索引节点**：从数组中按索引读取元素
  - **循环节点 (Loop)**：支持循环执行逻辑
  - **迭代节点 (Iterate)**：支持对数组进行迭代处理
  - **回复节点 (Reply)**：向消息来源发送回复
  - **定时器节点 (Timer)**：延时执行
- **版本管理**：工作流支持多版本发布与回滚
- **Undo/Redo**：编辑器支持撤销与重做操作

### 🤖 AI Agent 辅助

- **自然语言生成工作流**：通过与 AI Agent 对话，自动生成和编辑工作流
- **基于 LangChain/LangGraph**：集成 OpenAI 兼容接口，支持自定义模型端点
- **实时流式响应**：通过 WebSocket 实现流式对话体验
- **会话恢复**：支持断线重连后恢复 Agent 会话上下文
- **RPC 工具调用**：Agent 可通过 RPC 直接操作前端编辑器（添加/删除/连接节点等）

### 🤖 QQ 机器人集成

- **Bot 管理**：创建、配置和管理多个 QQ 机器人实例
- **NapCat WebSocket 适配器**：通过 NapCat 协议连接 QQ 机器人
- **工作流绑定**：将已发布的工作流绑定到 Bot 实例上运行
- **健康监控**：实时监控 Bot 运行状态（任务队列、节点队列等）

### 📊 系统监控

- **服务健康检查**：CPU、内存、事件循环延迟、GC 等指标实时监控
- **Bot 健康监控**：Bot 实例运行状态、任务队列深度等
- **数据看板**：可视化展示系统运行数据

### 👥 账户管理

- **多用户支持**：JWT 认证，支持多用户注册与管理
- **角色权限**：Root 账户管理，用户权限控制
- **安全认证**：密码加密存储（bcrypt），Token 鉴权

## 🏗️ 技术架构

```
┌─────────────────────────────────────────────────────────┐
│                      用户浏览器                          │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                  Proxy (反向代理层)                       │
│          Express + http-proxy-middleware                 │
│       /api/** → Server  |  其他 → Web                   │
│              支持 HTTPS / WebSocket                      │
├─────────────────────────────────────────────────────────┤
│                      端口: 80                            │
└──────────┬──────────────────────────────┬───────────────┘
           │                              │
           ▼                              ▼
┌─────────────────────┐    ┌─────────────────────────────┐
│    Web (前端)        │    │       Server (后端)          │
│    Next.js 16       │    │       NestJS 11              │
│    React 19         │    │       TypeORM + MySQL        │
│    TailwindCSS 4    │    │       Socket.IO              │
│    Zustand          │    │       LangChain/LangGraph    │
│    ReactFlow        │    │       Piscina (Worker Pool)  │
│    端口: 3000       │    │       端口: 8848             │
└─────────────────────┘    └──────────────┬──────────────┘
                                          │
                                          ▼
                           ┌─────────────────────────────┐
                           │         MySQL 8.4            │
                           │         端口: 3306           │
                           └─────────────────────────────┘
```

## 📦 项目结构

```
napflow/
├── apps/
│   ├── proxy/          # 反向代理服务 - Express 网关层
│   ├── server/         # 后端服务 - NestJS API & 运行时
│   ├── shared/         # 共享代码 - 类型定义、DTO、工具函数
│   └── web/            # 前端应用 - Next.js WebUI
├── docker-compose.yml  # Docker 编排配置
├── package.json        # 根 package.json (monorepo)
└── pnpm-workspace.yaml # pnpm 工作区配置
```

## 🚀 快速开始

### 环境要求

- **Node.js** >= 22
- **pnpm** >= 10.20.0
- **MySQL** >= 8.4
- **Docker** & **Docker Compose** (可选，用于容器化部署)

### 开发模式启动

```bash
# 1. 安装依赖
pnpm install

# 2. 配置环境变量
# 分别在 apps/proxy、apps/server、apps/web 中创建 .env.development.local 文件
# 参考各模块的 .env 文件中的注释说明

# 3. 启动各服务（在不同终端中）
cd apps/server && pnpm start:dev    # 后端服务 (端口 8848)
cd apps/web && pnpm start:dev       # 前端服务 (端口 3000)
cd apps/proxy && pnpm start:dev     # 代理服务 (端口 80)
```

### Docker 部署

```bash
# 1. 构建所有镜像
pnpm run image:all

# 2. 创建 .env.local 文件配置环境变量
# 必填项：MYSQL_ROOT_PASSWORD, MYSQL_USER, MYSQL_PASSWORD

# 3. 启动所有服务
pnpm run docker:buildandup

# 停止服务
pnpm run docker:down
```

### 环境变量说明

| 变量名 | 所属服务 | 说明 | 默认值 |
|--------|----------|------|--------|
| `LISTEN_PORT` | Proxy | 代理监听端口 | `80` |
| `WEB_TARGET` | Proxy | Web 服务目标地址 | - |
| `API_TARGET` | Proxy | API 服务目标地址 | - |
| `HOST_NAME` | Server | 服务监听主机 | `localhost` |
| `PORT` | Server | 服务监听端口 | `8848` |
| `MYSQL_USERNAME` | Server | MySQL 用户名 | - |
| `MYSQL_PWD` | Server | MySQL 密码 | - |
| `MYSQL_HOSTPORT` | Server | MySQL 地址 | `localhost:3306` |
| `MYSQL_DATABASE` | Server | 数据库名 | `napflow_db` |
| `ACC_ROOT_EMAIL` | Server | Root 账户邮箱 | - |
| `ACC_ROOT_PASSWORD` | Server | Root 账户密码 | - |
| `JWT_SECRET_KEY` | Server | JWT 签名密钥 | 随机生成 |
| `NEXT_PUBLIC_API_URL` | Web | 前端 API 基础路径 | `/api` |

## 🧪 测试

```bash
# 运行所有测试
pnpm test

# 仅运行单元测试
pnpm test:unit

# 运行 Server 端测试
cd apps/server && pnpm test

# 运行 Web 端 E2E 测试
cd apps/web && pnpm test:e2e
```

## 📋 发布

```bash
# 正式发布（基于 package.json 中的 version）
pnpm run release

# 快照发布（带日期后缀的预发布版本）
pnpm run release:snapshot
```

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Next.js 16 + React 19 |
| UI 组件 | Ant Design 6 + HeroUI + TailwindCSS 4 |
| 状态管理 | Zustand + React Query |
| 工作流编辑器 | @xyflow/react (ReactFlow) |
| 富文本编辑器 | Lexical |
| 代码编辑器 | Monaco Editor |
| 后端框架 | NestJS 11 |
| 数据库 ORM | TypeORM + MySQL 8.4 |
| 实时通信 | Socket.IO |
| AI 集成 | LangChain + LangGraph + OpenAI SDK |
| 工作线程 | Piscina (Worker Pool) |
| 认证 | JWT + bcrypt |
| 代码沙箱 | VM2 |
| 反向代理 | Express + http-proxy-middleware |
| 包管理 | pnpm (Monorepo) |
| 容器化 | Docker + Docker Compose |
| 测试 | Vitest + Playwright + Supertest |
| 代码规范 | ESLint + Prettier + Oxlint |

## 📖 开发指引

各模块的详细开发文档请参阅：

- [**Proxy 模块** - 反向代理服务开发指引](./apps/proxy/README.md)
- [**Server 模块** - 后端服务开发指引](./apps/server/README.md)
- [**Shared 模块** - 共享代码开发指引](./apps/shared/README.md)
- [**Web 模块** - 前端应用开发指引](./apps/web/README.md)

## 📄 License

ISC
