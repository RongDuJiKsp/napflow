import { describe, expect, it } from 'vitest'
import { NodeClassic } from '@shared/common/workflow/core'
import { ComponentNodesEnum } from '@shared/common/workflow/component-node'
import { IterateStartNode } from '../../core/workflow/nodes/iterate-start-node'
import { createMockNextTask, createTestThread } from '../utils/workflow-thread'

describe('迭代开始节点', () => {
  it('有父节点时复制iter上下文', () => {
    const node = new IterateStartNode({
      id: 'iterate-start',
      parentId: 'iterate-node',
      type: NodeClassic.Component,
      data: {
        type: ComponentNodesEnum.IterateStart,
        vars: [],
      },
    })
    const nkv: Record<string, unknown> = {}
    const { thread } = createTestThread({
      nodeKv: {
        'iterate-node': {
          'iter.index': 1,
          'iter.maxIndex': 2,
          'iter.item': 'x',
        },
      },
    })

    node.onThread(thread, createMockNextTask(), nkv)

    expect(nkv).toMatchObject({
      'iter.index': 1,
      'iter.maxIndex': 2,
      'iter.item': 'x',
    })
  })

  it('无父节点时中止任务', () => {
    const node = new IterateStartNode({
      id: 'iterate-start',
      type: NodeClassic.Component,
      data: {
        type: ComponentNodesEnum.IterateStart,
        vars: [],
      },
    })
    const nextTask = createMockNextTask()

    node.onThread(createTestThread().thread, nextTask, {})

    expect(nextTask.abort).toHaveBeenCalledOnce()
  })
})
