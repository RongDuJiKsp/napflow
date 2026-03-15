import { describe, expect, it } from 'vitest'
import { NodeClassic } from '@shared/common/workflow/core'
import { ComponentNodesEnum } from '@shared/common/workflow/component-node'
import { BranchType, CompareOperator } from '@shared/common/workflow/node-data/if'
import { IfNode } from '../../core/workflow/nodes/if-node'
import { createMockNextTask, createTestThread } from '../utils/workflow-thread'

describe('条件判断节点', () => {
  const createNode = () => {
    return new IfNode({
      id: 'if-node',
      type: NodeClassic.Component,
      data: {
        type: ComponentNodesEnum.If,
        vars: [],
        branches: [
          {
            id: 'b-if',
            type: BranchType.If,
            condition: {
              variable: 'trigger.text',
              operator: CompareOperator.StringEqual,
              value: '{{#trigger.expected#}}',
            },
          },
          {
            id: 'b-else',
            type: BranchType.Else,
          },
        ],
      },
    })
  }

  it('命中if分支时只保留对应队列', () => {
    const node = createNode()
    const { thread, graphRunner } = createTestThread({
      nodeKv: {
        trigger: {
          text: 'ok',
          expected: 'ok',
        },
      },
      edges: [
        { source: 'if-node', target: 'node-if', sourceHandle: 'b-if' },
        { source: 'if-node', target: 'node-else', sourceHandle: 'b-else' },
      ],
    })

    node.onThread(thread, createMockNextTask() as any, {})

    expect(graphRunner.removeQueue).toHaveBeenCalledWith(['node-else'])
  })

  it('if条件不命中时走else分支', () => {
    const node = createNode()
    const { thread, graphRunner } = createTestThread({
      nodeKv: {
        trigger: {
          text: 'bad',
          expected: 'ok',
        },
      },
      edges: [
        { source: 'if-node', target: 'node-if', sourceHandle: 'b-if' },
        { source: 'if-node', target: 'node-else', sourceHandle: 'b-else' },
      ],
    })

    node.onThread(thread, createMockNextTask() as any, {})

    expect(graphRunner.removeQueue).toHaveBeenCalledWith(['node-if'])
  })
})
