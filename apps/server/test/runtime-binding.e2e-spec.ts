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
import { AdapterTag, BotRunningState } from '@shared/common/bot/base'
import {
  createBaseMockTypeOrmService,
  createE2EApp,
  createTokenFactory,
} from './utils/nest-init'
import { BotFactoryService } from '../src/apps/runtime/bot/core/bot-factory.service'
import { BotCoreRuntimeService } from '../src/apps/runtime/bot/core/bot-core-runtime.service'
import type { BotInstance } from '../src/apps/runtime/bot/adapter/_base'

/**
 * Runtime 插件绑定 E2E 测试
 *
 * 测试控制器：
 *   BotBridgeController     - 路由 /bot-bridge
 *
 * Mock：
 *   数据库层（botRecord / workflowApp / workflowAppData 仓库）
 *   BotFactory.createBot（spyOn，辅助 startBot）
 *   BotCoreRuntime.botInstanceMap（直接访问私有属性，模拟运行中状态）
 *
 * 覆盖端点：
 *   POST /bot-bridge/:botId/bindmany                  - 批量绑定插件（workflow app）
 *   POST /bot-bridge/:botId/unbindmany                - 批量解绑插件
 *   GET  /bot-bridge/:botId/binding                   - 获取绑定列表
 *   GET  /bot-bridge/:botId/bindingconfig/:bindingId  - 获取绑定配置
 *   POST /bot-bridge/:botId/bindingconfig/:bindingId  - 设置绑定配置
 *
 * 业务规则：
 *   - 不能绑定 draft 版本
 *   - Bot 运行中不能绑定 / 解绑 / 配置绑定
 *   - 可以将相同 appId 的相同版本多次绑定到同一个 bot（不同 env 场景）
 *   - 解绑不存在的 bindingId 静默成功
 *   - 配置不存在的 bindingId 抛出错误
 */
