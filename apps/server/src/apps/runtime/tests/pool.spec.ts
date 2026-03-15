import { afterEach, describe, expect, it, vi } from 'vitest'
import { NodeClassic } from '@shared/common/workflow/core'
import { ComponentNodesEnum } from '@shared/common/workflow/component-node'
import { ReplyTarget } from '@shared/common/workflow/node-data/reply'
import { TriggerOn } from '@shared/common/workflow/node-data/trigger'
import {
  CommPlugin,
  GraphRunner,
  WorkflowThread,
} from '../core/workflow/pool'
import { NodeKlassMap } from '../core/workflow/constant'
import { TriggerOnEvents } from '../core/workflow/node'

const createComponentNodes = () => {
  return [
    {
      id: 'trigger-1',
      type: NodeClassic.Component,
      data: {
        type: ComponentNodesEnum.Trigger,
        vars: [],
        on: TriggerOn.Friend,
        userId: 'u1',
      },
    },
    {
      id: 'reply-1',
      type: NodeClassic.Component,
      data: {
        type: ComponentNodesEnum.Reply,
        vars: [],
        content: 'pong',
        replyTarget: ReplyTarget.User,
        userId: 'u1',
      },
    },
    {
      id: 'note-1',
      type: NodeClassic.Note,
      data: {
        text: 'ignore note node',
      },
    },
  ]
}

const createComponentEdges = () => {
  return [
    {
      id: 'e1',
      source: 'trigger-1',
      target: 'reply-1',
    },
    {
      id: 'e2',
      source: 'note-1',
      target: 'reply-1',
    },
  ]
}

const createPlugin = (configs: { threadMaxLiveSecond?: number } = {}) => {
  return new CommPlugin(
    createComponentNodes() as any,
    createComponentEdges() as any,
    [],
    { envKV: { token: 'abc' } },
    NodeKlassMap,
    configs,
  )
}

describe('GraphRunner', () => {
  const createNode = (id: string) => ({ id })

  it('按入度顺序消费可执行节点', () => {
    const nodeA = createNode('A')
    const nodeB = createNode('B')
    const nodeC = createNode('C')
    const nodeD = createNode('D')
    const graph = new Map([
      [nodeA, { prev: [], next: [nodeB, nodeC] }],
      [nodeB, { prev: [nodeA], next: [nodeD] }],
      [nodeC, { prev: [nodeA], next: [nodeD] }],
      [nodeD, { prev: [nodeB, nodeC], next: [] }],
    ])
    const cache = {
      A: nodeA,
      B: nodeB,
      C: nodeC,
      D: nodeD,
    }
    const runner = new GraphRunner(graph as any, new Set(Object.values(cache)) as any, cache as any)

    runner.enqueue(nodeA as any)

    const result = runner.consumeAll().map(node => node.id)
    expect(result).toEqual(['A', 'B', 'C', 'D'])
  })

  it('removeQueue 会删除队列中的目标节点', () => {
    const nodeA = createNode('A')
    const nodeB = createNode('B')
    const nodeC = createNode('C')
    const graph = new Map([
      [nodeA, { prev: [], next: [] }],
      [nodeB, { prev: [], next: [] }],
      [nodeC, { prev: [], next: [] }],
    ])
    const cache = {
      A: nodeA,
      B: nodeB,
      C: nodeC,
    }
    const runner = new GraphRunner(graph as any, null, cache as any)

    runner.enqueue(nodeA as any)
    runner.enqueue(nodeB as any)
    runner.enqueue(nodeC as any)
    runner.removeQueue(['B'])

    const result = runner.consumeAll().map(node => node.id)
    expect(result).toEqual(['A', 'C'])
  })

  it('仅对 mainGraphNodes 管理后继入度', () => {
    const nodeA = createNode('A')
    const nodeB = createNode('B')
    const nodeC = createNode('C')
    const graph = new Map([
      [nodeA, { prev: [], next: [nodeB] }],
      [nodeB, { prev: [nodeA], next: [nodeC] }],
      [nodeC, { prev: [nodeB], next: [] }],
    ])
    const cache = {
      A: nodeA,
      B: nodeB,
      C: nodeC,
    }
    const runner = new GraphRunner(graph as any, new Set([nodeA]) as any, cache as any)

    runner.enqueue(nodeA as any)

    const result = runner.consumeAll().map(node => node.id)
    expect(result).toEqual(['A', 'B'])
  })
})

