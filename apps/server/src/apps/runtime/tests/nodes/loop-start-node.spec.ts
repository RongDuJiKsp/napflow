import { describe, expect, it } from 'vitest'
import { NodeClassic } from '@shared/common/workflow/core'
import { ComponentNodesEnum } from '@shared/common/workflow/component-node'
import { LoopStartNode } from '../../core/workflow/nodes/loop-start-node'
import { createMockNextTask, createTestThread } from '../utils/workflow-thread'

describe('循环开始节点', () => {
  it('有父节点时复制loop上下文', () => {
    const node = new LoopStartNode({
      id: 'loop-start',
      parentId: 'loop-node',
      type: NodeClassic.Component,
      data: {
        type: ComponentNodesEnum.LoopStart,
        vars: [],
      },
    })
    const nkv: Record<string, unknown> = {}
    const { thread } = createTestThread({
      nodeKv: {
        'loop-node': {
          'loop.index': 3,
          'loop.maxIndex': 10,
        },
      },
    })

    node.onThread(thread, createMockNextTask(), nkv)

    expect(nkv).toMatchObject({
      'loop.index': 3,
      'loop.maxIndex': 10,
    })
  })

  it('无父节点时中止任务', () => {
    const node = new LoopStartNode({
      id: 'loop-start',
      type: NodeClassic.Component,
      data: {
        type: ComponentNodesEnum.LoopStart,
        vars: [],
      },
    })
    const nextTask = createMockNextTask()

    node.onThread(createTestThread().thread, nextTask, {})

    expect(nextTask.abort).toHaveBeenCalledOnce()
  })
})
