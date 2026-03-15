import { describe, expect, it } from 'vitest'
import { NodeClassic } from '@shared/common/workflow/core'
import { ComponentNodesEnum } from '@shared/common/workflow/component-node'
import { IterateNode } from '../../core/workflow/nodes/iterate-node'
import { createMockNextTask, createTestThread } from '../utils/workflow-thread'

describe('数组迭代节点', () => {
  const createNode = () => {
    return new IterateNode({
      id: 'iterate-node',
      type: NodeClassic.Component,
      data: {
        type: ComponentNodesEnum.Iterate,
        vars: [],
        sourceVarName: 'trigger.items',
      },
    })
  }

  it('可推进迭代索引并调度子图', () => {
    const node = createNode()
    const iterateStart = {
      id: 'iterate-start',
      parentId: 'iterate-node',
      data: { type: ComponentNodesEnum.IterateStart },
    }

    const { thread, subGraphRunner, graphRunner } = createTestThread({
      nodeKv: {
        trigger: {
          items: ['a', 'b'],
        },
      },
      commNodes: [iterateStart],
      consumedSubGraphNodes: [iterateStart],
    })
    const nkv: Record<string, unknown> = {}

    node.onThread(thread, createMockNextTask() as any, nkv)

    expect(nkv['iter.index']).toBe(0)
    expect(nkv['iter.maxIndex']).toBe(1)
    expect(nkv['iter.item']).toBe('a')
    expect(subGraphRunner.enqueue).toHaveBeenCalledWith(iterateStart)
    expect(graphRunner.enqueueNextMany).toHaveBeenCalledWith([
      iterateStart,
      node,
    ])
  })

  it('源变量不是数组时跳过执行', () => {
    const node = createNode()
    const { thread, graphRunner } = createTestThread({
      nodeKv: {
        trigger: {
          items: 'not-array',
        },
      },
    })

    node.onThread(thread, createMockNextTask() as any, {})

    expect(graphRunner.enqueueNextMany).not.toHaveBeenCalled()
  })

  it('缺少唯一iterate-start子节点时会中止任务', () => {
    const node = createNode()
    const nextTask = createMockNextTask()
    const { thread } = createTestThread({
      nodeKv: {
        trigger: {
          items: [1],
        },
      },
      commNodes: [],
    })

    node.onThread(thread, nextTask as any, {})

    expect(nextTask.abort).toHaveBeenCalledOnce()
  })
})
