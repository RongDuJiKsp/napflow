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

| 类别 | 技术 |
|------|------|
| 框架 | **NestJS 11** |
| 数据库 | **MySQL**（TypeORM）|
| 认证 | **JWT**（jsonwebtoken）+ **bcrypt** |
| 数据校验 | **Zod** + **nestjs-zod** |
| Bot 协议 | **@rdjksp/node-napcat-ts** |
| 统计分析 | **simple-statistics** |

## 环境变量

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