describe('Runtime BotBridge - 插件绑定 (e2e)', () => {
  let app: INestApplication<App>
  let getUserToken: () => string
  let botFactoryService: BotFactoryService
  let botCoreRuntimeService: BotCoreRuntimeService

  // ---------- Mock 数据 ----------
  const TEST_BOT_ID = 'test-bot-binding-001'
  const TEST_APP_ID = '550e8400-e29b-41d4-a716-446655440001'
  const TEST_APP_ID_2 = '550e8400-e29b-41d4-a716-446655440002'
  const TEST_BINDING_ID = 'binding-id-001'
  const TEST_BINDING_ID_2 = 'binding-id-002'

  /**
   * 创建一个可控的 botRecord mock 对象
   * commonAdapterConfig.bindingWorkflowApp 默认为空数组，
   * 提供 save 方法以模拟 TypeORM BaseEntity.save()
   */
  function createMockBotRecord(overrides?: {
    bindingWorkflowApp?: any[];
    botId?: string;
  }) {
    const record: any = {
      botId: overrides?.botId ?? TEST_BOT_ID,
      name: '测试机器人',
      description: '用于绑定测试的机器人',
      commonAdapterConfig: {
        bindingWorkflowApp: overrides?.bindingWorkflowApp ?? [],
      },
      adapterTag: AdapterTag.napcatWs,
      adapterConfig: {},
      createdAt: new Date(),
      createdBy: 'user@test.com',
      save: vi.fn().mockImplementation(function (this: any) {
        return Promise.resolve(this)
      }),
    }
    return record
  }

  // 默认 botRecord
  let currentBotRecord = createMockBotRecord()

  // mock workflow app 数据
  const mockWorkflowApp = {
    appId: TEST_APP_ID,
    appName: '测试工作流插件',
    appDescription: '测试用',
    createdAt: new Date(),
    createdBy: 'user@test.com',
  }

  const mockWorkflowApp2 = {
    appId: TEST_APP_ID_2,
    appName: '测试工作流插件2',
    appDescription: '测试用2',
    createdAt: new Date(),
    createdBy: 'user@test.com',
  }

  const mockWorkflowAppData = {
    ofAppId: TEST_APP_ID,
    version: 'v1.0.0',
    publishDescription: '首次发布',
    publishAt: new Date(),
    publishBy: 'user@test.com',
    lastUpdateAt: new Date(),
    nodes: [],
    edges: [],
    envs: [],
  }

  const mockWorkflowAppData2 = {
    ofAppId: TEST_APP_ID_2,
    version: 'v2.0.0',
    publishDescription: '第二次发布',
    publishAt: new Date(),
    publishBy: 'user@test.com',
    lastUpdateAt: new Date(),
    nodes: [],
    edges: [],
    envs: [],
  }

  // ---------- Mock BotInstance ----------
  function createMockBotInstance(
    overrides?: Partial<{
      runningState: BotRunningState;
    }>,
  ): BotInstance {
    const state = overrides?.runningState ?? BotRunningState.running
    return {
      tag: AdapterTag.napcatWs,
      desc: 'Mock Bot',
      botConfigDB: currentBotRecord as any,
      runningState: vi.fn().mockReturnValue({
        runningState: state,
        bootTime: new Date(),
      }),
      sourceSnapshot: vi.fn().mockReturnValue(null),
      signal: vi.fn(),
    }
  }

  /**
   * 清理 BotCoreRuntimeService 内部的 botInstanceMap
   */
  function clearBotInstanceMap() {
    const map = (botCoreRuntimeService as any).botInstanceMap as Map<
      string,
      BotInstance
    >
    map.clear()
  }

  /**
   * 模拟启动一个 bot 到 running 状态，让绑定操作受到"运行中"限制
   */
  async function startBot() {
    const mockInstance = createMockBotInstance({
      runningState: BotRunningState.running,
    })
    vi.spyOn(botFactoryService, 'createBot').mockResolvedValue(mockInstance)
    await request(app.getHttpServer())
      .post(`/bots/${TEST_BOT_ID}/run`)
      .set('Authorization', `Bearer ${getUserToken()}`)
      .expect(201)
  }

  // ---------- Mock TypeOrmService ----------
  const mockTypeOrmService = {
    ...createBaseMockTypeOrmService(),
    workflowApp: {
      find: vi.fn().mockImplementation(({ where }: any) => {
        // where 可能是数组 [{ appId: 'xxx' }, { appId: 'yyy' }]
        if (Array.isArray(where)) {
          const allApps = [mockWorkflowApp, mockWorkflowApp2]
          return Promise.resolve(
            allApps.filter(a => where.some((w: any) => w.appId === a.appId)),
          )
        }
        return Promise.resolve([mockWorkflowApp])
      }),
      findOne: vi.fn().mockResolvedValue(null),
      save: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue({ affected: 1 }),
    },
    workflowAppData: {
      find: vi.fn().mockImplementation(({ where }: any) => {
        if (Array.isArray(where)) {
          const allData = [mockWorkflowAppData, mockWorkflowAppData2]
          return Promise.resolve(
            allData.filter(d =>
              where.some(
                (w: any) => w.ofAppId === d.ofAppId && w.version === d.version,
              ),
            ),
          )
        }
        return Promise.resolve([])
      }),
      findOne: vi.fn().mockResolvedValue(null),
      save: vi.fn().mockResolvedValue({}),
      count: vi.fn().mockResolvedValue(0),
    },
    botRecord: {
      find: vi.fn().mockResolvedValue([currentBotRecord]),
      findOne: vi.fn().mockImplementation(({ where }: any) => {
        if (where.botId === TEST_BOT_ID)
          return Promise.resolve(currentBotRecord)
        return Promise.resolve(null)
      }),
      findOneBy: vi.fn().mockImplementation((where: any) => {
        if (where.botId === TEST_BOT_ID)
          return Promise.resolve(currentBotRecord)
        return Promise.resolve(null)
      }),
      save: vi.fn().mockImplementation((data: any) => {
        return Promise.resolve({ ...currentBotRecord, ...data })
      }),
    },
  }

  // ---------- 测试生命周期 ----------
  beforeAll(async () => {
    const ctx = await createE2EApp(mockTypeOrmService)
    app = ctx.app
    botFactoryService = ctx.module.get<BotFactoryService>(BotFactoryService)
    botCoreRuntimeService = ctx.module.get<BotCoreRuntimeService>(
      BotCoreRuntimeService,
    )

    const tokenFactory = createTokenFactory(ctx.jwtService)
    getUserToken = () => tokenFactory.getUserToken()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    clearBotInstanceMap()
    // 每个测试前重建全新的 botRecord，保证测试间隔离
    currentBotRecord = createMockBotRecord()

    // 重置 botRecord mock 默认行为
    mockTypeOrmService.botRecord.find.mockResolvedValue([currentBotRecord])
    mockTypeOrmService.botRecord.findOne.mockImplementation(
      ({ where }: any) => {
        if (where.botId === TEST_BOT_ID)
          return Promise.resolve(currentBotRecord)
        return Promise.resolve(null)
      },
    )
    mockTypeOrmService.botRecord.findOneBy.mockImplementation((where: any) => {
      if (where.botId === TEST_BOT_ID)
        return Promise.resolve(currentBotRecord)
      return Promise.resolve(null)
    })
  })

  // ========== POST /bot-bridge/:botId/bindmany - 批量绑定插件 ==========
  describe('POST /bot-bridge/:botId/bindmany', () => {
    it('Bot 停止时应当成功绑定单个插件', async () => {
      const res = await request(app.getHttpServer())
        .post(`/bot-bridge/${TEST_BOT_ID}/bindmany`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send([{ appId: TEST_APP_ID, appVersion: 'v1.0.0' }])
        .expect(201)

      expect(res.body.statusCode).toBe(Code.Ok)
      // 验证 botRecord.save 被调用
      expect(currentBotRecord.save).toHaveBeenCalled()
      // 验证绑定被写入 commonAdapterConfig
      expect(
        currentBotRecord.commonAdapterConfig.bindingWorkflowApp.length,
      ).toBe(1)
      expect(
        currentBotRecord.commonAdapterConfig.bindingWorkflowApp[0].appId,
      ).toBe(TEST_APP_ID)
      expect(
        currentBotRecord.commonAdapterConfig.bindingWorkflowApp[0].version,
      ).toBe('v1.0.0')
      // 每条绑定都应有唯一 bindingId
      expect(
        currentBotRecord.commonAdapterConfig.bindingWorkflowApp[0].bindingId,
      ).toBeDefined()
    })

    it('Bot 停止时应当成功批量绑定多个插件', async () => {
      const res = await request(app.getHttpServer())
        .post(`/bot-bridge/${TEST_BOT_ID}/bindmany`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send([
          { appId: TEST_APP_ID, appVersion: 'v1.0.0' },
          { appId: TEST_APP_ID_2, appVersion: 'v2.0.0' },
        ])
        .expect(201)

      expect(res.body.statusCode).toBe(Code.Ok)
      expect(
        currentBotRecord.commonAdapterConfig.bindingWorkflowApp.length,
      ).toBe(2)
      // 两条绑定的 bindingId 应不同
      const ids = currentBotRecord.commonAdapterConfig.bindingWorkflowApp.map(
        (b: any) => b.bindingId,
      )
      expect(new Set(ids).size).toBe(2)
    })

    it('应当允许将相同 appId 的相同版本多次绑定', async () => {
      // 第一次绑定
      await request(app.getHttpServer())
        .post(`/bot-bridge/${TEST_BOT_ID}/bindmany`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send([{ appId: TEST_APP_ID, appVersion: 'v1.0.0' }])
        .expect(201)

      // 第二次绑定相同 appId + version
      await request(app.getHttpServer())
        .post(`/bot-bridge/${TEST_BOT_ID}/bindmany`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send([{ appId: TEST_APP_ID, appVersion: 'v1.0.0' }])
        .expect(201)

      expect(
        currentBotRecord.commonAdapterConfig.bindingWorkflowApp.length,
      ).toBe(2)
      // 两条记录 appId 相同但 bindingId 不同
      const bindings = currentBotRecord.commonAdapterConfig.bindingWorkflowApp
      expect(bindings[0].appId).toBe(bindings[1].appId)
      expect(bindings[0].bindingId).not.toBe(bindings[1].bindingId)
    })

    it('绑定 draft 版本时应当返回 400 错误', async () => {
      const res = await request(app.getHttpServer())
        .post(`/bot-bridge/${TEST_BOT_ID}/bindmany`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send([{ appId: TEST_APP_ID, appVersion: 'draft' }])

      // CommError 被 CommErrorExceptionFilter 捕获，HTTP 状态码 400
      expect(res.status).toBe(400)
      expect(res.body.statusCode).toBe(Code.BadRequest)
      // 绑定列表应该为空（没有成功写入）
      expect(
        currentBotRecord.commonAdapterConfig.bindingWorkflowApp.length,
      ).toBe(0)
    })

    it('批量绑定中包含 draft 版本时应当全部拒绝', async () => {
      const res = await request(app.getHttpServer())
        .post(`/bot-bridge/${TEST_BOT_ID}/bindmany`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send([
          { appId: TEST_APP_ID, appVersion: 'v1.0.0' },
          { appId: TEST_APP_ID_2, appVersion: 'draft' },
        ])

      expect(res.status).toBe(400)
      // 所有绑定都不应被写入
      expect(
        currentBotRecord.commonAdapterConfig.bindingWorkflowApp.length,
      ).toBe(0)
    })

    it('Bot 运行中绑定应当返回 400 错误', async () => {
      await startBot()

      const res = await request(app.getHttpServer())
        .post(`/bot-bridge/${TEST_BOT_ID}/bindmany`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send([{ appId: TEST_APP_ID, appVersion: 'v1.0.0' }])

      expect(res.status).toBe(400)
      expect(res.body.statusCode).toBe(Code.BadRequest)
    })

    it('Bot 记录不存在时应当返回错误', async () => {
      const res = await request(app.getHttpServer())
        .post('/bot-bridge/non-existent-bot/bindmany')
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send([{ appId: TEST_APP_ID, appVersion: 'v1.0.0' }])

      // 由于 botRecord.findOne 对不存在的ID返回null，
      // getRecordOrThrow 会抛出 CommError(NotFound)
      expect(res.status).toBe(400)
    })

    it('未认证时应返回 401', async () => {
      const res = await request(app.getHttpServer())
        .post(`/bot-bridge/${TEST_BOT_ID}/bindmany`)
        .send([{ appId: TEST_APP_ID, appVersion: 'v1.0.0' }])
      expect(res.status).toBe(401)
    })
  })

  // ========== POST /bot-bridge/:botId/unbindmany - 批量解绑插件 ==========
  describe('POST /bot-bridge/:botId/unbindmany', () => {
    it('Bot 停止时应当成功解绑指定插件', async () => {
      // 先在 botRecord 中预置绑定数据
      currentBotRecord.commonAdapterConfig.bindingWorkflowApp = [
        { appId: TEST_APP_ID, version: 'v1.0.0', bindingId: TEST_BINDING_ID },
        {
          appId: TEST_APP_ID_2,
          version: 'v2.0.0',
          bindingId: TEST_BINDING_ID_2,
        },
      ]

      const res = await request(app.getHttpServer())
        .post(`/bot-bridge/${TEST_BOT_ID}/unbindmany`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ bindingIds: [TEST_BINDING_ID] })
        .expect(201)

      expect(res.body.statusCode).toBe(Code.Ok)
      expect(currentBotRecord.save).toHaveBeenCalled()
      // 只剩下 binding-id-002
      expect(
        currentBotRecord.commonAdapterConfig.bindingWorkflowApp.length,
      ).toBe(1)
      expect(
        currentBotRecord.commonAdapterConfig.bindingWorkflowApp[0].bindingId,
      ).toBe(TEST_BINDING_ID_2)
    })

    it('应当支持批量解绑多个插件', async () => {
      currentBotRecord.commonAdapterConfig.bindingWorkflowApp = [
        { appId: TEST_APP_ID, version: 'v1.0.0', bindingId: TEST_BINDING_ID },
        {
          appId: TEST_APP_ID_2,
          version: 'v2.0.0',
          bindingId: TEST_BINDING_ID_2,
        },
      ]

      const res = await request(app.getHttpServer())
        .post(`/bot-bridge/${TEST_BOT_ID}/unbindmany`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ bindingIds: [TEST_BINDING_ID, TEST_BINDING_ID_2] })
        .expect(201)

      expect(res.body.statusCode).toBe(Code.Ok)
      expect(
        currentBotRecord.commonAdapterConfig.bindingWorkflowApp.length,
      ).toBe(0)
    })

    it('解绑不存在的 bindingId 应当静默成功', async () => {
      currentBotRecord.commonAdapterConfig.bindingWorkflowApp = [
        { appId: TEST_APP_ID, version: 'v1.0.0', bindingId: TEST_BINDING_ID },
      ]

      const res = await request(app.getHttpServer())
        .post(`/bot-bridge/${TEST_BOT_ID}/unbindmany`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ bindingIds: ['non-existent-binding-id'] })
        .expect(201)

      expect(res.body.statusCode).toBe(Code.Ok)
      // 原有绑定不受影响
      expect(
        currentBotRecord.commonAdapterConfig.bindingWorkflowApp.length,
      ).toBe(1)
    })

    it('Bot 运行中解绑应当返回 400 错误', async () => {
      currentBotRecord.commonAdapterConfig.bindingWorkflowApp = [
        { appId: TEST_APP_ID, version: 'v1.0.0', bindingId: TEST_BINDING_ID },
      ]

      await startBot()

      const res = await request(app.getHttpServer())
        .post(`/bot-bridge/${TEST_BOT_ID}/unbindmany`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ bindingIds: [TEST_BINDING_ID] })

      expect(res.status).toBe(400)
      expect(res.body.statusCode).toBe(Code.BadRequest)
    })

    it('未认证时应返回 401', async () => {
      const res = await request(app.getHttpServer())
        .post(`/bot-bridge/${TEST_BOT_ID}/unbindmany`)
        .send({ bindingIds: [TEST_BINDING_ID] })
      expect(res.status).toBe(401)
    })
  })

  // ========== GET /bot-bridge/:botId/binding - 获取绑定列表 ==========
  describe('GET /bot-bridge/:botId/binding', () => {
    it('没有绑定时应当返回空数组', async () => {
      // botRecord 没有 bindingWorkflowApp 或为空 → getBindingsInfo 返回 null
      const res = await request(app.getHttpServer())
        .get(`/bot-bridge/${TEST_BOT_ID}/binding`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(200)

      expect(res.body.statusCode).toBe(Code.Ok)
      expect(res.body.data).toEqual([])
    })

    it('有绑定时应当返回绑定列表及关联的 app 信息', async () => {
      currentBotRecord.commonAdapterConfig.bindingWorkflowApp = [
        { appId: TEST_APP_ID, version: 'v1.0.0', bindingId: TEST_BINDING_ID },
      ]

      const res = await request(app.getHttpServer())
        .get(`/bot-bridge/${TEST_BOT_ID}/binding`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(200)

      expect(res.body.statusCode).toBe(Code.Ok)
      expect(Array.isArray(res.body.data)).toBe(true)
      expect(res.body.data.length).toBe(1)
      expect(res.body.data[0]).toHaveProperty('appId', TEST_APP_ID)
      expect(res.body.data[0]).toHaveProperty('bindingId', TEST_BINDING_ID)
    })

    it('有多个绑定时应当全部返回', async () => {
      currentBotRecord.commonAdapterConfig.bindingWorkflowApp = [
        { appId: TEST_APP_ID, version: 'v1.0.0', bindingId: TEST_BINDING_ID },
        {
          appId: TEST_APP_ID_2,
          version: 'v2.0.0',
          bindingId: TEST_BINDING_ID_2,
        },
      ]

      const res = await request(app.getHttpServer())
        .get(`/bot-bridge/${TEST_BOT_ID}/binding`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(200)

      expect(res.body.statusCode).toBe(Code.Ok)
      expect(res.body.data.length).toBe(2)
    })

    it('未认证时应返回 401', async () => {
      const res = await request(app.getHttpServer()).get(
        `/bot-bridge/${TEST_BOT_ID}/binding`,
      )
      expect(res.status).toBe(401)
    })
  })

  // ========== GET /bot-bridge/:botId/bindingconfig/:bindingId - 获取绑定配置 ==========
  describe('GET /bot-bridge/:botId/bindingconfig/:bindingId', () => {
    it('绑定存在且有配置时应当返回配置', async () => {
      const testConfig = { envKV: { key1: 'value1', key2: 'value2' } }
      currentBotRecord.commonAdapterConfig.bindingWorkflowApp = [
        {
          appId: TEST_APP_ID,
          version: 'v1.0.0',
          bindingId: TEST_BINDING_ID,
          bindingConfig: testConfig,
        },
      ]

      const res = await request(app.getHttpServer())
        .get(`/bot-bridge/${TEST_BOT_ID}/bindingconfig/${TEST_BINDING_ID}`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(200)

      expect(res.body.statusCode).toBe(Code.Ok)
      expect(res.body.data).toHaveProperty('envKV')
      expect(res.body.data.envKV.key1).toBe('value1')
    })

    it('绑定不存在时应当返回 NotFound', async () => {
      currentBotRecord.commonAdapterConfig.bindingWorkflowApp = []

      const res = await request(app.getHttpServer())
        .get(`/bot-bridge/${TEST_BOT_ID}/bindingconfig/non-existent-id`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(200)

      expect(res.body.statusCode).toBe(Code.NotFound)
    })

    it('未认证时应返回 401', async () => {
      const res = await request(app.getHttpServer()).get(
        `/bot-bridge/${TEST_BOT_ID}/bindingconfig/${TEST_BINDING_ID}`,
      )
      expect(res.status).toBe(401)
    })
  })

  // ========== POST /bot-bridge/:botId/bindingconfig/:bindingId - 设置绑定配置 ==========
  describe('POST /bot-bridge/:botId/bindingconfig/:bindingId', () => {
    it('Bot 停止时应当成功设置绑定配置', async () => {
      currentBotRecord.commonAdapterConfig.bindingWorkflowApp = [
        { appId: TEST_APP_ID, version: 'v1.0.0', bindingId: TEST_BINDING_ID },
      ]

      const res = await request(app.getHttpServer())
        .post(`/bot-bridge/${TEST_BOT_ID}/bindingconfig/${TEST_BINDING_ID}`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ envKV: { myKey: 'myValue' } })
        .expect(201)

      expect(res.body.statusCode).toBe(Code.Ok)
      expect(currentBotRecord.save).toHaveBeenCalled()
    })

    it('应当支持 merge 更新配置', async () => {
      currentBotRecord.commonAdapterConfig.bindingWorkflowApp = [
        {
          appId: TEST_APP_ID,
          version: 'v1.0.0',
          bindingId: TEST_BINDING_ID,
          bindingConfig: { envKV: { existingKey: 'existingValue' } },
        },
      ]

      await request(app.getHttpServer())
        .post(`/bot-bridge/${TEST_BOT_ID}/bindingconfig/${TEST_BINDING_ID}`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ envKV: { newKey: 'newValue' } })
        .expect(201)

      // merge 后 existingKey 和 newKey 应该都存在
      const binding
        = currentBotRecord.commonAdapterConfig.bindingWorkflowApp[0]
      expect(binding.bindingConfig.envKV).toHaveProperty(
        'existingKey',
        'existingValue',
      )
      expect(binding.bindingConfig.envKV).toHaveProperty('newKey', 'newValue')
    })

    it('Bot 运行中配置绑定应当返回 400 错误', async () => {
      currentBotRecord.commonAdapterConfig.bindingWorkflowApp = [
        { appId: TEST_APP_ID, version: 'v1.0.0', bindingId: TEST_BINDING_ID },
      ]

      await startBot()

      const res = await request(app.getHttpServer())
        .post(`/bot-bridge/${TEST_BOT_ID}/bindingconfig/${TEST_BINDING_ID}`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ envKV: { key: 'value' } })

      expect(res.status).toBe(400)
      expect(res.body.statusCode).toBe(Code.BadRequest)
    })

    it('配置不存在的 bindingId 应当返回 400 错误', async () => {
      currentBotRecord.commonAdapterConfig.bindingWorkflowApp = []

      const res = await request(app.getHttpServer())
        .post(`/bot-bridge/${TEST_BOT_ID}/bindingconfig/non-existent-id`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ envKV: { key: 'value' } })

      expect(res.status).toBe(400)
      expect(res.body.statusCode).toBe(Code.BadRequest)
    })

    it('未认证时应返回 401', async () => {
      const res = await request(app.getHttpServer())
        .post(`/bot-bridge/${TEST_BOT_ID}/bindingconfig/${TEST_BINDING_ID}`)
        .send({ envKV: { key: 'value' } })
      expect(res.status).toBe(401)
    })
  })

  // ========== 组合场景 ==========
  describe('插件绑定组合场景', () => {
    it('绑定 → 查询 → 解绑 → 查询 完整流程', async () => {
      // 1. 绑定一个插件
      const bindRes = await request(app.getHttpServer())
        .post(`/bot-bridge/${TEST_BOT_ID}/bindmany`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send([{ appId: TEST_APP_ID, appVersion: 'v1.0.0' }])
        .expect(201)
      expect(bindRes.body.statusCode).toBe(Code.Ok)

      // 2. 查询绑定列表 → 应该有 1 个
      const listRes1 = await request(app.getHttpServer())
        .get(`/bot-bridge/${TEST_BOT_ID}/binding`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(200)
      expect(listRes1.body.statusCode).toBe(Code.Ok)
      expect(listRes1.body.data.length).toBe(1)

      const bindingId
        = currentBotRecord.commonAdapterConfig.bindingWorkflowApp[0].bindingId

      // 3. 解绑
      const unbindRes = await request(app.getHttpServer())
        .post(`/bot-bridge/${TEST_BOT_ID}/unbindmany`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ bindingIds: [bindingId] })
        .expect(201)
      expect(unbindRes.body.statusCode).toBe(Code.Ok)

      // 4. 查询绑定列表 → 应该为空
      const listRes2 = await request(app.getHttpServer())
        .get(`/bot-bridge/${TEST_BOT_ID}/binding`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(200)
      expect(listRes2.body.statusCode).toBe(Code.Ok)
      expect(listRes2.body.data).toEqual([])
    })

    it('绑定 → 配置 → 查询配置 完整流程', async () => {
      // 1. 绑定
      await request(app.getHttpServer())
        .post(`/bot-bridge/${TEST_BOT_ID}/bindmany`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send([{ appId: TEST_APP_ID, appVersion: 'v1.0.0' }])
        .expect(201)

      const bindingId
        = currentBotRecord.commonAdapterConfig.bindingWorkflowApp[0].bindingId

      // 2. 设置配置
      await request(app.getHttpServer())
        .post(`/bot-bridge/${TEST_BOT_ID}/bindingconfig/${bindingId}`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ envKV: { dbHost: 'localhost', dbPort: '3306' } })
        .expect(201)

      // 3. 查询配置
      const cfgRes = await request(app.getHttpServer())
        .get(`/bot-bridge/${TEST_BOT_ID}/bindingconfig/${bindingId}`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(200)

      expect(cfgRes.body.statusCode).toBe(Code.Ok)
      expect(cfgRes.body.data.envKV.dbHost).toBe('localhost')
      expect(cfgRes.body.data.envKV.dbPort).toBe('3306')
    })

    it('Bot 运行中绑定 / 解绑 / 配置都应被拒绝', async () => {
      currentBotRecord.commonAdapterConfig.bindingWorkflowApp = [
        { appId: TEST_APP_ID, version: 'v1.0.0', bindingId: TEST_BINDING_ID },
      ]

      await startBot()

      // 绑定被拒绝
      const bindRes = await request(app.getHttpServer())
        .post(`/bot-bridge/${TEST_BOT_ID}/bindmany`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send([{ appId: TEST_APP_ID_2, appVersion: 'v2.0.0' }])
      expect(bindRes.status).toBe(400)

      // 解绑被拒绝
      const unbindRes = await request(app.getHttpServer())
        .post(`/bot-bridge/${TEST_BOT_ID}/unbindmany`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ bindingIds: [TEST_BINDING_ID] })
      expect(unbindRes.status).toBe(400)

      // 配置被拒绝
      const cfgRes = await request(app.getHttpServer())
        .post(`/bot-bridge/${TEST_BOT_ID}/bindingconfig/${TEST_BINDING_ID}`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ envKV: { key: 'value' } })
      expect(cfgRes.status).toBe(400)
    })

    it('批量绑定多个插件后逐一解绑应正确', async () => {
      // 绑定 2 个插件
      await request(app.getHttpServer())
        .post(`/bot-bridge/${TEST_BOT_ID}/bindmany`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send([
          { appId: TEST_APP_ID, appVersion: 'v1.0.0' },
          { appId: TEST_APP_ID_2, appVersion: 'v2.0.0' },
        ])
        .expect(201)

      expect(
        currentBotRecord.commonAdapterConfig.bindingWorkflowApp.length,
      ).toBe(2)

      const bindingIdFirst
        = currentBotRecord.commonAdapterConfig.bindingWorkflowApp[0].bindingId
      const bindingIdSecond
        = currentBotRecord.commonAdapterConfig.bindingWorkflowApp[1].bindingId

      // 解绑第一个
      await request(app.getHttpServer())
        .post(`/bot-bridge/${TEST_BOT_ID}/unbindmany`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ bindingIds: [bindingIdFirst] })
        .expect(201)

      expect(
        currentBotRecord.commonAdapterConfig.bindingWorkflowApp.length,
      ).toBe(1)
      expect(
        currentBotRecord.commonAdapterConfig.bindingWorkflowApp[0].bindingId,
      ).toBe(bindingIdSecond)

      // 解绑第二个
      await request(app.getHttpServer())
        .post(`/bot-bridge/${TEST_BOT_ID}/unbindmany`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ bindingIds: [bindingIdSecond] })
        .expect(201)

      expect(
        currentBotRecord.commonAdapterConfig.bindingWorkflowApp.length,
      ).toBe(0)
    })

    it('多次 merge 配置应累积更新', async () => {
      currentBotRecord.commonAdapterConfig.bindingWorkflowApp = [
        {
          appId: TEST_APP_ID,
          version: 'v1.0.0',
          bindingId: TEST_BINDING_ID,
          bindingConfig: {},
        },
      ]

      // 第一次配置
      await request(app.getHttpServer())
        .post(`/bot-bridge/${TEST_BOT_ID}/bindingconfig/${TEST_BINDING_ID}`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ envKV: { key1: 'val1' } })
        .expect(201)

      // 第二次配置（追加新 key）
      await request(app.getHttpServer())
        .post(`/bot-bridge/${TEST_BOT_ID}/bindingconfig/${TEST_BINDING_ID}`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({ envKV: { key2: 'val2' } })
        .expect(201)

      const binding
        = currentBotRecord.commonAdapterConfig.bindingWorkflowApp[0]
      expect(binding.bindingConfig.envKV).toHaveProperty('key1', 'val1')
      expect(binding.bindingConfig.envKV).toHaveProperty('key2', 'val2')
    })
  })
})
