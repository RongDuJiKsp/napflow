<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

NapFlow 后端服务（NestJS），提供账户、工作流、运行时、健康检查等核心 API 能力。

## 技术栈

| 类别     | 技术                                |
| -------- | ----------------------------------- |
| 框架     | **NestJS 11**                       |
| 数据库   | **MySQL**（TypeORM）                |
| 认证     | **JWT**（jsonwebtoken）+ **bcrypt** |
| 数据校验 | **Zod** + **nestjs-zod**            |
| Bot 协议 | **@rdjksp/node-napcat-ts**          |
| 统计分析 | **simple-statistics**               |

## 数据库

项目使用 **MySQL** 数据库，通过 **TypeORM**（`synchronize: true`）自动同步实体至数据库表，启动时若数据库不存在会自动创建。

### 数据库表概览

| 表名                | 对应实体                | 描述                                                             |
| ------------------- | ----------------------- | ---------------------------------------------------------------- |
| `users`             | `UserEntity`            | 用户账户表，存储系统用户基本信息                                 |
| `user_groups`       | `UserGroupEntity`       | 用户角色分组表，记录用户的角色归属                               |
| `apps`              | `WorkflowAppEntity`     | 工作流应用表，存储工作流应用元信息                               |
| `app_datas`         | `WorkflowAppDataEntity` | 工作流应用数据表，存储工作流的版本化数据（节点、边、环境变量等） |
| `bot_record_entity` | `BotRecordEntity`       | 机器人记录表，存储已配置的机器人 endpoint 信息                   |

### 表结构详情

#### `users` — 用户账户表

| 列名         | 类型       | 约束                    | 描述                 |
| ------------ | ---------- | ----------------------- | -------------------- |
| `email`      | `varchar`  | **PK**，NOT NULL        | 用户邮箱（主键）     |
| `nickname`   | `varchar`  | NOT NULL                | 用户昵称             |
| `password`   | `varchar`  | NOT NULL                | 用户密码（加密存储） |
| `createdAt`  | `datetime` | NOT NULL，自动生成      | 创建时间             |
| `updatedAt`  | `datetime` | NOT NULL，自动更新      | 更新时间             |
| `disabledAt` | `datetime` | 可为 NULL（软删除标记） | 禁用/删除时间        |

**关系**：一对多关联 `user_groups`（`cascade: true`）

---

#### `user_groups` — 用户角色分组表

| 列名        | 类型                    | 约束                         | 描述                                            |
| ----------- | ----------------------- | ---------------------------- | ----------------------------------------------- |
| `ofUser`    | `varchar`               | **PK**（联合主键），NOT NULL | 所属用户邮箱                                    |
| `groupType` | `enum('Admin', 'User')` | **PK**（联合主键），NOT NULL | 角色类型（`Admin` = 管理员，`User` = 普通用户） |
| `createdAt` | `datetime`              | NOT NULL，自动生成           | 创建时间                                        |

**外键约束**：`ofUser` → `users.email`（多对一关联 `users` 表）

---

#### `apps` — 工作流应用表

| 列名             | 类型       | 约束                  | 描述         |
| ---------------- | ---------- | --------------------- | ------------ |
| `appId`          | `varchar`  | **PK**，自动生成 UUID | 应用唯一标识 |
| `appName`        | `varchar`  | NOT NULL              | 应用名称     |
| `appDescription` | `varchar`  | NOT NULL              | 应用描述     |
| `createdAt`      | `datetime` | NOT NULL，自动生成    | 创建时间     |
| `createdBy`      | `varchar`  | NOT NULL              | 创建者       |

**关系**：一对多关联 `app_datas`

---

#### `app_datas` — 工作流应用数据表

| 列名                 | 类型       | 约束                         | 描述                        |
| -------------------- | ---------- | ---------------------------- | --------------------------- |
| `version`            | `varchar`  | **PK**（联合主键），NOT NULL | 版本号                      |
| `ofAppId`            | `varchar`  | **PK**（联合主键），NOT NULL | 所属应用 ID                 |
| `publishDescription` | `varchar`  | 可为 NULL，默认 NULL         | 发布描述                    |
| `publishAt`          | `datetime` | 可为 NULL，默认 NULL         | 发布时间                    |
| `publishBy`          | `varchar`  | 可为 NULL，默认 NULL         | 发布者                      |
| `lastUpdateAt`       | `datetime` | NOT NULL，自动更新           | 最后更新时间                |
| `nodes`              | `json`     | 可为 NULL，默认 NULL         | 工作流节点数据（JSON 数组） |
| `edges`              | `json`     | 可为 NULL，默认 NULL         | 工作流边数据（JSON 数组）   |
| `envs`               | `json`     | 可为 NULL，默认 NULL         | 环境变量数据（JSON 数组）   |

**外键约束**：`ofAppId` → `apps.appId`（多对一关联 `apps` 表，**级联删除**：删除应用时自动删除其所有版本数据）

