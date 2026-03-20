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
} from './utils/nest-init'

/**
 * Workflow 端点 E2E 测试
 *
 * 测试控制器：
 *   WorkflowRecordController    - 路由 /workflow/record
 *   WorkflowFlowController      - 路由 /workflow/flow
 *   WorkflowVersionsController  - 路由 /workflow/versions
 *
 * Mock：
 *   数据库层（workflowApp / workflowAppData / botRecord 仓库）
 *
 * 覆盖端点：
 *   POST /workflow/record/create                   - 创建 Workflow 应用
 *   GET  /workflow/record/list                     - 获取应用列表
 *   GET  /workflow/record/:appId                   - 获取单个应用
 *   POST /workflow/record/:appId/update            - 更新工作流应用信息
 *   POST /workflow/record/:appId/delete            - 删除工作流应用
 *   GET  /workflow/flow/:appId/draft               - 加载草稿
 *   POST /workflow/flow/:appId/sync                - 同步草稿
 *   POST /workflow/flow/:appId/publish             - 发布草稿
 *   GET  /workflow/versions/:appId/list      - 获取所有版本列表
 *   GET  /workflow/versions/:appId/:version/query - 获取指定版本数据
 *   GET  /workflow/versions/:appId/:version/meta  - 获取版本元信息
 *   GET  /workflow/versions/:appId/last      - 获取最新发布版本
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

  let workflowApps: Array<typeof mockWorkflowApp> = []

  function resetWorkflowApps() {
    workflowApps = [{ ...mockWorkflowApp }]
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

  let workflowAppDatas: Array<typeof mockDraftData | typeof mockPublishedData>
    = []

  function resetWorkflowAppDatas() {
    workflowAppDatas = [{ ...mockDraftData }, { ...mockPublishedData }]
  }

  // ---------- Mock TypeOrmService ----------
  const mockTypeOrmService = {
    // account 相关（jwt 认证需要）
    ...createBaseMockTypeOrmService(),
    // workflow 相关
    workflowApp: {
      save: vi.fn().mockImplementation((data: any) => {
        const index = workflowApps.findIndex(a => a.appId === data.appId)
        if (index >= 0) {
          workflowApps[index] = {
            ...workflowApps[index],
            ...data,
          }
          return Promise.resolve(workflowApps[index])
        }

        const created = {
          ...mockWorkflowApp,
          ...data,
        }
        workflowApps.push(created)
        return Promise.resolve(created)
      }),
      delete: vi.fn().mockImplementation(({ appId }: any) => {
        const previousLength = workflowApps.length
        workflowApps = workflowApps.filter(app => app.appId !== appId)
        return Promise.resolve({
          affected: previousLength === workflowApps.length ? 0 : 1,
        })
      }),
      findOne: vi.fn().mockImplementation(({ where }: any) => {
        return Promise.resolve(
          workflowApps.find(a => a.appId === where.appId) ?? null,
        )
      }),
      find: vi.fn().mockImplementation(({ where }: any) => {
        if (where?.createdBy) {
          return Promise.resolve(
            workflowApps.filter(a => a.createdBy === where.createdBy),
          )
        }
        return Promise.resolve([...workflowApps])
      }),
    },
    workflowAppData: {
      findOne: vi.fn().mockImplementation(({ where }: any) => {
        if (where.version?._type === 'not') {
          const published = workflowAppDatas
            .filter(
              item =>
                item.ofAppId === where.ofAppId && item.version !== 'draft',
            )
            .sort(
              (a, b) =>
                new Date(b.publishAt ?? 0).getTime()
                - new Date(a.publishAt ?? 0).getTime(),
            )
          return Promise.resolve(published[0] ?? null)
        }

        return Promise.resolve(
          workflowAppDatas.find(
            item =>
              item.ofAppId === where.ofAppId && item.version === where.version,
          ) ?? null,
        )
      }),
      find: vi.fn().mockImplementation(({ where }: any) => {
        return Promise.resolve(
          workflowAppDatas.filter(item => item.ofAppId === where.ofAppId),
        )
      }),
      save: vi.fn().mockImplementation((data: any) => {
        const saved = {
          ...mockDraftData,
          ...data,
          lastUpdateAt: new Date(),
        }

        const index = workflowAppDatas.findIndex(
          item =>
            item.ofAppId === saved.ofAppId && item.version === saved.version,
        )
        if (index >= 0) workflowAppDatas[index] = saved
        else workflowAppDatas.push(saved)

        return Promise.resolve(saved)
      }),
      count: vi.fn().mockImplementation(({ where }: any) => {
        const count = workflowAppDatas.filter((item) => {
          if (where.ofAppId && item.ofAppId !== where.ofAppId) return false
          if (where.version && item.version !== where.version) return false
          return true
        }).length
        return Promise.resolve(count)
      }),
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
    resetWorkflowApps()
    resetWorkflowAppDatas()

    // 重置默认 mock 行为
    mockTypeOrmService.workflowApp.findOne.mockImplementation(
      ({ where }: any) => {
        return Promise.resolve(
          workflowApps.find(a => a.appId === where.appId) ?? null,
        )
      },
    )
    mockTypeOrmService.workflowApp.find.mockImplementation(({ where }: any) => {
      if (where?.createdBy) {
        return Promise.resolve(
          workflowApps.filter(a => a.createdBy === where.createdBy),
        )
      }
      return Promise.resolve([...workflowApps])
    })
    mockTypeOrmService.workflowApp.save.mockImplementation((data: any) => {
      const index = workflowApps.findIndex(a => a.appId === data.appId)
      if (index >= 0) {
        workflowApps[index] = {
          ...workflowApps[index],
          ...data,
        }
        return Promise.resolve(workflowApps[index])
      }

      const created = {
        ...mockWorkflowApp,
        ...data,
      }
      workflowApps.push(created)
      return Promise.resolve(created)
    })
    mockTypeOrmService.workflowApp.delete.mockImplementation(
      ({ appId }: any) => {
        const previousLength = workflowApps.length
        workflowApps = workflowApps.filter(app => app.appId !== appId)
        return Promise.resolve({
          affected: previousLength === workflowApps.length ? 0 : 1,
        })
      },
    )
    mockTypeOrmService.workflowAppData.findOne.mockImplementation(
      ({ where }: any) => {
        if (where.version?._type === 'not') {
          const published = workflowAppDatas
            .filter(
              item =>
                item.ofAppId === where.ofAppId && item.version !== 'draft',
            )
            .sort(
              (a, b) =>
                new Date(b.publishAt ?? 0).getTime()
                - new Date(a.publishAt ?? 0).getTime(),
            )
          return Promise.resolve(published[0] ?? null)
        }

        return Promise.resolve(
          workflowAppDatas.find(
            item =>
              item.ofAppId === where.ofAppId && item.version === where.version,
          ) ?? null,
        )
      },
    )
    mockTypeOrmService.workflowAppData.find.mockImplementation(
      ({ where }: any) => {
        return Promise.resolve(
          workflowAppDatas.filter(item => item.ofAppId === where.ofAppId),
        )
      },
    )
    mockTypeOrmService.workflowAppData.save.mockImplementation((data: any) => {
      const saved = {
        ...mockDraftData,
        ...data,
        lastUpdateAt: new Date(),
      }

      const index = workflowAppDatas.findIndex(
        item =>
          item.ofAppId === saved.ofAppId && item.version === saved.version,
      )
      if (index >= 0) workflowAppDatas[index] = saved
      else workflowAppDatas.push(saved)

      return Promise.resolve(saved)
    })
    mockTypeOrmService.workflowAppData.count.mockImplementation(
      ({ where }: any) => {
        const count = workflowAppDatas.filter((item) => {
          if (where.ofAppId && item.ofAppId !== where.ofAppId) return false
          if (where.version && item.version !== where.version) return false
          return true
        }).length
        return Promise.resolve(count)
      },
    )
  })

  // =====================================================================
  // POST /workflow/record/create — 创建 Workflow 应用
  // =====================================================================
  describe('POST /workflow/record/create', () => {
    it('已认证用户应能成功创建工作流应用', async () => {
      const res = await request(app.getHttpServer())
        .post('/workflow/record/create')
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ appName: '新工作流', appDescription: '描述信息' })

      expect(res.body.statusCode).toBe(Code.Ok)
      expect(res.body.data).toHaveProperty('appId')
      expect(typeof res.body.data.appId).toBe('string')
    })

    it('未认证用户应返回 401', async () => {
      const res = await request(app.getHttpServer())
        .post('/workflow/record/create')
        .send({ appName: '新工作流', appDescription: '描述信息' })

      expect(res.status).toBe(401)
    })

    it('缺少必填字段 appName 时应返回错误', async () => {
      const res = await request(app.getHttpServer())
        .post('/workflow/record/create')
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ appDescription: '描述信息' })

      expect(res.status).not.toBe(200)
    })

    it('缺少必填字段 appDescription 时应返回错误', async () => {
      const res = await request(app.getHttpServer())
        .post('/workflow/record/create')
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ appName: '新工作流' })

      expect(res.status).not.toBe(200)
    })

    it('请求体为空时应返回错误', async () => {
      const res = await request(app.getHttpServer())
        .post('/workflow/record/create')
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({})

      expect(res.status).not.toBe(200)
    })
  })

  // =====================================================================
  // GET /workflow/record/list — 获取应用列表
  // =====================================================================
  describe('GET /workflow/record/list', () => {
    it('已认证用户应能获取全部应用列表', async () => {
      const res = await request(app.getHttpServer())
        .get('/workflow/record/list')
        .set('Authorization', `Bearer ${getUserToken()}`)

      expect(res.body.statusCode).toBe(Code.Ok)
      expect(Array.isArray(res.body.data)).toBe(true)
    })

    it('设置 onlySelf=true 应仅返回自己创建的应用', async () => {
      const res = await request(app.getHttpServer())
        .get('/workflow/record/list')
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
        .get('/workflow/record/list')
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
      const res = await request(app.getHttpServer()).get('/workflow/record/list')

      expect(res.status).toBe(401)
    })
  })

  // =====================================================================
  // GET /workflow/:appId — 获取单个应用
  // =====================================================================
  describe('GET /workflow/:appId', () => {
    it('已认证用户应能获取存在的应用详情', async () => {
      const res = await request(app.getHttpServer())
        .get(`/workflow/record/${TEST_APP_ID}`)
        .set('Authorization', `Bearer ${getUserToken()}`)

      expect(res.body.statusCode).toBe(Code.Ok)
      expect(res.body.data).toHaveProperty('appId', TEST_APP_ID)
      expect(res.body.data).toHaveProperty('appName', '测试工作流')
    })

    it('应用不存在时应返回 NotFound', async () => {
      mockTypeOrmService.workflowApp.findOne.mockResolvedValueOnce(null)

      const res = await request(app.getHttpServer())
        .get('/workflow/record/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${getUserToken()}`)

      expect(res.body.statusCode).toBe(Code.NotFound)
      expect(res.body.message).toContain('App Not Found')
    })

    it('未认证用户应返回 401', async () => {
      const res = await request(app.getHttpServer()).get(
        `/workflow/record/${TEST_APP_ID}`,
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
        .post(`/workflow/record/${TEST_APP_ID}/update`)
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
        .post(`/workflow/record/${TEST_APP_ID}/update`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ appName: '新名称', appDescription: '新描述' })

      expect(res.body.statusCode).toBe(Code.NotFound)
      expect(res.body.message).toContain('App Not Found')
    })

    it('缺少必填字段 appName 时应返回错误', async () => {
      const res = await request(app.getHttpServer())
        .post(`/workflow/record/${TEST_APP_ID}/update`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ appDescription: '只有描述' })

      expect(res.status).not.toBe(200)
    })

    it('缺少必填字段 appDescription 时应返回错误', async () => {
      const res = await request(app.getHttpServer())
        .post(`/workflow/record/${TEST_APP_ID}/update`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ appName: '只有名称' })

      expect(res.status).not.toBe(200)
    })

    it('appName 为空字符串时应返回错误', async () => {
      const res = await request(app.getHttpServer())
        .post(`/workflow/record/${TEST_APP_ID}/update`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ appName: '', appDescription: '描述' })

      expect(res.status).not.toBe(200)
    })

    it('appDescription 为空字符串时应返回错误', async () => {
      const res = await request(app.getHttpServer())
        .post(`/workflow/record/${TEST_APP_ID}/update`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ appName: '名称', appDescription: '' })

      expect(res.status).not.toBe(200)
    })

    it('appName 超过 20 字符时应返回错误', async () => {
      const res = await request(app.getHttpServer())
        .post(`/workflow/record/${TEST_APP_ID}/update`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ appName: '名'.repeat(21), appDescription: '描述' })

      expect(res.status).not.toBe(200)
    })

    it('appDescription 超过 50 字符时应返回错误', async () => {
      const res = await request(app.getHttpServer())
        .post(`/workflow/record/${TEST_APP_ID}/update`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ appName: '名称', appDescription: '描'.repeat(51) })

      expect(res.status).not.toBe(200)
    })

    it('请求体为空时应返回错误', async () => {
      const res = await request(app.getHttpServer())
        .post(`/workflow/record/${TEST_APP_ID}/update`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({})

      expect(res.status).not.toBe(200)
    })

    it('未认证用户应返回 401', async () => {
      const res = await request(app.getHttpServer())
        .post(`/workflow/record/${TEST_APP_ID}/update`)
        .send({ appName: '新名称', appDescription: '新描述' })

      expect(res.status).toBe(401)
    })
  })

  // =====================================================================
  // POST /workflow/:appId/delete — 删除工作流应用
  // =====================================================================
  describe('POST /workflow/:appId/delete', () => {
    it('已认证用户应能成功删除工作流应用', async () => {
      const res = await request(app.getHttpServer())
        .post(`/workflow/record/${TEST_APP_ID}/delete`)
        .set('Authorization', `Bearer ${getUserToken()}`)

      expect(res.body.statusCode).toBe(Code.Ok)
      expect(mockTypeOrmService.workflowApp.delete).toHaveBeenCalledWith({
        appId: TEST_APP_ID,
      })
    })

    it('应用不存在时应返回 NotFound', async () => {
      mockTypeOrmService.workflowApp.delete.mockResolvedValueOnce({
        affected: 0,
      })

      const res = await request(app.getHttpServer())
        .post('/workflow/record/00000000-0000-0000-0000-000000000000/delete')
        .set('Authorization', `Bearer ${getUserToken()}`)

      expect(res.body.statusCode).toBe(Code.NotFound)
      expect(res.body.message).toContain('App Not Found')
    })

    it('未认证用户应返回 401', async () => {
      const res = await request(app.getHttpServer()).post(
        `/workflow/record/${TEST_APP_ID}/delete`,
      )

      expect(res.status).toBe(401)
    })
  })

  // =====================================================================
  // 联动场景 - 创建 / 查询 / 删除 / 再查询
  // =====================================================================
  describe('Workflow 联动请求场景', () => {
    it('create -> get -> delete -> get 应体现完整生命周期', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/workflow/record/create')
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ appName: '联动工作流', appDescription: '用于联动验证' })

      expect(createRes.body.statusCode).toBe(Code.Ok)
      const createdAppId = createRes.body.data.appId as string
      expect(createdAppId).toBeTruthy()

      const listAfterCreate = await request(app.getHttpServer())
        .get('/workflow/record/list')
        .set('Authorization', `Bearer ${getUserToken()}`)
      expect(listAfterCreate.body.statusCode).toBe(Code.Ok)
      expect(
        listAfterCreate.body.data.some(
          (app: any) => app.appId === createdAppId,
        ),
      ).toBe(true)

      const getAfterCreate = await request(app.getHttpServer())
        .get(`/workflow/record/${createdAppId}`)
        .set('Authorization', `Bearer ${getUserToken()}`)
      expect(getAfterCreate.body.statusCode).toBe(Code.Ok)
      expect(getAfterCreate.body.data).toHaveProperty('appId', createdAppId)

      const deleteRes = await request(app.getHttpServer())
        .post(`/workflow/record/${createdAppId}/delete`)
        .set('Authorization', `Bearer ${getUserToken()}`)
      expect(deleteRes.body.statusCode).toBe(Code.Ok)

      const listAfterDelete = await request(app.getHttpServer())
        .get('/workflow/record/list')
        .set('Authorization', `Bearer ${getUserToken()}`)
      expect(listAfterDelete.body.statusCode).toBe(Code.Ok)
      expect(
        listAfterDelete.body.data.some(
          (app: any) => app.appId === createdAppId,
        ),
      ).toBe(false)

      const getAfterDelete = await request(app.getHttpServer())
        .get(`/workflow/record/${createdAppId}`)
        .set('Authorization', `Bearer ${getUserToken()}`)
      expect(getAfterDelete.body.statusCode).toBe(Code.NotFound)
      expect(getAfterDelete.body.message).toContain('App Not Found')
    })
  })

  // =====================================================================
  // GET /workflow/:appId/draft — 加载草稿
  // =====================================================================
  describe('GET /workflow/:appId/draft', () => {
    it('草稿存在时应返回草稿数据', async () => {
      const res = await request(app.getHttpServer())
        .get(`/workflow/flow/${TEST_APP_ID}/draft`)
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
        .get(`/workflow/flow/${TEST_APP_ID}/draft`)
        .set('Authorization', `Bearer ${getUserToken()}`)

      expect(res.body.statusCode).toBe(Code.Ok)
      expect(res.body.data).toHaveProperty('ofAppId', TEST_APP_ID)
    })

    it('草稿不存在且已有 draft 记录（count>0）时应返回 NotFound', async () => {
      // findOne 返回 null，count 返回 1（draft 已存在但 findOne 未命中 → createDraft 返回 null）
      mockTypeOrmService.workflowAppData.findOne.mockResolvedValueOnce(null)
      mockTypeOrmService.workflowAppData.count.mockResolvedValueOnce(1)

      const res = await request(app.getHttpServer())
        .get(`/workflow/flow/${TEST_APP_ID}/draft`)
        .set('Authorization', `Bearer ${getUserToken()}`)

      expect(res.body.statusCode).toBe(Code.NotFound)
      expect(res.body.message).toContain('App Not Found')
    })

    it('未认证用户应返回 401', async () => {
      const res = await request(app.getHttpServer()).get(
        `/workflow/flow/${TEST_APP_ID}/draft`,
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
        .post(`/workflow/flow/${TEST_APP_ID}/sync`)
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
        .post(`/workflow/flow/${TEST_APP_ID}/sync`)
        .send(syncPayload)

      expect(res.status).toBe(401)
    })

    it('draft -> sync1 -> draft(1) -> sync2 -> draft(2且不等于1)', async () => {
      // 1. draft: 应该是可读取的 draft，且无错误
      const draft0 = await request(app.getHttpServer())
        .get(`/workflow/flow/${TEST_APP_ID}/draft`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(200)

      expect(draft0.body.statusCode).toBe(Code.Ok)
      expect(draft0.body.data).toHaveProperty('ofAppId', TEST_APP_ID)

      const payload1 = {
        ofAppId: TEST_APP_ID,
        nodes: [
          {
            id: 'node-sync-1',
            type: 'component',
            position: { x: 100, y: 100 },
            data: { label: 'sync-1' },
          },
        ],
        edges: [{ id: 'edge-sync-1', source: 'node-1', target: 'node-sync-1' }],
        envs: [{ name: 'region', type: 'string' }],
      }

      const payload2 = {
        ofAppId: TEST_APP_ID,
        nodes: [
          {
            id: 'node-sync-2',
            type: 'component',
            position: { x: 220, y: 220 },
            data: { label: 'sync-2' },
          },
        ],
        edges: [],
        envs: [{ name: 'retry', type: 'number' }],
      }

      // 2. sync 1
      const sync1 = await request(app.getHttpServer())
        .post(`/workflow/flow/${TEST_APP_ID}/sync`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send(payload1)
        .expect(201)
      expect(sync1.body.statusCode).toBe(Code.Ok)

      // 3. draft 应该等于 payload1
      const draft1 = await request(app.getHttpServer())
        .get(`/workflow/flow/${TEST_APP_ID}/draft`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(200)

      expect(draft1.body.statusCode).toBe(Code.Ok)
      expect(draft1.body.data.nodes).toEqual(payload1.nodes)
      expect(draft1.body.data.edges).toEqual(payload1.edges)
      expect(draft1.body.data.envs).toEqual(payload1.envs)

      // 4. sync 2
      const sync2 = await request(app.getHttpServer())
        .post(`/workflow/flow/${TEST_APP_ID}/sync`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send(payload2)
        .expect(201)
      expect(sync2.body.statusCode).toBe(Code.Ok)

      // 5. draft 应该等于 payload2，且不等于 payload1
      const draft2 = await request(app.getHttpServer())
        .get(`/workflow/flow/${TEST_APP_ID}/draft`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(200)

      expect(draft2.body.statusCode).toBe(Code.Ok)
      expect(draft2.body.data.nodes).toEqual(payload2.nodes)
      expect(draft2.body.data.edges).toEqual(payload2.edges)
      expect(draft2.body.data.envs).toEqual(payload2.envs)

      expect(draft2.body.data.nodes).not.toEqual(payload1.nodes)
      expect(draft2.body.data.edges).not.toEqual(payload1.edges)
      expect(draft2.body.data.envs).not.toEqual(payload1.envs)
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
        .post(`/workflow/flow/${TEST_APP_ID}/publish`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ version: 'v2.0.0', description: '第二次发布' })

      expect(res.body.statusCode).toBe(Code.Ok)
    })

    it('版本号已存在时应返回错误', async () => {
      // count 返回 1（版本重复）
      mockTypeOrmService.workflowAppData.count.mockResolvedValueOnce(1)

      const res = await request(app.getHttpServer())
        .post(`/workflow/flow/${TEST_APP_ID}/publish`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ version: 'v1.0.0', description: '重复版本' })

      expect(res.body.statusCode).toBe(Code.BadRequest)
      expect(res.body.message).toContain('版本已存在')
    })

    it('尝试发布 draft 版本名时应返回 400（CommError）', async () => {
      const res = await request(app.getHttpServer())
        .post(`/workflow/flow/${TEST_APP_ID}/publish`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ version: 'draft', description: '尝试发布draft' })

      // CommError 被 CommErrorExceptionFilter 捕获，HTTP 状态码 400
      expect(res.status).toBe(400)
    })

    it('缺少 version 字段时应返回错误', async () => {
      const res = await request(app.getHttpServer())
        .post(`/workflow/flow/${TEST_APP_ID}/publish`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ description: '缺少版本号' })

      expect(res.status).not.toBe(200)
    })

    it('缺少 description 字段时应返回错误', async () => {
      const res = await request(app.getHttpServer())
        .post(`/workflow/flow/${TEST_APP_ID}/publish`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ version: 'v3.0.0' })

      expect(res.status).not.toBe(200)
    })

    it('version 超过 30 字符时应返回错误', async () => {
      const res = await request(app.getHttpServer())
        .post(`/workflow/flow/${TEST_APP_ID}/publish`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ version: 'v'.repeat(31), description: '版本名过长' })

      expect(res.status).not.toBe(200)
    })

    it('description 超过 50 字符时应返回错误', async () => {
      const res = await request(app.getHttpServer())
        .post(`/workflow/flow/${TEST_APP_ID}/publish`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ version: 'v4.0.0', description: '描'.repeat(51) })

      expect(res.status).not.toBe(200)
    })

    it('未认证用户应返回 401', async () => {
      const res = await request(app.getHttpServer())
        .post(`/workflow/flow/${TEST_APP_ID}/publish`)
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
        .get(`/workflow/versions/${TEST_APP_ID}/list`)
        .set('Authorization', `Bearer ${getUserToken()}`)

      expect(res.body.statusCode).toBe(Code.Ok)
      expect(Array.isArray(res.body.data)).toBe(true)
      expect(res.body.data.length).toBe(2) // draft + published
    })

    it('应用无版本时应返回空数组', async () => {
      mockTypeOrmService.workflowAppData.find.mockResolvedValueOnce([])

      const res = await request(app.getHttpServer())
        .get('/workflow/versions/00000000-0000-0000-0000-000000000000/list')
        .set('Authorization', `Bearer ${getUserToken()}`)

      expect(res.body.statusCode).toBe(Code.Ok)
      expect(res.body.data).toEqual([])
    })

    it('未认证用户应返回 401', async () => {
      const res = await request(app.getHttpServer()).get(
        `/workflow/versions/${TEST_APP_ID}/list`,
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
        .get(`/workflow/versions/${TEST_APP_ID}/v1.0.0/query`)
        .set('Authorization', `Bearer ${getUserToken()}`)

      expect(res.body.statusCode).toBe(Code.Ok)
      expect(res.body.data).toHaveProperty('version', 'v1.0.0')
      expect(res.body.data).toHaveProperty('ofAppId', TEST_APP_ID)
    })

    it('已认证用户应能获取 draft 版本的数据', async () => {
      const res = await request(app.getHttpServer())
        .get(`/workflow/versions/${TEST_APP_ID}/draft/query`)
        .set('Authorization', `Bearer ${getUserToken()}`)

      expect(res.body.statusCode).toBe(Code.Ok)
      expect(res.body.data).toHaveProperty('version', 'draft')
    })

    it('版本不存在时应返回 NotFound', async () => {
      mockTypeOrmService.workflowAppData.findOne.mockResolvedValueOnce(null)

      const res = await request(app.getHttpServer())
        .get(`/workflow/versions/${TEST_APP_ID}/v99.0.0/query`)
        .set('Authorization', `Bearer ${getUserToken()}`)

      expect(res.body.statusCode).toBe(Code.NotFound)
      expect(res.body.message).toContain('App Version Not Found')
    })

    it('未认证用户应返回 401', async () => {
      const res = await request(app.getHttpServer()).get(
        `/workflow/versions/${TEST_APP_ID}/v1.0.0/query`,
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
        .get(`/workflow/versions/${TEST_APP_ID}/v1.0.0/meta`)
        .set('Authorization', `Bearer ${getUserToken()}`)

      expect(res.body.statusCode).toBe(Code.Ok)
    })

    it('版本不存在时应返回 NotFound', async () => {
      mockTypeOrmService.workflowAppData.findOne.mockResolvedValueOnce(null)

      const res = await request(app.getHttpServer())
        .get(`/workflow/versions/${TEST_APP_ID}/v99.0.0/meta`)
        .set('Authorization', `Bearer ${getUserToken()}`)

      expect(res.body.statusCode).toBe(Code.NotFound)
      expect(res.body.message).toContain('No Meta')
    })

    it('未认证用户应返回 401', async () => {
      const res = await request(app.getHttpServer())
        .get(`/workflow/versions/${TEST_APP_ID}/v1.0.0/meta`)

      expect(res.status).toBe(401)
    })
  })

  // =====================================================================
  // GET /workflow/:appId/last-version — 获取最新发布版本
  // =====================================================================
  describe('GET /workflow/:appId/last-version', () => {
    it('已认证用户应能获取最新发布版本', async () => {
      const res = await request(app.getHttpServer())
        .get(`/workflow/versions/${TEST_APP_ID}/last`)
        .set('Authorization', `Bearer ${getUserToken()}`)

      expect(res.body.statusCode).toBe(Code.Ok)
    })

    it('无已发布版本时应返回 NotFound', async () => {
      mockTypeOrmService.workflowAppData.findOne.mockResolvedValueOnce(null)

      const res = await request(app.getHttpServer())
        .get(`/workflow/versions/${TEST_APP_ID}/last`)
        .set('Authorization', `Bearer ${getUserToken()}`)

      expect(res.body.statusCode).toBe(Code.NotFound)
      expect(res.body.message).toContain('App Version Not Found')
    })

    it('未认证用户应返回 401', async () => {
      const res = await request(app.getHttpServer()).get(
        `/workflow/versions/${TEST_APP_ID}/last`,
      )

      expect(res.status).toBe(401)
    })
  })

  // =====================================================================
  // 联动场景 - 发布目录链路
  // =====================================================================
  describe('Workflow 发布目录联动场景', () => {
    it('publish -> versions -> version-meta -> version -> last-version 应联动一致', async () => {
      const publishVersion = 'v2.1.0'
      const publishDescription = '联动发布验证'

      // 1. 发布新版本
      const publishRes = await request(app.getHttpServer())
        .post(`/workflow/flow/${TEST_APP_ID}/publish`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ version: publishVersion, description: publishDescription })
      expect(publishRes.body.statusCode).toBe(Code.Ok)

      // 2. 发布目录（版本列表）应包含新版本
      const versionsRes = await request(app.getHttpServer())
        .get(`/workflow/versions/${TEST_APP_ID}/list`)
        .set('Authorization', `Bearer ${getUserToken()}`)
      expect(versionsRes.body.statusCode).toBe(Code.Ok)
      expect(
        versionsRes.body.data.some(
          (item: any) => item.version === publishVersion,
        ),
      ).toBe(true)

      // 3. 版本元信息应可读
      const metaRes = await request(app.getHttpServer())
        .get(`/workflow/versions/${TEST_APP_ID}/${publishVersion}/meta`)
        .set('Authorization', `Bearer ${getUserToken()}`)
      expect(metaRes.body.statusCode).toBe(Code.Ok)

      // 4. 指定版本详情应可读且版本号一致
      const versionRes = await request(app.getHttpServer())
        .get(`/workflow/versions/${TEST_APP_ID}/${publishVersion}/query`)
        .set('Authorization', `Bearer ${getUserToken()}`)
      expect(versionRes.body.statusCode).toBe(Code.Ok)
      expect(versionRes.body.data).toHaveProperty('version', publishVersion)

      // 5. 最新版本应切换到刚发布的版本
      const lastVersionRes = await request(app.getHttpServer())
        .get(`/workflow/versions/${TEST_APP_ID}/last`)
        .set('Authorization', `Bearer ${getUserToken()}`)
      expect(lastVersionRes.body.statusCode).toBe(Code.Ok)
      expect(lastVersionRes.body.data).toHaveProperty(
        'version',
        publishVersion,
      )
    })
  })
})
