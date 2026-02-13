import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { INestApplication } from '@nestjs/common'
import request from 'supertest'
import type { App } from 'supertest/types'
import { Code } from '@shared/data-transfer/_base'
import { AdapterTag, BotRunningState, BotSignal } from '@shared/common/bot/base'
import { createBaseMockTypeOrmService, createE2EApp, createTokenFactory } from './test-utils'
import { BotFactoryService } from '../src/apps/runtime/bot/core/bot-factory.service'
import { BotCoreRuntimeService } from '../src/apps/runtime/bot/core/bot-core-runtime.service'
import type { BotInstance } from '../src/apps/runtime/bot/adapter/_base'

/**
 * Runtime 端点 E2E 测试
 *
 * 着重测试 Manager 与 Bot 实例的交互部分：
 *   POST /bots/create          - 创建 Bot 记录
 *   GET  /bots/list             - 获取 Bot 列表（含运行状态）
 *   POST /bots/:botId/run       - 启动 Bot（manager → factory → botInstance）
 *   POST /bots/:botId/stop      - 停止 Bot（manager → botInstance.signal(SIGSTOP)）
 *   POST /bots/:botId/kill      - 强制终止 Bot（manager → botInstance.signal(SIGKILL)）
 *   POST /bots/:botId/reload    - 重载 Bot（删除旧实例 → 重新创建）
 */
