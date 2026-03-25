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
import { AgentSessionRecoverService } from '../src/apps/agent/connect/session-recover/agent-session-recover.service'
import {
  createBaseMockTypeOrmService,
  createE2EApp,
  createTokenFactory,
} from './utils/nest-init'

type MockOpenAiEndpoint = {
  id: string;
  endpoint: string;
  apiKey: string;
  model: string;
}

describe('AgentController (e2e)', () => {
  let app: INestApplication<App>
  let getUserToken: () => string
  let sessionRecoverService: AgentSessionRecoverService
  let configs: MockOpenAiEndpoint[] = []

  const initialConfigs: MockOpenAiEndpoint[] = [
    {
      id: 'cfg-1',
      endpoint: 'https://api.openai.com/v1',
      apiKey: 'sk-test-1',
      model: 'gpt-4o-mini',
    },
  ]

  const mockTypeOrmService = {
    ...createBaseMockTypeOrmService(),
    workflowApp: {
      find: vi.fn().mockResolvedValue([]),
      findOne: vi.fn().mockResolvedValue(null),
      save: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue({ affected: 0 }),
    },
    workflowAppData: {
      find: vi.fn().mockResolvedValue([]),
      findOne: vi.fn().mockResolvedValue(null),
      save: vi.fn().mockResolvedValue({}),
      count: vi.fn().mockResolvedValue(0),
    },
    botRecord: {
      find: vi.fn().mockResolvedValue([]),
      findOne: vi.fn().mockResolvedValue(null),
      save: vi.fn().mockResolvedValue({}),
    },
    openAiEndpoint: {
      find: vi.fn().mockImplementation(() => Promise.resolve([...configs])),
      findOne: vi.fn().mockImplementation(({ where }: any) => {
        return Promise.resolve(
          configs.find(item => item.id === where.id) ?? null,
        )
      }),
      save: vi.fn().mockImplementation((data: any) => {
        if (data.id) {
          const index = configs.findIndex(item => item.id === data.id)
          if (index >= 0) {
            configs[index] = {
              ...configs[index],
              ...data,
            }
            return Promise.resolve(configs[index])
          }
        }

        const created = {
          id: `cfg-${configs.length + 1}`,
          ...data,
        }
        configs.push(created)
        return Promise.resolve(created)
      }),
      delete: vi.fn().mockImplementation(({ id }: any) => {
        const beforeLength = configs.length
        configs = configs.filter(item => item.id !== id)
        return Promise.resolve({
          affected: beforeLength === configs.length ? 0 : 1,
        })
      }),
    },
  }

  beforeAll(async () => {
    const ctx = await createE2EApp(mockTypeOrmService)
    app = ctx.app
    sessionRecoverService = ctx.module.get(AgentSessionRecoverService)

    const tokenFactory = createTokenFactory(ctx.jwtService)
    getUserToken = () => tokenFactory.getUserToken()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    configs = initialConfigs.map(item => ({ ...item }))
  })

  describe('GET /agent/openai-endpoint', () => {
    it('应该返回已配置模型列表', async () => {
      const res = await request(app.getHttpServer())
        .get('/agent/openai-endpoint')
        .set('Authorization', `Bearer ${getUserToken()}`)

      expect(res.body.statusCode).toBe(Code.Ok)
      expect(res.body.data).toHaveLength(1)
      expect(res.body.data[0].id).toBe('cfg-1')
    })

    it('未认证访问应返回 401', async () => {
      const res = await request(app.getHttpServer()).get(
        '/agent/openai-endpoint',
      )

      expect(res.status).toBe(401)
    })
  })

  describe('GET /agent/session/recover/list', () => {
    it('路径未提供 appId 时应返回 404', async () => {
      const res = await request(app.getHttpServer())
        .get('/agent/session/recover/list')
        .set('Authorization', `Bearer ${getUserToken()}`)

      expect(res.status).toBe(404)
    })

    it('应返回指定 appId 下可恢复会话列表', async () => {
      const appId = 'app-recover-e2e'
      sessionRecoverService.registerSession(appId, {
        sessionId: 'session-a',
        langChain: {
          summary: '摘要 A',
          get chatSummary() {
            return this.summary
          },
        },
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      } as any)
      sessionRecoverService.registerSession(appId, {
        sessionId: 'session-b',
        langChain: {
          summary: '未摘要对话',
          get chatSummary() {
            return this.summary
          },
        },
        createdAt: new Date('2026-01-02T00:00:00.000Z'),
      } as any)

      const res = await request(app.getHttpServer())
        .get(`/agent/session/recover/${appId}/list`)
        .set('Authorization', `Bearer ${getUserToken()}`)

      expect(res.body.statusCode).toBe(Code.Ok)
      expect(res.body.data).toEqual([
        {
          sessionId: 'session-a',
          title: '摘要 A',
          createdAt: '2026-01-01T00:00:00.000Z',
        },
        {
          sessionId: 'session-b',
          title: '未摘要对话',
          createdAt: '2026-01-02T00:00:00.000Z',
        },
      ])
    })

    it('指定 appId 不存在会话时应返回空数组', async () => {
      const res = await request(app.getHttpServer())
        .get('/agent/session/recover/app-not-exist/list')
        .set('Authorization', `Bearer ${getUserToken()}`)

      expect(res.body.statusCode).toBe(Code.Ok)
      expect(res.body.data).toEqual([])
    })
  })

  describe('POST /agent/openai-endpoint/create', () => {
    it('应该创建模型配置并返回 id', async () => {
      const res = await request(app.getHttpServer())
        .post('/agent/openai-endpoint/create')
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({
          endpoint: 'https://example.com/v1',
          apiKey: 'sk-new',
          model: 'gpt-4.1',
        })

      expect(res.body.statusCode).toBe(Code.Ok)
      expect(typeof res.body.data.id).toBe('string')
      expect(configs).toHaveLength(2)
      expect(configs[1].endpoint).toBe('https://example.com/v1')
    })

    it('缺少字段应校验失败', async () => {
      const res = await request(app.getHttpServer())
        .post('/agent/openai-endpoint/create')
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({
          endpoint: 'https://example.com/v1',
          apiKey: '',
        })

      expect(res.status).not.toBe(200)
    })
  })

  describe('POST /agent/openai-endpoint/:id/update', () => {
    it('应该更新已存在的模型配置', async () => {
      const res = await request(app.getHttpServer())
        .post('/agent/openai-endpoint/cfg-1/update')
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({
          endpoint: 'https://proxy.openai/v1',
          apiKey: 'sk-updated',
          model: 'gpt-4o',
        })

      expect(res.body.statusCode).toBe(Code.Ok)
      expect(configs[0].endpoint).toBe('https://proxy.openai/v1')
      expect(configs[0].model).toBe('gpt-4o')
    })

    it('更新不存在 id 时应返回 NotFound', async () => {
      const res = await request(app.getHttpServer())
        .post('/agent/openai-endpoint/not-exist/update')
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({
          endpoint: 'https://proxy.openai/v1',
          apiKey: 'sk-updated',
          model: 'gpt-4o',
        })

      expect(res.body.statusCode).toBe(Code.NotFound)
    })
  })

  describe('POST /agent/openai-endpoint/:id/delete', () => {
    it('应该删除已存在的模型配置', async () => {
      const res = await request(app.getHttpServer())
        .post('/agent/openai-endpoint/cfg-1/delete')
        .set('Authorization', `Bearer ${getUserToken()}`)

      expect(res.body.statusCode).toBe(Code.Ok)
      expect(configs).toHaveLength(0)
    })

    it('删除不存在 id 时应返回 NotFound', async () => {
      const res = await request(app.getHttpServer())
        .post('/agent/openai-endpoint/not-exist/delete')
        .set('Authorization', `Bearer ${getUserToken()}`)

      expect(res.body.statusCode).toBe(Code.NotFound)
    })
  })

  describe('连续增删改链路', () => {
    it('应该完成创建、更新、删除并在列表中验证结果', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/agent/openai-endpoint/create')
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({
          endpoint: 'https://chain.example/v1',
          apiKey: 'sk-chain-new',
          model: 'gpt-chain-1',
        })

      expect(createRes.body.statusCode).toBe(Code.Ok)
      const createdId = createRes.body.data.id as string

      const updateRes = await request(app.getHttpServer())
        .post(`/agent/openai-endpoint/${createdId}/update`)
        .set('Authorization', `Bearer ${getUserToken()}`)
        .send({
          endpoint: 'https://chain.example/v2',
          apiKey: 'sk-chain-updated',
          model: 'gpt-chain-2',
        })

      expect(updateRes.body.statusCode).toBe(Code.Ok)

      const listAfterUpdate = await request(app.getHttpServer())
        .get('/agent/openai-endpoint')
        .set('Authorization', `Bearer ${getUserToken()}`)

      expect(listAfterUpdate.body.statusCode).toBe(Code.Ok)
      const updatedItem = listAfterUpdate.body.data.find(
        (item: MockOpenAiEndpoint) => item.id === createdId,
      )
      expect(updatedItem).toMatchObject({
        id: createdId,
        endpoint: 'https://chain.example/v2',
        model: 'gpt-chain-2',
      })
      expect(updatedItem.apiKey).toContain('****')

      const deleteRes = await request(app.getHttpServer())
        .post(`/agent/openai-endpoint/${createdId}/delete`)
        .set('Authorization', `Bearer ${getUserToken()}`)

      expect(deleteRes.body.statusCode).toBe(Code.Ok)

      const listAfterDelete = await request(app.getHttpServer())
        .get('/agent/openai-endpoint')
        .set('Authorization', `Bearer ${getUserToken()}`)

      expect(listAfterDelete.body.statusCode).toBe(Code.Ok)
      expect(
        listAfterDelete.body.data.find(
          (item: MockOpenAiEndpoint) => item.id === createdId,
        ),
      ).toBeUndefined()
    })
  })
})