describe('CommPlugin', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('构造时仅保留组件节点/边并识别触发器', () => {
    const plugin = createPlugin()

    expect(plugin.commNodes.map(node => node.id)).toEqual(['trigger-1', 'reply-1'])
    expect(plugin.commEdges.map(edge => edge.id)).toEqual(['e1'])
    expect(plugin.graphHead.id).toBe('trigger-1')
    expect(plugin.threadList).toHaveLength(0)
    expect(plugin.graphHeadConnectedNodes.has(plugin.graphHead)).toBe(true)
  })

  it('onTrigger 会创建线程并注入上下文', async () => {
    vi.useFakeTimers()
    const plugin = createPlugin()
    const tickSpy = vi
      .spyOn(WorkflowThread.prototype, 'tick')
      .mockImplementation(async (nextTask) => {
        nextTask.abort()
      })

    plugin.onTrigger(TriggerOnEvents.ChatMessage, { from: 'tester' })

    const [threadId] = Object.keys(plugin.threads)
    expect(threadId).toBeTruthy()
    expect(plugin.tasks[threadId]).toBeTruthy()
    expect(plugin.threads[threadId].kv.from).toBe('tester')
    expect(plugin.threads[threadId].nodeKv.global).toEqual({ token: 'abc' })

    await vi.runOnlyPendingTimersAsync()

    expect(tickSpy).toHaveBeenCalledTimes(1)
  })
})

describe('WorkflowThread', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  const createThreadWithMockPlugin = (options: {
    endpoint?: TriggerOnEvents | string;
    threadMaxLiveSecond?: number;
    nodeImpl?: ReturnType<typeof vi.fn>;
  } = {}) => {
    const onThread = options.nodeImpl ?? vi.fn(async () => Promise.resolve())
    const triggerNode = {
      id: 'trigger-mock',
      triggerEv: TriggerOnEvents.ChatMessage,
      onThread,
    }

    const plugin = {
      threads: {} as Record<string, WorkflowThread>,
      configs: {
        threadMaxLiveSecond: options.threadMaxLiveSecond,
      },
      nodeGraph: new Map([[triggerNode, { prev: [], next: [] }]]),
      graphHeadConnectedNodes: new Set([triggerNode]),
      commNodeCache: { [triggerNode.id]: triggerNode },
      graphHead: triggerNode,
      commNodes: [triggerNode],
      getSubGraph: vi.fn(() => new Map()),
    }

    const endpoint = options.endpoint ?? TriggerOnEvents.ChatMessage
    const thread = new WorkflowThread(endpoint as TriggerOnEvents, plugin as any)
    plugin.threads[thread.id] = thread

    return {
      thread,
      plugin,
      onThread,
    }
  }

  it('触发事件不匹配时不会把起始节点入队', () => {
    const { thread } = createThreadWithMockPlugin({ endpoint: 'other-event' })

    expect(thread.graphRunner.size()).toBe(0)
  })

  it('tick 会执行当前节点', async () => {
    const { thread, onThread } = createThreadWithMockPlugin()
    const nextTask = {
      abort: vi.fn(),
    }

    await thread.tick(nextTask as any)

    expect(onThread).toHaveBeenCalledTimes(1)
    expect(nextTask.abort).not.toHaveBeenCalled()
  })

  it('无可执行节点时 tick 会中止任务并卸载线程', async () => {
    const { thread, plugin } = createThreadWithMockPlugin()
    const nextTask = {
      abort: vi.fn(),
    }

    await thread.tick(nextTask as any)

    const nextTask2 = {
      abort: vi.fn(),
    }
    await thread.tick(nextTask2 as any)

    expect(nextTask2.abort).toHaveBeenCalledTimes(1)
    expect(plugin.threads[thread.id]).toBeUndefined()
  })

  it('超时后会直接中止并卸载线程', async () => {
    const { thread, plugin, onThread } = createThreadWithMockPlugin({
      threadMaxLiveSecond: 1,
    })

    ;(thread as any).createdAt = new Date(Date.now() - 5000)
    const nextTask = {
      abort: vi.fn(),
    }

    await thread.tick(nextTask as any)

    expect(nextTask.abort).toHaveBeenCalledTimes(1)
    expect(onThread).not.toHaveBeenCalled()
    expect(plugin.threads[thread.id]).toBeUndefined()
  })
})