---

#### `bot_record_entity` — 机器人记录表

| 列名                  | 类型        | 约束                  | 描述                                       |
| --------------------- | ----------- | --------------------- | ------------------------------------------ |
| `botId`               | `varchar`   | **PK**，自动生成 UUID | 记录唯一标识                               |
| `name`                | `varchar`   | NOT NULL              | 机器人名称                                 |
| `description`         | `varchar`   | NOT NULL              | 机器人描述                                 |
| `commonAdapterConfig` | `json`      | NOT NULL              | 通用适配器配置（含自动启动、绑定工作流等） |
| `adapterTag`          | `enum('0')` | NOT NULL              | 适配器标签（目前仅 `napcatWs = 0`）        |
| `adapterConfig`       | `json`      | NOT NULL              | 适配器专用配置                             |
| `createdAt`           | `datetime`  | NOT NULL，自动生成    | 创建时间                                   |
| `createdBy`           | `varchar`   | NOT NULL              | 创建者                                     |

**关系**：无外键约束

---

### ER 关系图

```mermaid
erDiagram
    users ||--o{ user_groups : "一对多"
    apps ||--o{ app_datas : "一对多"

    users {
        varchar email PK
        varchar nickname
        varchar password
        datetime createdAt
        datetime updatedAt
        datetime disabledAt
    }

    user_groups {
        varchar ofUser PK-FK
        enum groupType PK
        datetime createdAt
    }

    apps {
        varchar appId PK
        varchar appName
        varchar appDescription
        datetime createdAt
        varchar createdBy
    }

    app_datas {
        varchar version PK
        varchar ofAppId PK-FK
        varchar publishDescription
        datetime publishAt
        varchar publishBy
        datetime lastUpdateAt
        json nodes
        json edges
        json envs
    }

    bot_record_entity {
        varchar botId PK
        varchar name
        varchar description
        json commonAdapterConfig
        enum adapterTag
        json adapterConfig
        datetime createdAt
        varchar createdBy
    }
```

## 环境变量

后端环境变量由 `AppConfigService`（`src/apps/app-config/app-config.service.ts`）通过 Zod Schema 统一解析校验，启动时如果必填项缺失或格式错误会直接报错退出。

| 变量名                   | 说明                                                               | 默认值           | 是否必填 |
| ------------------------ | ------------------------------------------------------------------ | ---------------- | -------- |
| `HOST_NAME`              | 服务监听的主机名                                                   | `localhost`      | 否       |
| `PORT`                   | 服务监听的端口号                                                   | `3000`           | 否       |
| `MYSQL_USERNAME`         | MySQL 数据库用户名                                                 | —                | **是**   |
| `MYSQL_PWD`              | MySQL 数据库密码                                                   | —                | **是**   |
| `MYSQL_HOSTPORT`         | MySQL 数据库地址（`host:port` 格式）                               | `localhost:3306` | 否       |
| `MYSQL_DATABASE`         | MySQL 数据库名称（不存在时自动创建）                               | `napflow_db`     | 否       |
| `ACC_ROOT_EMAIL`         | 初始 Root 管理员邮箱（需符合邮箱格式）                             | —                | **是**   |
| `ACC_ROOT_NICKNAME`      | 初始 Root 管理员昵称                                               | —                | **是**   |
| `ACC_ROOT_PASSWORD`      | 初始 Root 管理员密码                                               | —                | **是**   |
| `SYNC_ROOT_ACCOUNT_FLAG` | 启用后每次启动同步 Root 账户为当前配置值；未设置时仅在不存在时创建 | 未设置（不启用） | 否       |
| `JWT_SECRET_KEY`         | JWT 签名密钥。未设置时每次启动随机生成，重启后已签发 Token 失效    | 随机 32 字节 hex | 否       |

此外，`src/config/env.ts` 还导出了 `NODE_ENV`（默认 `production`）和 `IS_NODE_ENV_PROD` 供内部使用。

### 最小配置示例

**`apps/server/.env`**：

```bash
HOST_NAME=127.0.0.1
PORT=8848
ACC_ROOT_EMAIL=root@napflow.com
ACC_ROOT_NICKNAME=rootUser
ACC_ROOT_PASSWORD=root
```

**`apps/server/.env.local`**（存放数据库敏感配置，不纳入版本控制）：

```bash
MYSQL_USERNAME=root
MYSQL_PWD=yourpassword
MYSQL_HOSTPORT=localhost:3306
```

**`apps/server/.env.development`**（开发模式下固定 JWT 密钥，防止热重载后 Token 失效）：

```bash
JWT_SECRET_KEY=abcdef123456
```

> **注意**：生产环境建议通过 Docker 环境变量或 `.env.production` 文件注入敏感配置，不要将真实密码提交到版本控制中。各 `.env` 文件中已包含详细的注释说明，可直接查看对应文件了解更多信息。

## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
