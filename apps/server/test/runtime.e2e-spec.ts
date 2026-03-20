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
import { AdapterTag } from '@shared/common/bot/core/adapter'
import { BotRunningState, BotSignal } from '@shared/common/bot/core/status'
import {
  createBaseMockTypeOrmService,
  createE2EApp,
  createTokenFactory,
} from './utils/nest-init'
import { BotFactoryService } from '../src/apps/runtime/bot/core/bot-factory.service'
import { BotCoreRuntimeService } from '../src/apps/runtime/bot/core/bot-core-runtime.service'
import type { BotInstance } from '../src/apps/runtime/bot/adapter/_base'

/**
 * Runtime 端点 E2E 测试
 *
 * 测试控制器：
 *   BotManagerController    - 路由 /bot/record
 *   BotRuntimeController    - 路由 /bot/runtime/:botId
 *
 * Mock：
 *   数据库层（botRecord / workflowApp / workflowAppData 仓库）
 *   BotFactory.createBot（spyOn，控制 bot 实例创建）
 *   BotCoreRuntime.botInstanceMap（直接访问私有属性，控制运行时状态）
 *
 * 覆盖端点：
 *   POST /bot/record/create          - 创建 Bot 记录
 *   GET  /bot/record/list             - 获取 Bot 列表（含运行状态）
 *   POST /bot/runtime/:botId/run       - 启动 Bot（manager → factory → botInstance）
 *   POST /bot/runtime/:botId/stop      - 停止 Bot（manager → botInstance.signal(SIGSTOP)）
 *   POST /bot/runtime/:botId/kill      - 强制终止 Bot（manager → botInstance.signal(SIGKILL)）
 *   POST /bot/runtime/:botId/reload    - 重载 Bot（删除旧实例 → 重新创建）
 *   POST /bot/record/:botId/update    - 更新 Bot 记录（名称与描述）
 *   POST /bot/record/:botId/delete    - 删除 Bot 记录
 */
