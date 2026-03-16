import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NodeClassic } from '@shared/common/workflow/core'
import { ComponentNodesEnum } from '@shared/common/workflow/component-node'
import { DifyMode } from '@shared/common/workflow/node-data/dify'
import { DifyNode } from '../../core/workflow/nodes/dify-node'
import { createMockNextTask, createTestThread } from '../utils/workflow-thread'

describe('Dify节点', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    fetchMock.mockReset()
    vi.unstubAllGlobals()
  })

  it('chatflow模式下读取answer输出', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ answer: 'hello dify' }),
    })

    const node = new DifyNode({
      id: 'dify-node',
      type: NodeClassic.Component,
      data: {
        type: ComponentNodesEnum.Dify,
        vars: [],
        mode: DifyMode.Chatflow,
        baseUrl: 'https://example.com',
        apiKey: 'key',
        query: '{{#trigger.msg#}}',
        inputs: [],
      },
    })
    const nkv: Record<string, unknown> = {}
    const { thread } = createTestThread({
      nodeKv: {
        trigger: {
          msg: 'how are you',
        },
      },
    })

    await node.onThread(thread, createMockNextTask(), nkv)

    expect(fetchMock).toHaveBeenCalledOnce()
    expect(nkv.output).toBe('hello dify')
  })

  it('workflow模式下将outputs序列化为字符串', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ data: { outputs: { ok: 1 } } }),
    })

    const node = new DifyNode({
      id: 'dify-node',
      type: NodeClassic.Component,
      data: {
        type: ComponentNodesEnum.Dify,
        vars: [],
        mode: DifyMode.Workflow,
        baseUrl: 'https://example.com/',
        apiKey: 'key',
        inputs: [{ key: 'q', value: '{{#trigger.msg#}}' }],
      },
    })
    const nkv: Record<string, unknown> = {}
    const { thread } = createTestThread({
      nodeKv: {
        trigger: {
          msg: 'run',
        },
      },
    })

    await node.onThread(thread, createMockNextTask(), nkv)

    expect(nkv.output).toBe('{"ok":1}')
  })

  it('请求失败时输出空字符串', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'error',
    })

    const node = new DifyNode({
      id: 'dify-node',
      type: NodeClassic.Component,
      data: {
        type: ComponentNodesEnum.Dify,
        vars: [],
        mode: DifyMode.Chatflow,
        baseUrl: 'https://example.com',
        apiKey: 'key',
        query: 'hello',
        inputs: [],
      },
    })
    const nkv: Record<string, unknown> = {}

    await node.onThread(createTestThread().thread, createMockNextTask(), nkv)

    expect(nkv.output).toBe('')
  })
})
