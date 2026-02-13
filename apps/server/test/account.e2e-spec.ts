import 'reflect-metadata'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import type { INestApplication } from '@nestjs/common'
import request from 'supertest'
import type { App } from 'supertest/types'
import { AppModule } from './../src/app.module'
import { TypeOrmService } from './../src/apps/db/typeorm.service'
import { JwtService } from './../src/apps/account/jwt.service'
import { UserRole } from '@shared/common/account/base'
import { Code } from '@shared/data-transfer/_base'
import bcryptjs from 'bcryptjs'

/**
 * Account 端点 E2E 测试
 *
 * 覆盖端点:
 *   POST /account/login        - 登录
 *   POST /account/create       - 创建账户（注册）
 *   GET  /account/cur-account  - 获取当前用户信息
 *   GET  /account/account-info - 获取指定用户信息
 *   GET  /account/account      - 获取账户列表
 *   POST /account/change-password  - 修改密码
 *   POST /account/change-nickname  - 修改昵称
 *   POST /account/upgrade      - 升级用户组
 *   POST /account/downgrade    - 降级用户组
 *   POST /account/disable      - 禁用账户
 */
describe('AccountController (e2e)', () => {
  let app: INestApplication<App>
  let jwtService: JwtService

  // ---------- Mock 数据 ----------
  const hashedPassword = bcryptjs.hashSync('password123', 10)

  const mockUserAdmin = {
    email: 'admin@test.com',
    nickname: 'AdminUser',
    password: hashedPassword,
    userGroup: [
      { ofUser: 'admin@test.com', groupType: UserRole.Admin, createdAt: new Date() },
      { ofUser: 'admin@test.com', groupType: UserRole.User, createdAt: new Date() },
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
      { ofUser: 'user@test.com', groupType: UserRole.User, createdAt: new Date() },
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
      { ofUser: 'disabled@test.com', groupType: UserRole.User, createdAt: new Date() },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    disabledAt: new Date(),
  }

  const allMockUsers = [mockUserAdmin, mockUserNormal, mockUserDisabled]

  // ---------- Mock TypeOrmService ----------
  const mockTypeOrmService = {
    user: {
      findOne: vi.fn().mockImplementation(({ where }: any) => {
        const user = allMockUsers.find(u => u.email === where.email)
        return Promise.resolve(user ?? null)
      }),
      find: vi.fn().mockImplementation((_opts?: any) => {
        return Promise.resolve(allMockUsers)
      }),
      save: vi.fn().mockImplementation((data: any) => {
        return Promise.resolve({ ...data, createdAt: new Date(), updatedAt: new Date() })
      }),
      update: vi.fn().mockImplementation((_where: any, _data: any) => {
        return Promise.resolve({ affected: 1 })
      }),
      softDelete: vi.fn().mockImplementation((_where: any) => {
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

  // ---------- Token 辅助方法 ----------
  function getAdminToken(): string {
    return jwtService.account.jwtSign({
      email: mockUserAdmin.email,
      nickname: mockUserAdmin.nickname,
      userGroup: mockUserAdmin.userGroup.map(g => ({ groupType: g.groupType })),
    })
  }

  function getUserToken(): string {
    return jwtService.account.jwtSign({
      email: mockUserNormal.email,
      nickname: mockUserNormal.nickname,
      userGroup: mockUserNormal.userGroup.map(g => ({ groupType: g.groupType })),
    })
  }

  // ---------- 测试生命周期 ----------
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(TypeOrmService)
      .useValue(mockTypeOrmService)
      .compile()

    app = moduleFixture.createNestApplication()
    await app.init()

    jwtService = moduleFixture.get<JwtService>(JwtService)
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    vi.clearAllMocks()
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

      expect(res.body.statusCode).toBe(Code.NotFound)
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
  // POST /account/create（注册/创建账户）
  // =====================================================================
  describe('POST /account/create', () => {
    it('Admin 应该能成功创建新账户', async () => {
      // 模拟用户不存在（createBlankAccount 内部先 getAccount）
      mockTypeOrmService.user.findOne.mockResolvedValueOnce(null)

      const res = await request(app.getHttpServer())
        .post('/account/create')
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
        .post('/account/create')
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
        .post('/account/create')
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({
          email: 'another@test.com',
          nickname: 'AnotherUser',
          password: 'password123',
        })

      // Guard 拦截，返回 403
      expect(res.status).toBe(403)
    })

    it('未认证用户不应该能创建账户', async () => {
      const res = await request(app.getHttpServer())
        .post('/account/create')
        .send({
          email: 'another@test.com',
          nickname: 'AnotherUser',
          password: 'password123',
        })

      expect(res.status).toBe(401)
    })

    it('应该在缺少必填字段时返回错误', async () => {
      const res = await request(app.getHttpServer())
        .post('/account/create')
        .set('Authorization', `Bearer ${getAdminToken()}`)
        .send({
          email: 'newuser@test.com',
          // 缺少 nickname 和 password
        })

      expect(res.status).not.toBe(200)
    })
  })

  // =====================================================================
  // GET /account/cur-account
  // =====================================================================
  describe('GET /account/cur-account', () => {
    it('已认证用户应该能获取自己的信息', async () => {
      const res = await request(app.getHttpServer())
        .get('/account/cur-account')
        .set('Authorization', `Bearer ${getAdminToken()}`)

      expect(res.body.statusCode).toBe(Code.Ok)
      expect(res.body.data).toHaveProperty('email', mockUserAdmin.email)
      expect(res.body.data).toHaveProperty('nickname', mockUserAdmin.nickname)
    })

    it('普通用户也应该能获取自己的信息', async () => {
      const res = await request(app.getHttpServer())
        .get('/account/cur-account')
        .set('Authorization', `Bearer ${getUserToken()}`)

      expect(res.body.statusCode).toBe(Code.Ok)
      expect(res.body.data).toHaveProperty('email', mockUserNormal.email)
    })

    it('未认证用户应返回 401', async () => {
      const res = await request(app.getHttpServer())
        .get('/account/cur-account')

      expect(res.status).toBe(401)
    })

    it('使用无效 token 应返回 401', async () => {
      const res = await request(app.getHttpServer())
        .get('/account/cur-account')
        .set('Authorization', 'Bearer invalid.jwt.token')

      expect(res.status).toBe(401)
    })
  })

  // =====================================================================
  // GET /account/account-info
  // =====================================================================
  describe('GET /account/account-info', () => {
    it('已认证用户应该能获取指定用户信息', async () => {
      const res = await request(app.getHttpServer())
        .get('/account/account-info')
        .query({ email: 'user@test.com' })
        .set('Authorization', `Bearer ${getUserToken()}`)

      expect(res.body.statusCode).toBe(Code.Ok)
      expect(res.body.data).toHaveProperty('email', mockUserNormal.email)
    })

    it('查询不存在的用户应返回 data 为 null', async () => {
      mockTypeOrmService.user.findOne.mockResolvedValueOnce(null)

      const res = await request(app.getHttpServer())
        .get('/account/account-info')
        .query({ email: 'nonexist@test.com' })
        .set('Authorization', `Bearer ${getUserToken()}`)

      expect(res.body.statusCode).toBe(Code.Ok)
      expect(res.body.data).toBeNull()
    })

    it('未认证用户应返回 401', async () => {
      const res = await request(app.getHttpServer())
        .get('/account/account-info')
        .query({ email: 'user@test.com' })

      expect(res.status).toBe(401)
    })
  })

  // =====================================================================
  // GET /account/account（账户列表）
  // =====================================================================
  describe('GET /account/account', () => {
    it('已认证用户应该能获取账户列表', async () => {
      const res = await request(app.getHttpServer())
        .get('/account/account')
        .set('Authorization', `Bearer ${getUserToken()}`)

      expect(res.body.statusCode).toBe(Code.Ok)
      expect(Array.isArray(res.body.data)).toBe(true)
    })

    it('应支持 isDisabled 查询参数', async () => {
      const res = await request(app.getHttpServer())
        .get('/account/account')
        .query({ isDisabled: 'true' })
        .set('Authorization', `Bearer ${getUserToken()}`)

      expect(res.body.statusCode).toBe(Code.Ok)
    })

    it('应支持 roles 查询参数', async () => {
      const res = await request(app.getHttpServer())
        .get('/account/account')
        .query({ roles: [UserRole.Admin] })
        .set('Authorization', `Bearer ${getAdminToken()}`)

      expect(res.body.statusCode).toBe(Code.Ok)
    })

    it('未认证用户应返回 401', async () => {
      const res = await request(app.getHttpServer())
        .get('/account/account')

      expect(res.status).toBe(401)
    })
  })

  // =====================================================================
  // POST /account/change-password
  // =====================================================================
  describe('POST /account/change-password', () => {
    it('已认证用户应该能用正确的原密码修改密码', async () => {
      const res = await request(app.getHttpServer())
        .post('/account/change-password')
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({
          originPassword: 'password123',
          password: 'newPassword456',
        })

      expect(res.body.statusCode).toBe(Code.Ok)
    })

    it('原密码错误时应返回错误', async () => {
      const res = await request(app.getHttpServer())
        .post('/account/change-password')
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({
          originPassword: 'wrongOldPassword',
          password: 'newPassword456',
        })

      expect(res.body.statusCode).toBe(Code.BadRequest)
      expect(res.body.message).toContain('原密码错误')
    })

    it('未认证用户应返回 401', async () => {
      const res = await request(app.getHttpServer())
        .post('/account/change-password')
        .send({
          originPassword: 'password123',
          password: 'newPassword456',
        })

      expect(res.status).toBe(401)
    })

    it('缺少必填字段时应返回错误', async () => {
      const res = await request(app.getHttpServer())
        .post('/account/change-password')
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({
          originPassword: 'password123',
          // 缺少 password
        })

      expect(res.status).not.toBe(200)
    })
  })

  // =====================================================================
  // POST /account/change-nickname
  // =====================================================================
  describe('POST /account/change-nickname', () => {
    it('已认证用户应该能修改昵称', async () => {
      const res = await request(app.getHttpServer())
        .post('/account/change-nickname')
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ nickname: 'NewNickname' })

      expect(res.body.statusCode).toBe(Code.Ok)
    })

    it('未认证用户应返回 401', async () => {
      const res = await request(app.getHttpServer())
        .post('/account/change-nickname')
        .send({ nickname: 'NewNickname' })

      expect(res.status).toBe(401)
    })

    it('缺少 nickname 字段时应返回错误', async () => {
      const res = await request(app.getHttpServer())
        .post('/account/change-nickname')
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({})

      expect(res.status).not.toBe(200)
    })
  })

  // =====================================================================
  // POST /account/upgrade
  // =====================================================================
  describe('POST /account/upgrade', () => {
    it('Admin 应该能升级用户组', async () => {
      const res = await request(app.getHttpServer())
        .post('/account/upgrade')
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
        .post('/account/upgrade')
        .set('Authorization', `Bearer ${getAdminToken()}`)
        .send({
          email: 'user@test.com',
          groupType: [UserRole.User],
        })

      expect(res.body.statusCode).toBe(Code.BadRequest)
      expect(res.body.message).toContain('不能对User组进行升降级')
    })

    it('普通用户不应该能升级用户组', async () => {
      const res = await request(app.getHttpServer())
        .post('/account/upgrade')
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({
          email: 'user@test.com',
          groupType: [UserRole.Admin],
        })

      expect(res.status).toBe(403)
    })

    it('未认证用户应返回 401', async () => {
      const res = await request(app.getHttpServer())
        .post('/account/upgrade')
        .send({
          email: 'user@test.com',
          groupType: [UserRole.Admin],
        })

      expect(res.status).toBe(401)
    })

    it('save 返回空数组时应返回错误', async () => {
      mockTypeOrmService.userGroup.save.mockResolvedValueOnce([])

      const res = await request(app.getHttpServer())
        .post('/account/upgrade')
        .set('Authorization', `Bearer ${getAdminToken()}`)
        .send({
          email: 'user@test.com',
          groupType: [UserRole.Admin],
        })

      expect(res.body.message).toContain('不存在满足条件的组')
    })
  })

  // =====================================================================
  // POST /account/downgrade
  // =====================================================================
  describe('POST /account/downgrade', () => {
    it('Admin 应该能降级用户组', async () => {
      const res = await request(app.getHttpServer())
        .post('/account/downgrade')
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
        .post('/account/downgrade')
        .set('Authorization', `Bearer ${getAdminToken()}`)
        .send({
          email: 'user@test.com',
          groupType: [UserRole.User],
        })

      expect(res.body.statusCode).toBe(Code.BadRequest)
      expect(res.body.message).toContain('不能对User组进行升降级')
    })

    it('delete affected 为 0 时应返回错误', async () => {
      mockTypeOrmService.userGroup.delete.mockResolvedValueOnce({ affected: 0 })

      const res = await request(app.getHttpServer())
        .post('/account/downgrade')
        .set('Authorization', `Bearer ${getAdminToken()}`)
        .send({
          email: 'user@test.com',
          groupType: [UserRole.Admin],
        })

      expect(res.body.message).toContain('不存在满足条件的组')
    })

    it('普通用户不应该能降级用户组', async () => {
      const res = await request(app.getHttpServer())
        .post('/account/downgrade')
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({
          email: 'admin@test.com',
          groupType: [UserRole.Admin],
        })

      expect(res.status).toBe(403)
    })

    it('未认证用户应返回 401', async () => {
      const res = await request(app.getHttpServer())
        .post('/account/downgrade')
        .send({
          email: 'admin@test.com',
          groupType: [UserRole.Admin],
        })

      expect(res.status).toBe(401)
    })
  })

  // =====================================================================
  // POST /account/disable
  // =====================================================================
  describe('POST /account/disable', () => {
    it('Admin 应该能禁用指定账户', async () => {
      const res = await request(app.getHttpServer())
        .post('/account/disable')
        .set('Authorization', `Bearer ${getAdminToken()}`)
        .send({ email: 'user@test.com' })

      expect(res.body.statusCode).toBe(Code.Ok)
    })

    it('禁用不存在的用户时应返回错误', async () => {
      mockTypeOrmService.user.softDelete.mockResolvedValueOnce({ affected: 0 })

      const res = await request(app.getHttpServer())
        .post('/account/disable')
        .set('Authorization', `Bearer ${getAdminToken()}`)
        .send({ email: 'nonexist@test.com' })

      expect(res.body.message).toContain('不存在满足条件的用户')
    })

    it('普通用户不应该能禁用账户', async () => {
      const res = await request(app.getHttpServer())
        .post('/account/disable')
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ email: 'user@test.com' })

      expect(res.status).toBe(403)
    })

    it('未认证用户应返回 401', async () => {
      const res = await request(app.getHttpServer())
        .post('/account/disable')
        .send({ email: 'user@test.com' })

      expect(res.status).toBe(401)
    })
  })
})