describe('Runtime BotManager (e2e)', () => {
  let app: INestApplication<App>
  let getUserToken: () => string
  let botFactoryService: BotFactoryService
  let botCoreRuntimeService: BotCoreRuntimeService

  // ---------- Mock 数据 ----------
  const TEST_BOT_ID = 'a7d4d36b-b32b-4276-859d-b9ba52befafe'
  const TEST_BOT_ID_2 = '17daf1c5-07ec-4835-a41d-0e1ced642a70'

  const mockBotRecord = {
    botId: TEST_BOT_ID,
    botName: '测试机器人',
    description: '用于测试的机器人',
    commonAdapterConfig: {},
    adapterTag: AdapterTag.napcatWs,
    adapterConfig: {},
    createdAt: new Date(),
    createdBy: 'user@test.com',
  }

  const mockBotRecord2 = {
    botId: TEST_BOT_ID_2,
    botName: '测试机器人2',
    description: '用于测试的机器人2',
    commonAdapterConfig: {},
    adapterTag: AdapterTag.napcatWs,
    adapterConfig: {},
    createdAt: new Date(),
    createdBy: 'user@test.com',
  }

  // ---------- Mock BotInstance ----------
  function createMockBotInstance(
    overrides?: Partial<{
      runningState: BotRunningState;
      botRecord: any;
    }>,
  ): BotInstance {
    const state = overrides?.runningState ?? BotRunningState.running
    const record = overrides?.botRecord ?? mockBotRecord
    return {
      tag: AdapterTag.napcatWs,
      desc: 'Mock Bot',
      botConfigDB: record as any,
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
   * 因为 botInstanceMap 是 private 的，通过访问私有属性来清理
   */
  function clearBotInstanceMap() {
    const map = (botCoreRuntimeService as any).botInstanceMap as Map<
      string,
      BotInstance
    >
    map.clear()
  }

  // ---------- Mock TypeOrmService ----------
  const mockTypeOrmService = {
    ...createBaseMockTypeOrmService(),
    workflowApp: {
      find: vi.fn().mockResolvedValue([]),
      findOne: vi.fn().mockResolvedValue(null),
      save: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue({ affected: 1 }),
    },
    workflowAppData: {
      find: vi.fn().mockResolvedValue([]),
      findOne: vi.fn().mockResolvedValue(null),
      save: vi.fn().mockResolvedValue({}),
      count: vi.fn().mockResolvedValue(0),
    },
    botRecord: {
      find: vi.fn().mockResolvedValue([mockBotRecord]),
      findOne: vi.fn().mockImplementation(({ where }: any) => {
        if (where.botId === TEST_BOT_ID) return Promise.resolve(mockBotRecord)
        if (where.botId === TEST_BOT_ID_2)
          return Promise.resolve(mockBotRecord2)
        return Promise.resolve(null)
      }),
      findOneBy: vi.fn().mockImplementation((where: any) => {
        if (where.botId === TEST_BOT_ID) return Promise.resolve(mockBotRecord)
        if (where.botId === TEST_BOT_ID_2)
          return Promise.resolve(mockBotRecord2)
        return Promise.resolve(null)
      }),
      save: vi.fn().mockImplementation((data: any) => {
        return Promise.resolve({
          ...mockBotRecord,
          ...data,
          botId: TEST_BOT_ID,
        })
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
    // 每个测试前清理 runtime 中的 bot 实例 map，避免测试间干扰
    clearBotInstanceMap()

    // 重置 botRecord mock 默认行为
    mockTypeOrmService.botRecord.find.mockResolvedValue([mockBotRecord])
    mockTypeOrmService.botRecord.findOne.mockImplementation(
      ({ where }: any) => {
        if (where.botId === TEST_BOT_ID) return Promise.resolve(mockBotRecord)
        if (where.botId === TEST_BOT_ID_2)
          return Promise.resolve(mockBotRecord2)
        return Promise.resolve(null)
      },
    )
    mockTypeOrmService.botRecord.findOneBy.mockImplementation((where: any) => {
      if (where.botId === TEST_BOT_ID) return Promise.resolve(mockBotRecord)
      if (where.botId === TEST_BOT_ID_2) return Promise.resolve(mockBotRecord2)
      return Promise.resolve(null)
    })
    mockTypeOrmService.botRecord.save.mockImplementation((data: any) => {
      return Promise.resolve({
        ...mockBotRecord,
        ...data,
        botId: TEST_BOT_ID,
      })
    })
  })

  // ========== POST /bot/record/create ==========
  describe('POST /bot/record/create', () => {
    it('应当成功创建 Bot 记录', async () => {
      const res = await request(app.getHttpServer())
        .post('/bot/record/create')
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({
          name: '新机器人',
          description: '新机器人描述',
          commonConfig: {},
          adapterTag: AdapterTag.napcatWs,
          adapterConfig: {},
        })
        .expect(201)

      expect(res.body.statusCode).toBe(Code.Ok)
      expect(res.body.data.botId).toBeDefined()
      expect(mockTypeOrmService.botRecord.save).toHaveBeenCalledWith(
        expect.objectContaining({
          botName: '新机器人',
          description: '新机器人描述',
          adapterTag: AdapterTag.napcatWs,
        }),
      )
    })

    it('未认证时应返回 401', async () => {
      const res = await request(app.getHttpServer()).post('/bot/record/create').send({
        name: '新机器人',
        description: '新机器人描述',
        commonConfig: {},
        adapterTag: AdapterTag.napcatWs,
        adapterConfig: {},
      })
      expect(res.status).toBe(401)
    })
  })

  // ========== GET /bot/record/list ==========
  describe('GET /bot/record/list', () => {
    it('应当返回 Bot 列表', async () => {
      const res = await request(app.getHttpServer())
        .get('/bot/record/list')
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(200)

      expect(res.body.statusCode).toBe(Code.Ok)
      expect(Array.isArray(res.body.data)).toBe(true)
    })

    it('未认证时应返回 401', async () => {
      const res = await request(app.getHttpServer()).get('/bot/record/list')
      expect(res.status).toBe(401)
    })

    it('应支持 isRunning + adapterTag 组合筛选', async () => {
      mockTypeOrmService.botRecord.find.mockResolvedValue([
        mockBotRecord,
        mockBotRecord2,
      ])

      const runningInstance = createMockBotInstance({
        botRecord: mockBotRecord,
      })
      vi.spyOn(botFactoryService, 'createBot').mockResolvedValue(
        runningInstance,
      )

      // 仅启动第一个 bot，第二个保持 stopped
      await request(app.getHttpServer())
        .post(`/bot/runtime/${TEST_BOT_ID}/run`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(201)

      const res = await request(app.getHttpServer())
        .get('/bot/record/list')
        .query({ isRunning: true, adapterTag: 'napcatWs' })
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(200)

      expect(res.body.statusCode).toBe(Code.Ok)
      expect(Array.isArray(res.body.data)).toBe(true)
      expect(res.body.data.length).toBe(1)
      expect(res.body.data[0]).toHaveProperty('botId', TEST_BOT_ID)
    })
  })

  // ========== POST /bot/runtime/:botId/run - 核心：Manager 创建 Bot 实例 ==========
  describe('POST /bot/runtime/:botId/run', () => {
    it('应当通过 factory 创建 bot 实例并存入 runtime', async () => {
      const mockInstance = createMockBotInstance()
      vi.spyOn(botFactoryService, 'createBot').mockResolvedValue(mockInstance)

      const res = await request(app.getHttpServer())
        .post(`/bot/runtime/${TEST_BOT_ID}/run`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(201)

      expect(res.body.statusCode).toBe(Code.Ok)
      // 验证 factory 被调用创建 bot
      expect(botFactoryService.createBot).toHaveBeenCalledWith(TEST_BOT_ID)
    })

    it('bot 已运行时不应重复创建', async () => {
      // 先创建一个运行中的实例
      const mockInstance = createMockBotInstance({
        runningState: BotRunningState.running,
      })
      vi.spyOn(botFactoryService, 'createBot').mockResolvedValue(mockInstance)

      // 第一次启动
      await request(app.getHttpServer())
        .post(`/bot/runtime/${TEST_BOT_ID}/run`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(201)

      // 第二次启动 - 因为已经 running，不应再次调用 factory
      await request(app.getHttpServer())
        .post(`/bot/runtime/${TEST_BOT_ID}/run`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(201)

      // factory 只被调用一次
      expect(botFactoryService.createBot).toHaveBeenCalledTimes(1)
    })

    it('未认证时应返回 401', async () => {
      const res = await request(app.getHttpServer()).post(
        `/bot/runtime/${TEST_BOT_ID}/run`,
      )
      expect(res.status).toBe(401)
    })
  })

  // ========== POST /bot/runtime/:botId/stop - 核心：Manager → BotInstance.signal(SIGSTOP) ==========
  describe('POST /bot/runtime/:botId/stop', () => {
    it('应当向 bot 实例发送 SIGSTOP 信号', async () => {
      // 先启动 bot
      const mockInstance = createMockBotInstance()
      vi.spyOn(botFactoryService, 'createBot').mockResolvedValue(mockInstance)

      await request(app.getHttpServer())
        .post(`/bot/runtime/${TEST_BOT_ID}/run`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(201)

      // 发送 stop 指令
      const res = await request(app.getHttpServer())
        .post(`/bot/runtime/${TEST_BOT_ID}/stop`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(201)

      expect(res.body.statusCode).toBe(Code.Ok)
      // 核心验证：signal(SIGSTOP) 被调用
      expect(mockInstance.signal).toHaveBeenCalledWith(BotSignal.SIGSTOP)
    })

    it('bot 不存在于 runtime 时 stop 应当静默成功', async () => {
      const res = await request(app.getHttpServer())
        .post('/bot/runtime/non-existent-bot/stop')
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(201)

      expect(res.body.statusCode).toBe(Code.Ok)
    })
  })

  // ========== POST /bot/runtime/:botId/kill - 核心：Manager → BotInstance.signal(SIGKILL) ==========
  describe('POST /bot/runtime/:botId/kill', () => {
    it('应当向 bot 实例发送 SIGKILL 信号', async () => {
      // 先启动 bot
      const mockInstance = createMockBotInstance()
      vi.spyOn(botFactoryService, 'createBot').mockResolvedValue(mockInstance)

      await request(app.getHttpServer())
        .post(`/bot/runtime/${TEST_BOT_ID}/run`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(201)

      // 发送 kill 指令
      const res = await request(app.getHttpServer())
        .post(`/bot/runtime/${TEST_BOT_ID}/kill`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(201)

      expect(res.body.statusCode).toBe(Code.Ok)
      // 核心验证：signal(SIGKILL) 被调用
      expect(mockInstance.signal).toHaveBeenCalledWith(BotSignal.SIGKILL)
    })

    it('bot 不存在于 runtime 时 kill 应当静默成功', async () => {
      const res = await request(app.getHttpServer())
        .post('/bot/runtime/non-existent-bot/kill')
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(201)

      expect(res.body.statusCode).toBe(Code.Ok)
    })
  })

  // ========== POST /bot/runtime/:botId/reload - 核心：正在运行的 bot reload 无作用，已停止的 bot 才会重新创建 ==========
  describe('POST /bot/runtime/:botId/reload', () => {
    it('bot 正在运行时 reload 不应有任何作用', async () => {
      const runningInstance = createMockBotInstance({
        runningState: BotRunningState.running,
      })

      const createBotSpy = vi.spyOn(botFactoryService, 'createBot')
      createBotSpy.mockResolvedValueOnce(runningInstance)

      // 先启动 bot
      await request(app.getHttpServer())
        .post(`/bot/runtime/${TEST_BOT_ID}/run`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(201)

      expect(createBotSpy).toHaveBeenCalledTimes(1)

      // 执行 reload - 因为 bot 正在运行，reload 不应有任何作用
      const res = await request(app.getHttpServer())
        .post(`/bot/runtime/${TEST_BOT_ID}/reload`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(201)

      expect(res.body.statusCode).toBe(Code.Ok)
      // factory 不应被再次调用（仍然只有启动时的1次）
      expect(createBotSpy).toHaveBeenCalledTimes(1)
    })

    it('bot 已停止时 reload 应当删除旧实例并重新创建', async () => {
      const stoppedInstance = createMockBotInstance({
        runningState: BotRunningState.stopped,
      })
      const newInstance = createMockBotInstance()

      const createBotSpy = vi.spyOn(botFactoryService, 'createBot')
      createBotSpy.mockResolvedValueOnce(stoppedInstance)
      createBotSpy.mockResolvedValueOnce(newInstance)

      // 先启动 bot（模拟一个已停止的实例）
      await request(app.getHttpServer())
        .post(`/bot/runtime/${TEST_BOT_ID}/run`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(201)

      expect(createBotSpy).toHaveBeenCalledTimes(1)

      // 执行 reload - 因为 bot 已停止，应当删除旧实例并重新创建
      const res = await request(app.getHttpServer())
        .post(`/bot/runtime/${TEST_BOT_ID}/reload`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(201)

      expect(res.body.statusCode).toBe(Code.Ok)
      // reload 后 factory 应被再次调用（总共2次）
      expect(createBotSpy).toHaveBeenCalledTimes(2)
      expect(createBotSpy).toHaveBeenLastCalledWith(TEST_BOT_ID)
    })

    it('bot 不存在于 runtime 时 reload 应当创建新实例', async () => {
      const mockInstance = createMockBotInstance()
      vi.spyOn(botFactoryService, 'createBot').mockResolvedValue(mockInstance)

      const res = await request(app.getHttpServer())
        .post(`/bot/runtime/${TEST_BOT_ID}/reload`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(201)

      expect(res.body.statusCode).toBe(Code.Ok)
      expect(botFactoryService.createBot).toHaveBeenCalledWith(TEST_BOT_ID)
    })
  })

  // ========== POST /bot/record/:botId/update ==========
  describe('POST /bot/record/:botId/update', () => {
    it('应当成功更新 Bot 的名称和描述', async () => {
      const res = await request(app.getHttpServer())
        .post(`/bot/record/${TEST_BOT_ID}/update`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({
          name: '更新后的机器人名称',
          description: '更新后的机器人描述',
        })
        .expect(201)

      expect(res.body.statusCode).toBe(Code.Ok)
      expect(mockTypeOrmService.botRecord.findOne).toHaveBeenCalledWith({
        where: { botId: TEST_BOT_ID },
      })
      expect(mockTypeOrmService.botRecord.save).toHaveBeenCalledWith(
        expect.objectContaining({
          botName: '更新后的机器人名称',
          description: '更新后的机器人描述',
        }),
      )
    })

    it('Bot 记录不存在时应返回 NotFound 错误', async () => {
      mockTypeOrmService.botRecord.findOne.mockResolvedValueOnce(null)

      const res = await request(app.getHttpServer())
        .post('/bot/record/non-existent-bot/update')
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({
          name: '任意名称',
          description: '任意描述',
        })
        .expect(400)

      expect(res.body.statusCode).toBe(Code.NotFound)
    })

    it('缺少 botName 字段时应返回参数校验错误', async () => {
      const res = await request(app.getHttpServer())
        .post(`/bot/record/${TEST_BOT_ID}/update`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({
          description: '只有描述没有名称',
        })

      expect(res.body.statusCode).toBe(Code.BadRequest)
    })

    it('缺少 description 字段时应返回参数校验错误', async () => {
      const res = await request(app.getHttpServer())
        .post(`/bot/record/${TEST_BOT_ID}/update`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({
          name: '只有名称没有描述',
        })

      expect(res.body.statusCode).toBe(Code.BadRequest)
    })

    it('未认证时应返回 401', async () => {
      const res = await request(app.getHttpServer())
        .post(`/bot/record/${TEST_BOT_ID}/update`)
        .send({
          botName: '新名称',
          description: '新描述',
        })
      expect(res.status).toBe(401)
    })
  })

  // ========== 指令组合场景 ==========
  describe('Manager → Bot 指令组合场景', () => {
    it('run → stop → run 应当完整走完生命周期', async () => {
      // 第一个实例 running → stop 后变为 stopped
      const instance1 = createMockBotInstance({
        runningState: BotRunningState.running,
      })
      // stop 之后将状态改为 stopped，这样下次 run 会重新创建
      const instance2 = createMockBotInstance({
        runningState: BotRunningState.running,
      })

      const createBotSpy = vi.spyOn(botFactoryService, 'createBot')
      createBotSpy.mockResolvedValueOnce(instance1)
      createBotSpy.mockResolvedValueOnce(instance2)

      // 1. 启动 bot
      await request(app.getHttpServer())
        .post(`/bot/runtime/${TEST_BOT_ID}/run`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(201)

      // 2. 停止 bot - signal(SIGSTOP) 被发送
      await request(app.getHttpServer())
        .post(`/bot/runtime/${TEST_BOT_ID}/stop`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(201)
      expect(instance1.signal).toHaveBeenCalledWith(BotSignal.SIGSTOP);

      // 模拟 stop 后状态变为非 running（实际 adapter 中 signal 会改变内部状态）
      (instance1.runningState as any) = vi.fn().mockReturnValue({
        runningState: BotRunningState.stopped,
      })

      // 3. 再次启动 bot - 因为已 stopped，应重新创建
      await request(app.getHttpServer())
        .post(`/bot/runtime/${TEST_BOT_ID}/run`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(201)

      expect(createBotSpy).toHaveBeenCalledTimes(2)
    })

    it('run → kill 应当发送 SIGKILL 信号', async () => {
      const mockInstance = createMockBotInstance()
      vi.spyOn(botFactoryService, 'createBot').mockResolvedValue(mockInstance)

      // 启动
      await request(app.getHttpServer())
        .post(`/bot/runtime/${TEST_BOT_ID}/run`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(201)

      // kill
      await request(app.getHttpServer())
        .post(`/bot/runtime/${TEST_BOT_ID}/kill`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(201)

      expect(mockInstance.signal).toHaveBeenCalledWith(BotSignal.SIGKILL)
      // kill 不应该重新调用 signal 为 SIGSTOP
      expect(mockInstance.signal).not.toHaveBeenCalledWith(BotSignal.SIGSTOP)
    })

    it('run → reload 对正在运行的 bot 不应有任何作用', async () => {
      const runningInstance = createMockBotInstance({
        runningState: BotRunningState.running,
      })

      const createBotSpy = vi.spyOn(botFactoryService, 'createBot')
      createBotSpy.mockResolvedValueOnce(runningInstance)

      // 启动
      await request(app.getHttpServer())
        .post(`/bot/runtime/${TEST_BOT_ID}/run`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(201)

      // reload - bot 正在运行，reload 无任何作用
      await request(app.getHttpServer())
        .post(`/bot/runtime/${TEST_BOT_ID}/reload`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(201)

      // factory 只被调用一次（启动时），reload 不会再次调用
      expect(createBotSpy).toHaveBeenCalledTimes(1)
      // 旧实例也不会收到任何 signal
      expect(runningInstance.signal).not.toHaveBeenCalled()
    })

    it('run → stop → reload 应当删除旧实例并创建新实例', async () => {
      const oldInstance = createMockBotInstance({
        runningState: BotRunningState.running,
      })
      const newInstance = createMockBotInstance()

      const createBotSpy = vi.spyOn(botFactoryService, 'createBot')
      createBotSpy.mockResolvedValueOnce(oldInstance)
      createBotSpy.mockResolvedValueOnce(newInstance)

      // 启动
      await request(app.getHttpServer())
        .post(`/bot/runtime/${TEST_BOT_ID}/run`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(201)

      // 停止 bot
      await request(app.getHttpServer())
        .post(`/bot/runtime/${TEST_BOT_ID}/stop`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(201)

      expect(oldInstance.signal).toHaveBeenCalledWith(BotSignal.SIGSTOP);

      // 模拟 stop 后状态变为 stopped
      (oldInstance.runningState as any) = vi.fn().mockReturnValue({
        runningState: BotRunningState.stopped,
      })

      // reload - bot 已停止，应当删除旧实例并创建新实例
      await request(app.getHttpServer())
        .post(`/bot/runtime/${TEST_BOT_ID}/reload`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(201)

      // factory 被调用两次（启动 + reload）
      expect(createBotSpy).toHaveBeenCalledTimes(2)
    })

    it('多个 bot 实例的指令应当互不影响', async () => {
      mockTypeOrmService.botRecord.find.mockResolvedValue([
        mockBotRecord,
        mockBotRecord2,
      ])

      const instance1 = createMockBotInstance({ botRecord: mockBotRecord })
      const instance2 = createMockBotInstance({ botRecord: mockBotRecord2 })

      const createBotSpy = vi.spyOn(botFactoryService, 'createBot')
      createBotSpy.mockResolvedValueOnce(instance1)
      createBotSpy.mockResolvedValueOnce(instance2)

      // 启动两个 bot
      await request(app.getHttpServer())
        .post(`/bot/runtime/${TEST_BOT_ID}/run`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(201)

      await request(app.getHttpServer())
        .post(`/bot/runtime/${TEST_BOT_ID_2}/run`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(201)

      // 只停止第一个 bot
      await request(app.getHttpServer())
        .post(`/bot/runtime/${TEST_BOT_ID}/stop`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(201)

      // 验证只有 instance1 收到了 SIGSTOP
      expect(instance1.signal).toHaveBeenCalledWith(BotSignal.SIGSTOP)
      expect(instance2.signal).not.toHaveBeenCalled()

      // kill 第二个 bot
      await request(app.getHttpServer())
        .post(`/bot/runtime/${TEST_BOT_ID_2}/kill`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(201)

      // 验证只有 instance2 收到了 SIGKILL
      expect(instance2.signal).toHaveBeenCalledWith(BotSignal.SIGKILL)
      expect(instance1.signal).not.toHaveBeenCalledWith(BotSignal.SIGKILL)
    })
  })
})
