import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createGraphRunnerFixture,
  createTestPlugin,
  createThreadFixture,
  createWillTaskSpy,
} from './utils/pool-fixtures'
import { WorkflowThread } from '../core/workflow/pool'
import { TriggerOnEvents } from '../core/workflow/node'

describe('GraphRunner', () => {
  it('按入度顺序消费可执行节点', () => {
    const { runner, nodesById } = createGraphRunnerFixture(
      {
        A: ['B', 'C'],
        B: ['D'],
        C: ['D'],
        D: [],
      },
      ['A', 'B', 'C', 'D'],
    )

    runner.enqueue(nodesById.A)

    const result = runner.consumeAll().map(node => node.id)
    expect(result).toEqual(['A', 'B', 'C', 'D'])
  })

  it('removeQueue 会删除队列中的目标节点', () => {
    const { runner, nodesById } = createGraphRunnerFixture({
      A: [],
      B: [],
      C: [],
    })

    runner.enqueue(nodesById.A)
    runner.enqueue(nodesById.B)
    runner.enqueue(nodesById.C)
    runner.removeQueue(['B'])

    const result = runner.consumeAll().map(node => node.id)
    expect(result).toEqual(['A', 'C'])
  })

  it('仅对 mainGraphNodes 管理后继入度', () => {
    const { runner, nodesById } = createGraphRunnerFixture(
      {
        A: ['B'],
        B: ['C'],
        C: [],
      },
      ['A'],
    )

    runner.enqueue(nodesById.A)

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
    const plugin = createTestPlugin()

    expect(plugin.graphManager.commNodes.map(node => node.id)).toEqual([
      'trigger-1',
      'reply-1',
    ])
    expect(plugin.graphManager.commEdges.map(edge => edge.id)).toEqual([
      'e1',
    ])
    expect(plugin.graphManager.graphHead.id).toBe('trigger-1')
    expect(Object.values(plugin.taskManager.threads)).toHaveLength(0)
    expect(
      plugin.graphManager.graphHeadConnectedNodes.has(
        plugin.graphManager.graphHead,
      ),
    ).toBe(true)
  })

  it('onTrigger 会创建线程并注入上下文', async () => {
    vi.useFakeTimers()
    const plugin = createTestPlugin()
    const tickSpy = vi
      .spyOn(WorkflowThread.prototype, 'tick')
      .mockImplementation(async (nextTask) => {
        nextTask.abort()
      })

    plugin.onTrigger(TriggerOnEvents.ChatMessage, { from: 'tester' })

    const [threadId] = Object.keys(plugin.taskManager.threads)
    expect(threadId).toBeTruthy()
    expect(plugin.taskManager.tasks[threadId]).toBeTruthy()
    expect(plugin.taskManager.threads[threadId].kv.from).toBe('tester')
    expect(plugin.taskManager.threads[threadId].nodeKv.global).toEqual({
      token: 'abc',
    })

    await vi.runOnlyPendingTimersAsync()

    expect(tickSpy).toHaveBeenCalledTimes(1)
  })
})

describe('WorkflowThread', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('触发事件不匹配时不会把起始节点入队', () => {
    const { thread } = createThreadFixture({ endpoint: 'other-event' })

    expect(thread.graphRunner.size()).toBe(0)
  })

  it('tick 会执行当前节点', async () => {
    const { thread, onThread } = createThreadFixture()
    const { nextTask, abortSpy } = createWillTaskSpy()

    await thread.tick(nextTask)

    expect(onThread).toHaveBeenCalledTimes(1)
    expect(abortSpy).not.toHaveBeenCalled()
  })

  it('无可执行节点时 tick 会中止任务并卸载线程', async () => {
    const { thread, plugin } = createThreadFixture()
    const { nextTask } = createWillTaskSpy()

    await thread.tick(nextTask)

    const { nextTask: nextTask2, abortSpy: abortSpy2 } = createWillTaskSpy()
    await thread.tick(nextTask2)

    expect(abortSpy2).toHaveBeenCalledTimes(1)
    expect(plugin.taskManager.threads[thread.id]).toBeUndefined()
  })

  it('超时后会直接中止并卸载线程', async () => {
    vi.useFakeTimers()
    const now = new Date('2026-01-01T00:00:00.000Z')
    vi.setSystemTime(now)

    const { thread, plugin, onThread } = createThreadFixture({
      threadMaxLiveSecond: 1,
    })
    vi.setSystemTime(new Date(now.getTime() + 5000))

    const { nextTask, abortSpy } = createWillTaskSpy()

    await thread.tick(nextTask)

    expect(abortSpy).toHaveBeenCalledTimes(1)
    expect(onThread).not.toHaveBeenCalled()
    expect(plugin.taskManager.threads[thread.id]).toBeUndefined()
  })
})
