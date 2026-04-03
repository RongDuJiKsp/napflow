import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import type { INestApplication } from '@nestjs/common'
import request from 'supertest'
import type { App } from 'supertest/types'
import { UserRole } from '@shared/common/account/core'
import { Code } from '@shared/data-transfer/_base'
import bcryptjs from 'bcryptjs'
import {
  itAuthLink,
} from './utils/auth'
import { createE2EApp, createTokenFactory } from './utils/nest-init'

/**
 * Account 端点 E2E 测试
 *
 * 覆盖端点:
 *   POST /account/login        - 登录
 *   POST /account/action/create       - 创建账户（注册）
 *   GET  /account/query/cur           - 获取当前用户信息
 *   GET  /account/query/info          - 获取指定用户信息
 *   GET  /account/query/list          - 获取账户列表
 *   POST /account/change/password     - 修改密码
 *   POST /account/change/nickname     - 修改昵称
 *   POST /account/action/upgrade      - 升级用户组
 *   POST /account/action/downgrade    - 降级用户组
 *   POST /account/action/disable      - 禁用账户
 */
describe('AccountController (e2e)', () => {
  let app: INestApplication<App>
  let getAdminToken: () => string
  let getUserToken: () => string

  // ---------- Mock 数据 ----------
  const hashedPassword = bcryptjs.hashSync('password123', 10)

  const mockUserAdmin = {
    email: 'admin@test.com',
    nickname: 'AdminUser',
    password: hashedPassword,
    userGroup: [
      {
        ofUser: 'admin@test.com',
        groupType: UserRole.Admin,
        createdAt: new Date(),
      },
      {
        ofUser: 'admin@test.com',
        groupType: UserRole.User,
        createdAt: new Date(),
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    disabledAt: null,
  }

  const mockUserNormal = {
    email: 'user@test.com',
    nickname: 'NormalUser',
    password: hashedPassword,
    userGroup: [
      {
        ofUser: 'user@test.com',
        groupType: UserRole.User,
        createdAt: new Date(),
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    disabledAt: null,
  }

  const mockUserDisabled = {
    email: 'disabled@test.com',
    nickname: 'DisabledUser',
    password: hashedPassword,
    userGroup: [
      {
        ofUser: 'disabled@test.com',
        groupType: UserRole.User,
        createdAt: new Date(),
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    disabledAt: new Date(),
  }

  const allMockUsers = [mockUserAdmin, mockUserNormal, mockUserDisabled]
  let mutableUsers: typeof allMockUsers = []

  function resetMutableUsers() {
    mutableUsers = allMockUsers.map(user => ({
      ...user,
      userGroup: user.userGroup.map(group => ({ ...group })),
    }))
  }

  // ---------- Mock TypeOrmService ----------
  const mockTypeOrmService = {
    user: {
      findOne: vi.fn().mockImplementation(({ where }: any) => {
        const user = mutableUsers.find(u => u.email === where.email)
        return Promise.resolve(user ?? null)
      }),
      find: vi.fn().mockImplementation((_opts?: any) => {
        return Promise.resolve(mutableUsers)
      }),
      save: vi.fn().mockImplementation((data: any) => {
        const savedUser = {
          ...data,
          userGroup: data.userGroup ?? [
            {
              ofUser: data.email,
              groupType: UserRole.User,
              createdAt: new Date(),
            },
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
          disabledAt: data.disabledAt ?? null,
        }
        const index = mutableUsers.findIndex(
          u => u.email === savedUser.email,
        )
        if (index >= 0) {
          mutableUsers[index] = {
            ...mutableUsers[index],
            ...savedUser,
          }
        }
        else {
          mutableUsers.push(savedUser as any)
        }
        return Promise.resolve(savedUser)
      }),
      update: vi.fn().mockImplementation((where: any, data: any) => {
        const target = mutableUsers.find(u => u.email === where.email)
        if (!target) return Promise.resolve({ affected: 0 })

        Object.assign(target, data, { updatedAt: new Date() })
        return Promise.resolve({ affected: 1 })
      }),
      softDelete: vi.fn().mockImplementation((where: any) => {
        const target = mutableUsers.find(u => u.email === where.email)
        if (!target) return Promise.resolve({ affected: 0 })

        target.disabledAt = new Date()
        target.updatedAt = new Date()
        return Promise.resolve({ affected: 1 })
      }),
    },
    userGroup: {
      find: vi.fn().mockImplementation((_opts?: any) => {
        return Promise.resolve([
          { ofUser: 'admin@test.com', groupType: UserRole.Admin },
          { ofUser: 'admin@test.com', groupType: UserRole.User },
        ])
      }),
      save: vi.fn().mockImplementation((data: any) => {
        const items = Array.isArray(data) ? data : [data]
        return Promise.resolve(items)
      }),
      delete: vi.fn().mockImplementation((_where: any) => {
        return Promise.resolve({ affected: 1 })
      }),
    },
  }

  // ---------- 测试生命周期 ----------
  beforeAll(async () => {
    const ctx = await createE2EApp(mockTypeOrmService)
    app = ctx.app

    const tokenFactory = createTokenFactory(ctx.jwtService)
    getAdminToken = () =>
      tokenFactory.getAdminToken({
        email: mockUserAdmin.email,
        nickname: mockUserAdmin.nickname,
      })
    getUserToken = () =>
      tokenFactory.getUserToken({
        email: mockUserNormal.email,
        nickname: mockUserNormal.nickname,
      })
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    resetMutableUsers()
  })

  // =====================================================================
  // POST /account/login
  // =====================================================================
  describe('POST /account/login', () => {
    it('应该用正确的邮箱和密码成功登录，返回 token', async () => {
      const res = await request(app.getHttpServer())
        .post('/account/login')
        .send({ email: 'admin@test.com', password: 'password123' })

      expect(res.body.statusCode).toBe(Code.Ok)
      expect(res.body.data).toHaveProperty('token')
      expect(typeof res.body.data.token).toBe('string')
    })

    it('应该在邮箱不存在时返回错误', async () => {
      const res = await request(app.getHttpServer())
        .post('/account/login')
        .send({ email: 'nonexist@test.com', password: 'password123' })

      expect(res.body.statusCode).toBe(Code.NotFound)
      expect(res.body.message).toContain('用户不存在或密码错误')
    })

    it('应该在密码错误时返回错误', async () => {
      const res = await request(app.getHttpServer())
        .post('/account/login')
        .send({ email: 'admin@test.com', password: 'wrongpassword' })

      expect(res.body.statusCode).toBe(Code.NotFound)
      expect(res.body.message).toContain('用户不存在或密码错误')
    })

    it('应该在用户被禁用时返回错误', async () => {
      const res = await request(app.getHttpServer())
        .post('/account/login')
        .send({ email: 'disabled@test.com', password: 'password123' })

      expect(res.body.statusCode).toBe(Code.Forbidden)
      expect(res.body.message).toContain('用户已被禁用')
    })

    it('应该在缺少必填字段时返回错误', async () => {
      const res = await request(app.getHttpServer())
        .post('/account/login')
        .send({ email: 'admin@test.com' })

      // Zod 校验会拦截缺少 password 的请求
      expect(res.status).not.toBe(200)
    })

    it('应该在邮箱格式无效时返回错误', async () => {
      const res = await request(app.getHttpServer())
        .post('/account/login')
        .send({ email: 'not-an-email', password: 'password123' })

      expect(res.status).not.toBe(200)
    })
  })

  // =====================================================================
  // POST /account/action/create（注册/创建账户）
  // =====================================================================
  describe('POST /account/action/create', () => {
    it('Admin 应该能成功创建新账户', async () => {
      // 模拟用户不存在（createBlankAccount 内部先 getAccount）
      mockTypeOrmService.user.findOne.mockResolvedValueOnce(null)

      const res = await request(app.getHttpServer())
        .post('/account/action/create')
        .set('Authorization', `Bearer ${getAdminToken()}`)
        .send({
          email: 'newuser@test.com',
          nickname: 'NewUser',
          password: 'newpassword123',
        })

      expect(res.body.statusCode).toBe(Code.Ok)
    })

    it('Admin 创建已存在的账户时应返回错误', async () => {
      // findOne 返回已存在用户 -> createBlankAccount 抛出 AccountError
      const res = await request(app.getHttpServer())
        .post('/account/action/create')
        .set('Authorization', `Bearer ${getAdminToken()}`)
        .send({
          email: 'admin@test.com',
          nickname: 'AdminUser',
          password: 'password123',
        })

      // AccountError 被 AccountExceptionFilter 捕获，返回 400
      expect(res.status).toBe(400)
    })

    it('普通用户不应该能创建账户', async () => {
      const res = await request(app.getHttpServer())
        .post('/account/action/create')
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({
          email: 'another@test.com',
          nickname: 'AnotherUser',
          password: 'password123',
        })

      expect(res.status).toBe(403)
    })

    itAuthLink('未认证用户不应该能创建账户', agent =>
      agent
        .post('/account/action/create')
        .send({
          email: 'another@test.com',
          nickname: 'AnotherUser',
          password: 'password123',
        }),
    app,
    )

    it('应该在缺少必填字段时返回错误', async () => {
      const res = await request(app.getHttpServer())
        .post('/account/action/create')
        .set('Authorization', `Bearer ${getAdminToken()}`)
        .send({
          email: 'newuser@test.com',
          // 缺少 nickname 和 password
        })

      expect(res.status).not.toBe(200)
    })
  })

  // =====================================================================
  // GET /account/query/cur
  // =====================================================================
  describe('GET /account/query/cur', () => {
    it('已认证用户应该能获取自己的信息', async () => {
      const res = await request(app.getHttpServer())
        .get('/account/query/cur')
        .set('Authorization', `Bearer ${getAdminToken()}`)

      expect(res.body.statusCode).toBe(Code.Ok)
      expect(res.body.data).toHaveProperty('email', mockUserAdmin.email)
      expect(res.body.data).toHaveProperty('nickname', mockUserAdmin.nickname)
    })

    it('普通用户也应该能获取自己的信息', async () => {
      const res = await request(app.getHttpServer())
        .get('/account/query/cur')
        .set('Authorization', `Bearer ${getUserToken()}`)

      expect(res.body.statusCode).toBe(Code.Ok)
      expect(res.body.data).toHaveProperty('email', mockUserNormal.email)
    })

    itAuthLink('未认证用户应返回 401', agent =>
      agent.get('/account/query/cur'),
    app,
    )

  })

  // =====================================================================
  // GET /account/query/info
  // =====================================================================
  describe('GET /account/query/info', () => {
    it('已认证用户应该能获取指定用户信息', async () => {
      const res = await request(app.getHttpServer())
        .get('/account/query/info')
        .query({ email: 'user@test.com' })
        .set('Authorization', `Bearer ${getUserToken()}`)

      expect(res.body.statusCode).toBe(Code.Ok)
      expect(res.body.data).toHaveProperty('email', mockUserNormal.email)
    })

    it('查询不存在的用户应返回 data 为 null', async () => {
      mockTypeOrmService.user.findOne.mockResolvedValueOnce(null)

      const res = await request(app.getHttpServer())
        .get('/account/query/info')
        .query({ email: 'nonexist@test.com' })
        .set('Authorization', `Bearer ${getUserToken()}`)

      expect(res.body.statusCode).toBe(Code.Ok)
      expect(res.body.data).toBeNull()
    })

    itAuthLink('未认证用户应返回 401', agent =>
      agent
        .get('/account/query/info')
        .query({ email: 'user@test.com' }),
    app,
    )
  })

  // =====================================================================
  // GET /account/query/list（账户列表）
  // =====================================================================
  describe('GET /account/query/list', () => {
    it('已认证用户应该能获取账户列表', async () => {
      const res = await request(app.getHttpServer())
        .get('/account/query/list')
        .set('Authorization', `Bearer ${getUserToken()}`)

      expect(res.body.statusCode).toBe(Code.Ok)
      expect(Array.isArray(res.body.data)).toBe(true)
    })

    it('应支持 isDisabled 查询参数', async () => {
      const res = await request(app.getHttpServer())
        .get('/account/query/list')
        .query({ isDisabled: 'true' })
        .set('Authorization', `Bearer ${getUserToken()}`)

      expect(res.body.statusCode).toBe(Code.Ok)
    })

    it('应支持 roles 查询参数', async () => {
      const res = await request(app.getHttpServer())
        .get('/account/query/list')
        .query({ roles: [UserRole.Admin] })
        .set('Authorization', `Bearer ${getAdminToken()}`)

      expect(res.body.statusCode).toBe(Code.Ok)
    })

    itAuthLink('未认证用户应返回 401', agent =>
      agent.get('/account/query/list'),
    app,
    )
  })

  // =====================================================================
  // POST /account/change/password
  // =====================================================================
  describe('POST /account/change/password', () => {
    it('已认证用户应该能用正确的原密码修改密码', async () => {
      const res = await request(app.getHttpServer())
        .post('/account/change/password')
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({
          originPassword: 'password123',
          password: 'newPassword456',
        })

      expect(res.body.statusCode).toBe(Code.Ok)
    })

    it('原密码错误时应返回错误', async () => {
      const res = await request(app.getHttpServer())
        .post('/account/change/password')
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({
          originPassword: 'wrongOldPassword',
          password: 'newPassword456',
        })

      expect(res.body.statusCode).toBe(Code.Forbidden)
      expect(res.body.message).toContain('原密码错误')
    })

    itAuthLink('未认证用户应返回 401', agent =>
      agent
        .post('/account/change/password')
        .send({
          originPassword: 'password123',
          password: 'newPassword456',
        }),
    app,
    )

    it('缺少必填字段时应返回错误', async () => {
      const res = await request(app.getHttpServer())
        .post('/account/change/password')
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({
          originPassword: 'password123',
          // 缺少 password
        })

      expect(res.status).not.toBe(200)
    })
  })

  // =====================================================================
  // POST /account/change/nickname
  // =====================================================================
  describe('POST /account/change/nickname', () => {
    it('已认证用户应该能修改昵称', async () => {
      const res = await request(app.getHttpServer())
        .post('/account/change/nickname')
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ nickname: 'NewNickname' })

      expect(res.body.statusCode).toBe(Code.Ok)
    })

    itAuthLink('未认证用户应返回 401', agent =>
      agent
        .post('/account/change/nickname')
        .send({ nickname: 'NewNickname' }),
    app,
    )

    it('缺少 nickname 字段时应返回错误', async () => {
      const res = await request(app.getHttpServer())
        .post('/account/change/nickname')
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({})

      expect(res.status).not.toBe(200)
    })
  })

  // =====================================================================
  // POST /account/action/upgrade
  // =====================================================================
  describe('POST /account/action/upgrade', () => {
    it('Admin 应该能升级用户组', async () => {
      const res = await request(app.getHttpServer())
        .post('/account/action/upgrade')
        .set('Authorization', `Bearer ${getAdminToken()}`)
        .send({
          email: 'user@test.com',
          groupType: [UserRole.Admin],
        })

      expect(res.body.statusCode).toBe(Code.Ok)
      expect(res.body.data).toHaveProperty('effectLines')
    })

    it('不能升级为 User 组', async () => {
      const res = await request(app.getHttpServer())
        .post('/account/action/upgrade')
        .set('Authorization', `Bearer ${getAdminToken()}`)
        .send({
          email: 'user@test.com',
          groupType: [UserRole.User],
        })

      expect(res.body.statusCode).toBe(Code.Forbidden)
      expect(res.body.message).toContain('不能对User组进行升降级')
    })

    it('普通用户不应该能升级用户组', async () => {
      const res = await request(app.getHttpServer())
        .post('/account/action/upgrade')
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({
          email: 'user@test.com',
          groupType: [UserRole.Admin],
        })

      expect(res.status).toBe(403)
    })

    itAuthLink('未认证用户应返回 401', agent =>
      agent
        .post('/account/action/upgrade')
        .send({
          email: 'user@test.com',
          groupType: [UserRole.Admin],
        }),
    app,
    )

    it('save 返回空数组时应返回错误', async () => {
      mockTypeOrmService.userGroup.save.mockResolvedValueOnce([])

      const res = await request(app.getHttpServer())
        .post('/account/action/upgrade')
        .set('Authorization', `Bearer ${getAdminToken()}`)
        .send({
          email: 'user@test.com',
          groupType: [UserRole.Admin],
        })

      expect(res.body.message).toContain('不存在满足条件的组')
    })
  })

  // =====================================================================
  // POST /account/action/downgrade
  // =====================================================================
  describe('POST /account/action/downgrade', () => {
    it('Admin 应该能降级用户组', async () => {
      const res = await request(app.getHttpServer())
        .post('/account/action/downgrade')
        .set('Authorization', `Bearer ${getAdminToken()}`)
        .send({
          email: 'user@test.com',
          groupType: [UserRole.Admin],
        })

      expect(res.body.statusCode).toBe(Code.Ok)
      expect(res.body.data).toHaveProperty('effectLines')
    })

    it('不能降级 User 组', async () => {
      const res = await request(app.getHttpServer())
        .post('/account/action/downgrade')
        .set('Authorization', `Bearer ${getAdminToken()}`)
        .send({
          email: 'user@test.com',
          groupType: [UserRole.User],
        })

      expect(res.body.statusCode).toBe(Code.Forbidden)
      expect(res.body.message).toContain('不能对User组进行升降级')
    })

    it('delete affected 为 0 时应返回错误', async () => {
      mockTypeOrmService.userGroup.delete.mockResolvedValueOnce({
        affected: 0,
      })

      const res = await request(app.getHttpServer())
        .post('/account/action/downgrade')
        .set('Authorization', `Bearer ${getAdminToken()}`)
        .send({
          email: 'user@test.com',
          groupType: [UserRole.Admin],
        })

      expect(res.body.message).toContain('不存在满足条件的组')
    })

    it('普通用户不应该能降级用户组', async () => {
      const res = await request(app.getHttpServer())
        .post('/account/action/downgrade')
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({
          email: 'admin@test.com',
          groupType: [UserRole.Admin],
        })

      expect(res.status).toBe(403)
    })

    itAuthLink('未认证用户应返回 401', agent =>
      agent
        .post('/account/action/downgrade')
        .send({
          email: 'admin@test.com',
          groupType: [UserRole.Admin],
        }),
    app,
    )

    it('降级最后一个管理员时应返回错误', async () => {
      mockTypeOrmService.userGroup.find.mockResolvedValueOnce([
        { ofUser: 'admin@test.com' },
      ])

      const res = await request(app.getHttpServer())
        .post('/account/action/downgrade')
        .set('Authorization', `Bearer ${getAdminToken()}`)
        .send({
          email: 'admin@test.com',
          groupType: [UserRole.Admin],
        })

      expect(res.status).toBe(400)
      expect(res.body.message).toContain('不能降级最后一个管理员')
    })
  })

  // =====================================================================
  // POST /account/action/disable
  // =====================================================================
  describe('POST /account/action/disable', () => {
    it('Admin 应该能禁用指定账户', async () => {
      const res = await request(app.getHttpServer())
        .post('/account/action/disable')
        .set('Authorization', `Bearer ${getAdminToken()}`)
        .send({ email: 'user@test.com' })

      expect(res.body.statusCode).toBe(Code.Ok)
    })

    it('禁用不存在的用户时应返回错误', async () => {
      mockTypeOrmService.user.softDelete.mockResolvedValueOnce({ affected: 0 })

      const res = await request(app.getHttpServer())
        .post('/account/action/disable')
        .set('Authorization', `Bearer ${getAdminToken()}`)
        .send({ email: 'nonexist@test.com' })

      expect(res.body.message).toContain('不存在满足条件的用户')
    })

    it('普通用户不应该能禁用账户', async () => {
      const res = await request(app.getHttpServer())
        .post('/account/action/disable')
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ email: 'user@test.com' })

      expect(res.status).toBe(403)
    })

    itAuthLink('未认证用户应返回 401', agent =>
      agent
        .post('/account/action/disable')
        .send({ email: 'user@test.com' }),
    app,
    )
  })

  // =====================================================================
  // 联动场景 - 创建 / 查询 / 禁用 / 登录校验
  // =====================================================================
  describe('Account 联动请求场景', () => {
    it('create -> query/info -> disable -> login 应体现禁用后的登录限制', async () => {
      const email = 'linked-user@test.com'
      const password = 'linkedPassword123'

      // 1. 创建账户
      mockTypeOrmService.user.findOne.mockResolvedValueOnce(null)
      const createRes = await request(app.getHttpServer())
        .post('/account/action/create')
        .set('Authorization', `Bearer ${getAdminToken()}`)
        .send({
          email,
          nickname: 'LinkedUser',
          password,
        })
      expect(createRes.body.statusCode).toBe(Code.Ok)

      // 2. 创建后可查询到账户信息
      const infoRes = await request(app.getHttpServer())
        .get('/account/query/info')
        .query({ email })
        .set('Authorization', `Bearer ${getAdminToken()}`)
      expect(infoRes.body.statusCode).toBe(Code.Ok)
      expect(infoRes.body.data).toHaveProperty('email', email)

      // 3. 禁用账户
      const disableRes = await request(app.getHttpServer())
        .post('/account/action/disable')
        .set('Authorization', `Bearer ${getAdminToken()}`)
        .send({ email })
      expect(disableRes.body.statusCode).toBe(Code.Ok)

      // 4. 禁用后登录应被拒绝
      const loginRes = await request(app.getHttpServer())
        .post('/account/login')
        .send({ email, password })

      expect(loginRes.body.statusCode).toBe(Code.Forbidden)
      expect(loginRes.body.message).toContain('用户已被禁用')
    })

    it('login -> disable -> query/cur(旧token) 应体现当前 token 可用性行为', async () => {
      // 1. 先登录获得用户 token
      const loginRes = await request(app.getHttpServer())
        .post('/account/login')
        .send({ email: 'user@test.com', password: 'password123' })
      expect(loginRes.body.statusCode).toBe(Code.Ok)
      const oldToken = loginRes.body.data.token as string
      expect(oldToken).toBeTruthy()

      // 2. 管理员禁用该用户
      const disableRes = await request(app.getHttpServer())
        .post('/account/action/disable')
        .set('Authorization', `Bearer ${getAdminToken()}`)
        .send({ email: 'user@test.com' })
      expect(disableRes.body.statusCode).toBe(Code.Ok)

      // 3. 使用禁用前签发的 token 访问受保护接口
      const curAccountRes = await request(app.getHttpServer())
        .get('/account/query/cur')
        .set('Authorization', `Bearer ${oldToken}`)

      // 当前实现下，guard 仅校验 token 角色，不校验 disabledAt
      expect(curAccountRes.body.statusCode).toBe(Code.Ok)
      expect(curAccountRes.body.data).toHaveProperty('email', 'user@test.com')
    })

    it('login(old) -> change-password -> login(old fail) -> login(new ok)', async () => {
      const email = 'user@test.com'
      const oldPassword = 'password123'
      const newPassword = 'newPassword789'

      // 1. 旧密码可登录
      const oldLogin = await request(app.getHttpServer())
        .post('/account/login')
        .send({ email, password: oldPassword })
      expect(oldLogin.body.statusCode).toBe(Code.Ok)

      // 2. 使用旧密码鉴权，修改为新密码
      const changeRes = await request(app.getHttpServer())
        .post('/account/change/password')
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ originPassword: oldPassword, password: newPassword })
      expect(changeRes.body.statusCode).toBe(Code.Ok)

      // 3. 旧密码登录失败
      const oldLoginAfterChange = await request(app.getHttpServer())
        .post('/account/login')
        .send({ email, password: oldPassword })
      expect(oldLoginAfterChange.body.statusCode).toBe(Code.NotFound)

      // 4. 新密码登录成功
      const newLogin = await request(app.getHttpServer())
        .post('/account/login')
        .send({ email, password: newPassword })
      expect(newLogin.body.statusCode).toBe(Code.Ok)
      expect(newLogin.body.data).toHaveProperty('token')
    })
  })
})