describe('Runtime BotManager (e2e)', () => {
  let app: INestApplication<App>
  let getUserToken: () => string
  let botFactoryService: BotFactoryService
  let botCoreRuntimeService: BotCoreRuntimeService

  // ---------- Mock 数据 ----------
  const TEST_BOT_ID = 'test-bot-id-001'
  const TEST_BOT_ID_2 = 'test-bot-id-002'

  const mockBotRecord = {
    recordId: TEST_BOT_ID,
    name: '测试机器人',
    description: '用于测试的机器人',
    commonAdapterConfig: {},
    adapterTag: AdapterTag.napcatWs,
    adapterConfig: {},
    createdAt: new Date(),
    createdBy: 'user@test.com',
  }

  const mockBotRecord2 = {
    recordId: TEST_BOT_ID_2,
    name: '测试机器人2',
    description: '用于测试的机器人2',
    commonAdapterConfig: {},
    adapterTag: AdapterTag.napcatWs,
    adapterConfig: {},
    createdAt: new Date(),
    createdBy: 'user@test.com',
  }

  // ---------- Mock BotInstance ----------
  function createMockBotInstance(overrides?: Partial<{
    runningState: BotRunningState
    botRecord: any
  }>): BotInstance {
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
    const map = (botCoreRuntimeService as any).botInstanceMap as Map<string, BotInstance>
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
        if (where.recordId === TEST_BOT_ID) return Promise.resolve(mockBotRecord)
        if (where.recordId === TEST_BOT_ID_2) return Promise.resolve(mockBotRecord2)
        return Promise.resolve(null)
      }),
      findOneBy: vi.fn().mockImplementation((where: any) => {
        if (where.recordId === TEST_BOT_ID) return Promise.resolve(mockBotRecord)
        if (where.recordId === TEST_BOT_ID_2) return Promise.resolve(mockBotRecord2)
        return Promise.resolve(null)
      }),
      save: vi.fn().mockImplementation((data: any) => {
        return Promise.resolve({ ...mockBotRecord, ...data, recordId: TEST_BOT_ID })
      }),
    },
  }

  // ---------- 测试生命周期 ----------
  beforeAll(async () => {
    const ctx = await createE2EApp(mockTypeOrmService)
    app = ctx.app
    botFactoryService = ctx.module.get<BotFactoryService>(BotFactoryService)
    botCoreRuntimeService = ctx.module.get<BotCoreRuntimeService>(BotCoreRuntimeService)

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
    mockTypeOrmService.botRecord.findOne.mockImplementation(({ where }: any) => {
      if (where.recordId === TEST_BOT_ID) return Promise.resolve(mockBotRecord)
      if (where.recordId === TEST_BOT_ID_2) return Promise.resolve(mockBotRecord2)
      return Promise.resolve(null)
    })
    mockTypeOrmService.botRecord.findOneBy.mockImplementation((where: any) => {
      if (where.recordId === TEST_BOT_ID) return Promise.resolve(mockBotRecord)
      if (where.recordId === TEST_BOT_ID_2) return Promise.resolve(mockBotRecord2)
      return Promise.resolve(null)
    })
    mockTypeOrmService.botRecord.save.mockImplementation((data: any) => {
      return Promise.resolve({ ...mockBotRecord, ...data, recordId: TEST_BOT_ID })
    })
  })

  // ========== POST /bots/create ==========
  describe('POST /bots/create', () => {
    it('应当成功创建 Bot 记录', async () => {
      const res = await request(app.getHttpServer())
        .post('/bots/create')
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
          name: '新机器人',
          description: '新机器人描述',
          adapterTag: AdapterTag.napcatWs,
        }),
      )
    })

    it('未认证时应返回 401', async () => {
      const res = await request(app.getHttpServer())
        .post('/bots/create')
        .send({
          name: '新机器人',
          description: '新机器人描述',
          commonConfig: {},
          adapterTag: AdapterTag.napcatWs,
          adapterConfig: {},
        })
      expect(res.status).toBe(401)
    })
  })

  // ========== GET /bots/list ==========
  describe('GET /bots/list', () => {
    it('应当返回 Bot 列表', async () => {
      const res = await request(app.getHttpServer())
        .get('/bots/list')
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(200)

      expect(res.body.statusCode).toBe(Code.Ok)
      expect(Array.isArray(res.body.data)).toBe(true)
    })

    it('未认证时应返回 401', async () => {
      await request(app.getHttpServer())
        .get('/bots/list')
        .expect(401)
    })
  })

  // ========== POST /bots/:botId/run - 核心：Manager 创建 Bot 实例 ==========
  describe('POST /bots/:botId/run', () => {
    it('应当通过 factory 创建 bot 实例并存入 runtime', async () => {
      const mockInstance = createMockBotInstance()
      vi.spyOn(botFactoryService, 'createBot').mockResolvedValue(mockInstance)

      const res = await request(app.getHttpServer())
        .post(`/bots/${TEST_BOT_ID}/run`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(201)

      expect(res.body.statusCode).toBe(Code.Ok)
      // 验证 factory 被调用创建 bot
      expect(botFactoryService.createBot).toHaveBeenCalledWith(TEST_BOT_ID)
    })

    it('bot 已运行时不应重复创建', async () => {
      // 先创建一个运行中的实例
      const mockInstance = createMockBotInstance({ runningState: BotRunningState.running })
      vi.spyOn(botFactoryService, 'createBot').mockResolvedValue(mockInstance)

      // 第一次启动
      await request(app.getHttpServer())
        .post(`/bots/${TEST_BOT_ID}/run`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(201)

      // 第二次启动 - 因为已经 running，不应再次调用 factory
      await request(app.getHttpServer())
        .post(`/bots/${TEST_BOT_ID}/run`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(201)

      // factory 只被调用一次
      expect(botFactoryService.createBot).toHaveBeenCalledTimes(1)
    })

    it('未认证时应返回 401', async () => {
      await request(app.getHttpServer())
        .post(`/bots/${TEST_BOT_ID}/run`)
        .expect(401)
    })
  })

  // ========== POST /bots/:botId/stop - 核心：Manager → BotInstance.signal(SIGSTOP) ==========
  describe('POST /bots/:botId/stop', () => {
    it('应当向 bot 实例发送 SIGSTOP 信号', async () => {
      // 先启动 bot
      const mockInstance = createMockBotInstance()
      vi.spyOn(botFactoryService, 'createBot').mockResolvedValue(mockInstance)

      await request(app.getHttpServer())
        .post(`/bots/${TEST_BOT_ID}/run`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(201)

      // 发送 stop 指令
      const res = await request(app.getHttpServer())
        .post(`/bots/${TEST_BOT_ID}/stop`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(201)

      expect(res.body.statusCode).toBe(Code.Ok)
      // 核心验证：signal(SIGSTOP) 被调用
      expect(mockInstance.signal).toHaveBeenCalledWith(BotSignal.SIGSTOP)
    })

    it('bot 不存在于 runtime 时 stop 应当静默成功', async () => {
      const res = await request(app.getHttpServer())
        .post('/bots/non-existent-bot/stop')
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(201)

      expect(res.body.statusCode).toBe(Code.Ok)
    })
  })

  // ========== POST /bots/:botId/kill - 核心：Manager → BotInstance.signal(SIGKILL) ==========
  describe('POST /bots/:botId/kill', () => {
    it('应当向 bot 实例发送 SIGKILL 信号', async () => {
      // 先启动 bot
      const mockInstance = createMockBotInstance()
      vi.spyOn(botFactoryService, 'createBot').mockResolvedValue(mockInstance)

      await request(app.getHttpServer())
        .post(`/bots/${TEST_BOT_ID}/run`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(201)

      // 发送 kill 指令
      const res = await request(app.getHttpServer())
        .post(`/bots/${TEST_BOT_ID}/kill`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(201)

      expect(res.body.statusCode).toBe(Code.Ok)
      // 核心验证：signal(SIGKILL) 被调用
      expect(mockInstance.signal).toHaveBeenCalledWith(BotSignal.SIGKILL)
    })

    it('bot 不存在于 runtime 时 kill 应当静默成功', async () => {
      const res = await request(app.getHttpServer())
        .post('/bots/non-existent-bot/kill')
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(201)

      expect(res.body.statusCode).toBe(Code.Ok)
    })
  })

  // ========== POST /bots/:botId/reload - 核心：删除旧实例后重新创建 ==========
  describe('POST /bots/:botId/reload', () => {
    it('应当删除旧实例并重新通过 factory 创建新实例', async () => {
      const oldInstance = createMockBotInstance()
      const newInstance = createMockBotInstance()

      const createBotSpy = vi.spyOn(botFactoryService, 'createBot')
      createBotSpy.mockResolvedValueOnce(oldInstance)
      createBotSpy.mockResolvedValueOnce(newInstance)

      // 先启动 bot
      await request(app.getHttpServer())
        .post(`/bots/${TEST_BOT_ID}/run`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(201)

      expect(createBotSpy).toHaveBeenCalledTimes(1)

      // 执行 reload
      const res = await request(app.getHttpServer())
        .post(`/bots/${TEST_BOT_ID}/reload`)
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
        .post(`/bots/${TEST_BOT_ID}/reload`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(201)

      expect(res.body.statusCode).toBe(Code.Ok)
      expect(botFactoryService.createBot).toHaveBeenCalledWith(TEST_BOT_ID)
    })
  })

  // ========== 指令组合场景 ==========
  describe('Manager → Bot 指令组合场景', () => {
    it('run → stop → run 应当完整走完生命周期', async () => {
      // 第一个实例 running → stop 后变为 stopped
      const instance1 = createMockBotInstance({ runningState: BotRunningState.running })
      // stop 之后将状态改为 stopped，这样下次 run 会重新创建
      const instance2 = createMockBotInstance({ runningState: BotRunningState.running })

      const createBotSpy = vi.spyOn(botFactoryService, 'createBot')
      createBotSpy.mockResolvedValueOnce(instance1)
      createBotSpy.mockResolvedValueOnce(instance2)

      // 1. 启动 bot
      await request(app.getHttpServer())
        .post(`/bots/${TEST_BOT_ID}/run`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(201)

      // 2. 停止 bot - signal(SIGSTOP) 被发送
      await request(app.getHttpServer())
        .post(`/bots/${TEST_BOT_ID}/stop`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(201)
      expect(instance1.signal).toHaveBeenCalledWith(BotSignal.SIGSTOP)

      // 模拟 stop 后状态变为非 running（实际 adapter 中 signal 会改变内部状态）
      ;(instance1.runningState as any) = vi.fn().mockReturnValue({
        runningState: BotRunningState.stopped,
      })

      // 3. 再次启动 bot - 因为已 stopped，应重新创建
      await request(app.getHttpServer())
        .post(`/bots/${TEST_BOT_ID}/run`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(201)

      expect(createBotSpy).toHaveBeenCalledTimes(2)
    })

    it('run → kill 应当发送 SIGKILL 信号', async () => {
      const mockInstance = createMockBotInstance()
      vi.spyOn(botFactoryService, 'createBot').mockResolvedValue(mockInstance)

      // 启动
      await request(app.getHttpServer())
        .post(`/bots/${TEST_BOT_ID}/run`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(201)

      // kill
      await request(app.getHttpServer())
        .post(`/bots/${TEST_BOT_ID}/kill`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(201)

      expect(mockInstance.signal).toHaveBeenCalledWith(BotSignal.SIGKILL)
      // kill 不应该重新调用 signal 为 SIGSTOP
      expect(mockInstance.signal).not.toHaveBeenCalledWith(BotSignal.SIGSTOP)
    })

    it('run → reload 应当删除旧实例并创建新实例', async () => {
      const oldInstance = createMockBotInstance()
      const newInstance = createMockBotInstance()

      const createBotSpy = vi.spyOn(botFactoryService, 'createBot')
      createBotSpy.mockResolvedValueOnce(oldInstance)
      createBotSpy.mockResolvedValueOnce(newInstance)

      // 启动
      await request(app.getHttpServer())
        .post(`/bots/${TEST_BOT_ID}/run`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(201)

      // reload - 旧实例被移除，新实例被创建
      await request(app.getHttpServer())
        .post(`/bots/${TEST_BOT_ID}/reload`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(201)

      // factory 被调用两次
      expect(createBotSpy).toHaveBeenCalledTimes(2)
      // reload 不会对旧实例发送 signal（直接 delete，区别于 stop）
      expect(oldInstance.signal).not.toHaveBeenCalled()
    })

    it('多个 bot 实例的指令应当互不影响', async () => {
      mockTypeOrmService.botRecord.find.mockResolvedValue([mockBotRecord, mockBotRecord2])

      const instance1 = createMockBotInstance({ botRecord: mockBotRecord })
      const instance2 = createMockBotInstance({ botRecord: mockBotRecord2 })

      const createBotSpy = vi.spyOn(botFactoryService, 'createBot')
      createBotSpy.mockResolvedValueOnce(instance1)
      createBotSpy.mockResolvedValueOnce(instance2)

      // 启动两个 bot
      await request(app.getHttpServer())
        .post(`/bots/${TEST_BOT_ID}/run`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(201)

      await request(app.getHttpServer())
        .post(`/bots/${TEST_BOT_ID_2}/run`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(201)

      // 只停止第一个 bot
      await request(app.getHttpServer())
        .post(`/bots/${TEST_BOT_ID}/stop`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(201)

      // 验证只有 instance1 收到了 SIGSTOP
      expect(instance1.signal).toHaveBeenCalledWith(BotSignal.SIGSTOP)
      expect(instance2.signal).not.toHaveBeenCalled()

      // kill 第二个 bot
      await request(app.getHttpServer())
        .post(`/bots/${TEST_BOT_ID_2}/kill`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .expect(201)

      // 验证只有 instance2 收到了 SIGKILL
      expect(instance2.signal).toHaveBeenCalledWith(BotSignal.SIGKILL)
      expect(instance1.signal).not.toHaveBeenCalledWith(BotSignal.SIGKILL)
    })
  })
})
