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
import { Code } from '@shared/data-transfer/_base'
import {
  createBaseMockTypeOrmService,
  createE2EApp,
  createTokenFactory,
} from './test-utils'

/**
 * Workflow 端点 E2E 测试
 *
 * 覆盖端点:
 *   POST /workflow/create                   - 创建 Workflow 应用
 *   GET  /workflow/apps                     - 获取应用列表
 *   GET  /workflow/:appId                   - 获取单个应用
 *   POST /workflow/:appId/update            - 更新工作流应用信息
 *   GET  /workflow/:appId/draft             - 加载草稿
 *   POST /workflow/:appId/sync              - 同步草稿
 *   POST /workflow/:appId/publish           - 发布草稿
 *   GET  /workflow/:appId/versions          - 获取所有版本列表
 *   GET  /workflow/:appId/version/:version  - 获取指定版本数据
 *   GET  /workflow/:appId/version-meta      - 获取版本元信息
 *   GET  /workflow/:appId/last-version      - 获取最新发布版本
 */
describe('WorkflowController (e2e)', () => {
  let app: INestApplication<App>
  let getUserToken: () => string

  // ---------- Mock 数据 ----------
  const TEST_APP_ID = '550e8400-e29b-41d4-a716-446655440000'

  const mockWorkflowApp = {
    appId: TEST_APP_ID,
    appName: '测试工作流',
    appDescription: '用于测试的工作流应用',
    createdAt: new Date(),
    createdBy: 'user@test.com',
  }

  const mockDraftData = {
    version: 'draft',
    ofAppId: TEST_APP_ID,
    publishDescription: null,
    publishAt: null,
    publishBy: null,
    lastUpdateAt: new Date(),
    nodes: [
      { id: 'node-1', type: 'component', position: { x: 0, y: 0 }, data: {} },
    ],
    edges: [],
    envs: [],
  }

  const mockPublishedData = {
    version: 'v1.0.0',
    ofAppId: TEST_APP_ID,
    publishDescription: '首次发布',
    publishAt: new Date(),
    publishBy: 'user@test.com',
    lastUpdateAt: new Date(),
    nodes: [
      { id: 'node-1', type: 'component', position: { x: 0, y: 0 }, data: {} },
    ],
    edges: [],
    envs: [],
  }

  // ---------- Mock TypeOrmService ----------
  const mockTypeOrmService = {
    // account 相关（jwt 认证需要）
    ...createBaseMockTypeOrmService(),
    // workflow 相关
    workflowApp: {
      save: vi.fn().mockImplementation((data: any) => {
        return Promise.resolve({ ...mockWorkflowApp, ...data })
      }),
      delete: vi.fn().mockResolvedValue({ affected: 1 }),
      findOne: vi.fn().mockImplementation(({ where }: any) => {
        if (where.appId === TEST_APP_ID)
          return Promise.resolve(mockWorkflowApp)
        return Promise.resolve(null)
      }),
      find: vi.fn().mockImplementation(({ where }: any) => {
        if (where?.createdBy) {
          return Promise.resolve(
            [mockWorkflowApp].filter(a => a.createdBy === where.createdBy),
          )
        }
        return Promise.resolve([mockWorkflowApp])
      }),
    },
    workflowAppData: {
      findOne: vi.fn().mockImplementation(({ where }: any) => {
        if (where.ofAppId === TEST_APP_ID && where.version === 'draft')
          return Promise.resolve(mockDraftData)
        if (where.ofAppId === TEST_APP_ID && where.version === 'v1.0.0')
          return Promise.resolve(mockPublishedData)
        // 用于 getLastestPublish — version: Not('draft')
        if (where.ofAppId === TEST_APP_ID && where.version?._type === 'not')
          return Promise.resolve(mockPublishedData)
        return Promise.resolve(null)
      }),
      find: vi.fn().mockImplementation(({ where }: any) => {
        if (where.ofAppId === TEST_APP_ID)
          return Promise.resolve([mockDraftData, mockPublishedData])
        return Promise.resolve([])
      }),
      save: vi.fn().mockImplementation((data: any) => {
        return Promise.resolve({
          ...mockDraftData,
          ...data,
          lastUpdateAt: new Date(),
        })
      }),
      count: vi.fn().mockResolvedValue(0),
    },
    // bot 相关（可能在 AppModule 中被引用）
    botRecord: {
      find: vi.fn().mockResolvedValue([]),
      findOne: vi.fn().mockResolvedValue(null),
      save: vi.fn().mockResolvedValue({}),
    },
  }

  // ---------- 测试生命周期 ----------
  beforeAll(async () => {
    const ctx = await createE2EApp(mockTypeOrmService)
    app = ctx.app

    const tokenFactory = createTokenFactory(ctx.jwtService)
    getUserToken = () => tokenFactory.getUserToken()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    vi.clearAllMocks()

    // 重置默认 mock 行为
    mockTypeOrmService.workflowApp.findOne.mockImplementation(
      ({ where }: any) => {
        if (where.appId === TEST_APP_ID)
          return Promise.resolve(mockWorkflowApp)
        return Promise.resolve(null)
      },
    )
    mockTypeOrmService.workflowApp.find.mockImplementation(({ where }: any) => {
      if (where?.createdBy) {
        return Promise.resolve(
          [mockWorkflowApp].filter(a => a.createdBy === where.createdBy),
        )
      }
      return Promise.resolve([mockWorkflowApp])
    })
    mockTypeOrmService.workflowApp.save.mockImplementation((data: any) => {
      return Promise.resolve({ ...mockWorkflowApp, ...data })
    })
    mockTypeOrmService.workflowAppData.findOne.mockImplementation(
      ({ where }: any) => {
        if (where.ofAppId === TEST_APP_ID && where.version === 'draft')
          return Promise.resolve(mockDraftData)
        if (where.ofAppId === TEST_APP_ID && where.version === 'v1.0.0')
          return Promise.resolve(mockPublishedData)
        if (where.ofAppId === TEST_APP_ID && where.version?._type === 'not')
          return Promise.resolve(mockPublishedData)
        return Promise.resolve(null)
      },
    )
    mockTypeOrmService.workflowAppData.find.mockImplementation(
      ({ where }: any) => {
        if (where.ofAppId === TEST_APP_ID)
          return Promise.resolve([mockDraftData, mockPublishedData])
        return Promise.resolve([])
      },
    )
    mockTypeOrmService.workflowAppData.save.mockImplementation((data: any) => {
      return Promise.resolve({
        ...mockDraftData,
        ...data,
        lastUpdateAt: new Date(),
      })
    })
    mockTypeOrmService.workflowAppData.count.mockResolvedValue(0)
  })

  // =====================================================================
  // POST /workflow/create — 创建 Workflow 应用
  // =====================================================================
  describe('POST /workflow/create', () => {
    it('已认证用户应能成功创建工作流应用', async () => {
      const res = await request(app.getHttpServer())
        .post('/workflow/create')
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ appName: '新工作流', appDescription: '描述信息' })

      expect(res.body.statusCode).toBe(Code.Ok)
      expect(res.body.data).toHaveProperty('appId')
      expect(typeof res.body.data.appId).toBe('string')
    })

    it('未认证用户应返回 401', async () => {
      const res = await request(app.getHttpServer())
        .post('/workflow/create')
        .send({ appName: '新工作流', appDescription: '描述信息' })

      expect(res.status).toBe(401)
    })

    it('缺少必填字段 appName 时应返回错误', async () => {
      const res = await request(app.getHttpServer())
        .post('/workflow/create')
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ appDescription: '描述信息' })

      expect(res.status).not.toBe(200)
    })

    it('缺少必填字段 appDescription 时应返回错误', async () => {
      const res = await request(app.getHttpServer())
        .post('/workflow/create')
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ appName: '新工作流' })

      expect(res.status).not.toBe(200)
    })

    it('请求体为空时应返回错误', async () => {
      const res = await request(app.getHttpServer())
        .post('/workflow/create')
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({})

      expect(res.status).not.toBe(200)
    })
  })

  // =====================================================================
  // GET /workflow/apps — 获取应用列表
  // =====================================================================
  describe('GET /workflow/apps', () => {
    it('已认证用户应能获取全部应用列表', async () => {
      const res = await request(app.getHttpServer())
        .get('/workflow/apps')
        .set('Authorization', `Bearer ${getUserToken()}`)

      expect(res.body.statusCode).toBe(Code.Ok)
      expect(Array.isArray(res.body.data)).toBe(true)
    })

    it('设置 onlySelf=true 应仅返回自己创建的应用', async () => {
      const res = await request(app.getHttpServer())
        .get('/workflow/apps')
        .query({ onlySelf: true })
        .set('Authorization', `Bearer ${getUserToken()}`)

      expect(res.body.statusCode).toBe(Code.Ok)
      expect(mockTypeOrmService.workflowApp.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { createdBy: 'user@test.com' },
        }),
      )
    })

    it('设置 onlySelf=false 应返回全部应用', async () => {
      const res = await request(app.getHttpServer())
        .get('/workflow/apps')
        .query({ onlySelf: false })
        .set('Authorization', `Bearer ${getUserToken()}`)

      expect(res.body.statusCode).toBe(Code.Ok)
      expect(mockTypeOrmService.workflowApp.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { createdBy: undefined },
        }),
      )
    })

    it('未认证用户应返回 401', async () => {
      const res = await request(app.getHttpServer()).get('/workflow/apps')

      expect(res.status).toBe(401)
    })
  })

  // =====================================================================
  // GET /workflow/:appId — 获取单个应用
  // =====================================================================
  describe('GET /workflow/:appId', () => {
    it('已认证用户应能获取存在的应用详情', async () => {
      const res = await request(app.getHttpServer())
        .get(`/workflow/${TEST_APP_ID}`)
        .set('Authorization', `Bearer ${getUserToken()}`)

      expect(res.body.statusCode).toBe(Code.Ok)
      expect(res.body.data).toHaveProperty('appId', TEST_APP_ID)
      expect(res.body.data).toHaveProperty('appName', '测试工作流')
    })

    it('应用不存在时应返回 NotFound', async () => {
      mockTypeOrmService.workflowApp.findOne.mockResolvedValueOnce(null)

      const res = await request(app.getHttpServer())
        .get('/workflow/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${getUserToken()}`)

      expect(res.body.statusCode).toBe(Code.NotFound)
      expect(res.body.message).toContain('App Not Found')
    })

    it('未认证用户应返回 401', async () => {
      const res = await request(app.getHttpServer()).get(
        `/workflow/${TEST_APP_ID}`,
      )

      expect(res.status).toBe(401)
    })
  })

  // =====================================================================
  // POST /workflow/:appId/update — 更新工作流应用信息
  // =====================================================================
  describe('POST /workflow/:appId/update', () => {
    it('已认证用户应能成功更新工作流应用的名称和描述', async () => {
      const res = await request(app.getHttpServer())
        .post(`/workflow/${TEST_APP_ID}/update`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ appName: '更新后的名称', appDescription: '更新后的描述' })

      expect(res.body.statusCode).toBe(Code.Ok)
      expect(res.body.data).toHaveProperty('appId', TEST_APP_ID)
      expect(mockTypeOrmService.workflowApp.save).toHaveBeenCalledWith(
        expect.objectContaining({
          appName: '更新后的名称',
          appDescription: '更新后的描述',
        }),
      )
    })

    it('应用不存在时应返回 NotFound', async () => {
      mockTypeOrmService.workflowApp.findOne.mockResolvedValueOnce(null)

      const res = await request(app.getHttpServer())
        .post(`/workflow/${TEST_APP_ID}/update`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ appName: '新名称', appDescription: '新描述' })

      expect(res.body.statusCode).toBe(Code.NotFound)
      expect(res.body.message).toContain('App Not Found')
    })

    it('缺少必填字段 appName 时应返回错误', async () => {
      const res = await request(app.getHttpServer())
        .post(`/workflow/${TEST_APP_ID}/update`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ appDescription: '只有描述' })

      expect(res.status).not.toBe(200)
    })

    it('缺少必填字段 appDescription 时应返回错误', async () => {
      const res = await request(app.getHttpServer())
        .post(`/workflow/${TEST_APP_ID}/update`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ appName: '只有名称' })

      expect(res.status).not.toBe(200)
    })

    it('appName 为空字符串时应返回错误', async () => {
      const res = await request(app.getHttpServer())
        .post(`/workflow/${TEST_APP_ID}/update`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ appName: '', appDescription: '描述' })

      expect(res.status).not.toBe(200)
    })

    it('appDescription 为空字符串时应返回错误', async () => {
      const res = await request(app.getHttpServer())
        .post(`/workflow/${TEST_APP_ID}/update`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ appName: '名称', appDescription: '' })

      expect(res.status).not.toBe(200)
    })

    it('appName 超过 20 字符时应返回错误', async () => {
      const res = await request(app.getHttpServer())
        .post(`/workflow/${TEST_APP_ID}/update`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ appName: '名'.repeat(21), appDescription: '描述' })

      expect(res.status).not.toBe(200)
    })

    it('appDescription 超过 50 字符时应返回错误', async () => {
      const res = await request(app.getHttpServer())
        .post(`/workflow/${TEST_APP_ID}/update`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ appName: '名称', appDescription: '描'.repeat(51) })

      expect(res.status).not.toBe(200)
    })

    it('请求体为空时应返回错误', async () => {
      const res = await request(app.getHttpServer())
        .post(`/workflow/${TEST_APP_ID}/update`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({})

      expect(res.status).not.toBe(200)
    })

    it('未认证用户应返回 401', async () => {
      const res = await request(app.getHttpServer())
        .post(`/workflow/${TEST_APP_ID}/update`)
        .send({ appName: '新名称', appDescription: '新描述' })

      expect(res.status).toBe(401)
    })
  })

  // =====================================================================
  // GET /workflow/:appId/draft — 加载草稿
  // =====================================================================
  describe('GET /workflow/:appId/draft', () => {
    it('草稿存在时应返回草稿数据', async () => {
      const res = await request(app.getHttpServer())
        .get(`/workflow/${TEST_APP_ID}/draft`)
        .set('Authorization', `Bearer ${getUserToken()}`)

      expect(res.body.statusCode).toBe(Code.Ok)
      expect(res.body.data).toHaveProperty('ofAppId', TEST_APP_ID)
    })

    it('草稿不存在时应自动创建并返回新草稿', async () => {
      // findOne 返回 null（草稿不存在），count 返回 0（允许创建）
      mockTypeOrmService.workflowAppData.findOne.mockResolvedValueOnce(null)
      mockTypeOrmService.workflowAppData.count.mockResolvedValueOnce(0)
      mockTypeOrmService.workflowAppData.save.mockResolvedValueOnce({
        version: 'draft',
        ofAppId: TEST_APP_ID,
        nodes: null,
        edges: null,
        envs: null,
      })

      const res = await request(app.getHttpServer())
        .get(`/workflow/${TEST_APP_ID}/draft`)
        .set('Authorization', `Bearer ${getUserToken()}`)

      expect(res.body.statusCode).toBe(Code.Ok)
      expect(res.body.data).toHaveProperty('ofAppId', TEST_APP_ID)
    })

    it('草稿不存在且已有 draft 记录（count>0）时应返回 NotFound', async () => {
      // findOne 返回 null，count 返回 1（draft 已存在但 findOne 未命中 → createDraft 返回 null）
      mockTypeOrmService.workflowAppData.findOne.mockResolvedValueOnce(null)
      mockTypeOrmService.workflowAppData.count.mockResolvedValueOnce(1)

      const res = await request(app.getHttpServer())
        .get(`/workflow/${TEST_APP_ID}/draft`)
        .set('Authorization', `Bearer ${getUserToken()}`)

      expect(res.body.statusCode).toBe(Code.NotFound)
      expect(res.body.message).toContain('App Not Found')
    })

    it('未认证用户应返回 401', async () => {
      const res = await request(app.getHttpServer()).get(
        `/workflow/${TEST_APP_ID}/draft`,
      )

      expect(res.status).toBe(401)
    })
  })

  // =====================================================================
  // POST /workflow/:appId/sync — 同步草稿
  // =====================================================================
  describe('POST /workflow/:appId/sync', () => {
    const syncPayload = {
      ofAppId: TEST_APP_ID,
      nodes: [
        {
          id: 'node-2',
          type: 'component',
          position: { x: 100, y: 100 },
          data: {},
        },
      ],
      edges: [{ id: 'edge-1', source: 'node-1', target: 'node-2' }],
      envs: [],
    }

    it('已认证用户应能同步草稿数据', async () => {
      const res = await request(app.getHttpServer())
        .post(`/workflow/${TEST_APP_ID}/sync`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send(syncPayload)

      expect(res.body.statusCode).toBe(Code.Ok)
      expect(mockTypeOrmService.workflowAppData.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ofAppId: TEST_APP_ID,
          version: 'draft',
        }),
      )
    })

    it('未认证用户应返回 401', async () => {
      const res = await request(app.getHttpServer())
        .post(`/workflow/${TEST_APP_ID}/sync`)
        .send(syncPayload)

      expect(res.status).toBe(401)
    })
  })

  // =====================================================================
  // POST /workflow/:appId/publish — 发布草稿
  // =====================================================================
  describe('POST /workflow/:appId/publish', () => {
    it('已认证用户应能成功发布草稿', async () => {
      // count 返回 0（版本不重复）
      mockTypeOrmService.workflowAppData.count.mockResolvedValueOnce(0)

      const res = await request(app.getHttpServer())
        .post(`/workflow/${TEST_APP_ID}/publish`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ version: 'v2.0.0', description: '第二次发布' })

      expect(res.body.statusCode).toBe(Code.Ok)
    })

    it('版本号已存在时应返回错误', async () => {
      // count 返回 1（版本重复）
      mockTypeOrmService.workflowAppData.count.mockResolvedValueOnce(1)

      const res = await request(app.getHttpServer())
        .post(`/workflow/${TEST_APP_ID}/publish`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ version: 'v1.0.0', description: '重复版本' })

      expect(res.body.statusCode).toBe(Code.BadRequest)
      expect(res.body.message).toContain('版本已存在')
    })

    it('尝试发布 draft 版本名时应返回 400（CommError）', async () => {
      const res = await request(app.getHttpServer())
        .post(`/workflow/${TEST_APP_ID}/publish`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ version: 'draft', description: '尝试发布draft' })

      // CommError 被 CommErrorExceptionFilter 捕获，HTTP 状态码 400
      expect(res.status).toBe(400)
    })

    it('缺少 version 字段时应返回错误', async () => {
      const res = await request(app.getHttpServer())
        .post(`/workflow/${TEST_APP_ID}/publish`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ description: '缺少版本号' })

      expect(res.status).not.toBe(200)
    })

    it('缺少 description 字段时应返回错误', async () => {
      const res = await request(app.getHttpServer())
        .post(`/workflow/${TEST_APP_ID}/publish`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ version: 'v3.0.0' })

      expect(res.status).not.toBe(200)
    })

    it('version 超过 30 字符时应返回错误', async () => {
      const res = await request(app.getHttpServer())
        .post(`/workflow/${TEST_APP_ID}/publish`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ version: 'v'.repeat(31), description: '版本名过长' })

      expect(res.status).not.toBe(200)
    })

    it('description 超过 50 字符时应返回错误', async () => {
      const res = await request(app.getHttpServer())
        .post(`/workflow/${TEST_APP_ID}/publish`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ version: 'v4.0.0', description: '描'.repeat(51) })

      expect(res.status).not.toBe(200)
    })

    it('未认证用户应返回 401', async () => {
      const res = await request(app.getHttpServer())
        .post(`/workflow/${TEST_APP_ID}/publish`)
        .send({ version: 'v2.0.0', description: '未认证发布' })

      expect(res.status).toBe(401)
    })
  })

  // =====================================================================
  // GET /workflow/:appId/versions — 获取所有版本列表
  // =====================================================================
  describe('GET /workflow/:appId/versions', () => {
    it('已认证用户应能获取应用的版本列表', async () => {
      const res = await request(app.getHttpServer())
        .get(`/workflow/${TEST_APP_ID}/versions`)
        .set('Authorization', `Bearer ${getUserToken()}`)

      expect(res.body.statusCode).toBe(Code.Ok)
      expect(Array.isArray(res.body.data)).toBe(true)
      expect(res.body.data.length).toBe(2) // draft + published
    })

    it('应用无版本时应返回空数组', async () => {
      mockTypeOrmService.workflowAppData.find.mockResolvedValueOnce([])

      const res = await request(app.getHttpServer())
        .get('/workflow/00000000-0000-0000-0000-000000000000/versions')
        .set('Authorization', `Bearer ${getUserToken()}`)

      expect(res.body.statusCode).toBe(Code.Ok)
      expect(res.body.data).toEqual([])
    })

    it('未认证用户应返回 401', async () => {
      const res = await request(app.getHttpServer()).get(
        `/workflow/${TEST_APP_ID}/versions`,
      )

      expect(res.status).toBe(401)
    })
  })

  // =====================================================================
  // GET /workflow/:appId/version/:version — 获取指定版本数据
  // =====================================================================
  describe('GET /workflow/:appId/version/:version', () => {
    it('已认证用户应能获取已发布版本的数据', async () => {
      const res = await request(app.getHttpServer())
        .get(`/workflow/${TEST_APP_ID}/version/v1.0.0`)
        .set('Authorization', `Bearer ${getUserToken()}`)

      expect(res.body.statusCode).toBe(Code.Ok)
      expect(res.body.data).toHaveProperty('version', 'v1.0.0')
      expect(res.body.data).toHaveProperty('ofAppId', TEST_APP_ID)
    })

    it('已认证用户应能获取 draft 版本的数据', async () => {
      const res = await request(app.getHttpServer())
        .get(`/workflow/${TEST_APP_ID}/version/draft`)
        .set('Authorization', `Bearer ${getUserToken()}`)

      expect(res.body.statusCode).toBe(Code.Ok)
      expect(res.body.data).toHaveProperty('version', 'draft')
    })

    it('版本不存在时应返回 NotFound', async () => {
      mockTypeOrmService.workflowAppData.findOne.mockResolvedValueOnce(null)

      const res = await request(app.getHttpServer())
        .get(`/workflow/${TEST_APP_ID}/version/v99.0.0`)
        .set('Authorization', `Bearer ${getUserToken()}`)

      expect(res.body.statusCode).toBe(Code.NotFound)
      expect(res.body.message).toContain('App Version Not Found')
    })

    it('未认证用户应返回 401', async () => {
      const res = await request(app.getHttpServer()).get(
        `/workflow/${TEST_APP_ID}/version/v1.0.0`,
      )

      expect(res.status).toBe(401)
    })
  })

  // =====================================================================
  // GET /workflow/:appId/version-meta — 获取版本元信息
  // =====================================================================
  describe('GET /workflow/:appId/version-meta', () => {
    it('已认证用户应能获取版本元信息', async () => {
      const res = await request(app.getHttpServer())
        .get(`/workflow/${TEST_APP_ID}/version-meta`)
        .query({ version: 'v1.0.0' })
        .set('Authorization', `Bearer ${getUserToken()}`)

      expect(res.body.statusCode).toBe(Code.Ok)
    })

    it('版本不存在时应返回 NotFound', async () => {
      mockTypeOrmService.workflowAppData.findOne.mockResolvedValueOnce(null)

      const res = await request(app.getHttpServer())
        .get(`/workflow/${TEST_APP_ID}/version-meta`)
        .query({ version: 'v99.0.0' })
        .set('Authorization', `Bearer ${getUserToken()}`)

      expect(res.body.statusCode).toBe(Code.NotFound)
      expect(res.body.message).toContain('No Meta')
    })

    it('未认证用户应返回 401', async () => {
      const res = await request(app.getHttpServer())
        .get(`/workflow/${TEST_APP_ID}/version-meta`)
        .query({ version: 'v1.0.0' })

      expect(res.status).toBe(401)
    })
  })

  // =====================================================================
  // GET /workflow/:appId/last-version — 获取最新发布版本
  // =====================================================================
  describe('GET /workflow/:appId/last-version', () => {
    it('已认证用户应能获取最新发布版本', async () => {
      const res = await request(app.getHttpServer())
        .get(`/workflow/${TEST_APP_ID}/last-version`)
        .set('Authorization', `Bearer ${getUserToken()}`)

      expect(res.body.statusCode).toBe(Code.Ok)
    })

    it('无已发布版本时应返回 NotFound', async () => {
      mockTypeOrmService.workflowAppData.findOne.mockResolvedValueOnce(null)

      const res = await request(app.getHttpServer())
        .get(`/workflow/${TEST_APP_ID}/last-version`)
        .set('Authorization', `Bearer ${getUserToken()}`)

      expect(res.body.statusCode).toBe(Code.NotFound)
      expect(res.body.message).toContain('App Version Not Found')
    })

    it('未认证用户应返回 401', async () => {
      const res = await request(app.getHttpServer()).get(
        `/workflow/${TEST_APP_ID}/last-version`,
      )

      expect(res.status).toBe(401)
    })
  })
})
