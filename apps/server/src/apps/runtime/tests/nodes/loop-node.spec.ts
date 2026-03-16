import { describe, expect, it } from 'vitest'
import { NodeClassic } from '@shared/common/workflow/core'
import { ComponentNodesEnum } from '@shared/common/workflow/component-node'
import { LoopNode } from '../../core/workflow/nodes/loop-node'
import { createMockNextTask, createTestThread } from '../utils/workflow-thread'

describe('循环节点', () => {
  const createNode = () => {
    return new LoopNode({
      id: 'loop-node',
      type: NodeClassic.Component,
      data: {
        type: ComponentNodesEnum.Loop,
        vars: [],
        maxCount: 2,
      },
    })
  }

  it('在未达到最大次数时推进子图和自身队列', () => {
    const node = createNode()
    const loopStart = {
      id: 'loop-start',
      parentId: 'loop-node',
      data: { type: ComponentNodesEnum.LoopStart },
    }
    const child = {
      id: 'child',
      data: { type: ComponentNodesEnum.JsonRead },
    }

    const { thread, subGraphRunner, graphRunner } = createTestThread({
      commNodes: [loopStart],
      consumedSubGraphNodes: [loopStart, child],
    })
    const nkv: Record<string, unknown> = {}

    node.onThread(thread, createMockNextTask(), nkv)

    expect(nkv['loop.index']).toBe(0)
    expect(nkv['loop.maxIndex']).toBe(2)
    expect(thread.getSubGraphRunner).toHaveBeenCalledWith('loop-node')
    expect(subGraphRunner.enqueue).toHaveBeenCalledWith(loopStart)
    expect(graphRunner.enqueueNextMany).toHaveBeenCalledWith([
      loopStart,
      child,
      node,
    ])
  })

  it('达到最大次数时不再推进队列', () => {
    const node = createNode()
    const { graphRunner } = createTestThread()
    const nkv: Record<string, unknown> = {
      'loop.index': 1,
    }

    node.onThread({} as any, createMockNextTask(), nkv)

    expect(nkv['loop.index']).toBe(2)
    expect(graphRunner.enqueueNextMany).not.toHaveBeenCalled()
  })

  it('缺少唯一loop-start子节点时会中止任务', () => {
    const node = createNode()
    const nextTask = createMockNextTask()
    const { thread } = createTestThread({
      commNodes: [],
    })

    node.onThread(thread, nextTask as any, {})

    expect(nextTask.abort).toHaveBeenCalledOnce()
  })
})
