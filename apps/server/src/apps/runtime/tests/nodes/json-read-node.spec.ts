import { describe, expect, it } from 'vitest'
import { NodeClassic } from '@shared/common/workflow/core'
import {
  ComponentNodesEnum,
  VarTypes,
} from '@shared/common/workflow/component-node'
import { JsonReadNode } from '../../core/workflow/nodes/json-read-node'
import { createMockNextTask, createTestThread } from '../utils/workflow-thread'

describe('JSON读取节点', () => {
  const createNode = () => {
    return new JsonReadNode({
      id: 'json-read',
      type: NodeClassic.Component,
      data: {
        type: ComponentNodesEnum.JsonRead,
        vars: [],
        sourceVarName: 'trigger.payload',
        outputs: [
          { name: 'name', field: 'name', type: VarTypes.String },
          { name: 'age', field: 'age', type: VarTypes.Number },
          { name: 'tags', field: 'tags', type: VarTypes.StringArray },
          { name: 'scores', field: 'scores', type: VarTypes.NumberArray },
        ],
      },
    })
  }

  it('可从JSON字符串读取并按类型序列化输出', () => {
    const node = createNode()
    const nkv: Record<string, unknown> = {}
    const { thread } = createTestThread({
      nodeKv: {
        trigger: {
          payload: JSON.stringify({
            name: 'alice',
            age: '18',
            tags: [1, true],
            scores: ['1', 2, 'bad'],
          }),
        },
      },
    })

    node.onThread(thread, createMockNextTask(), nkv)

    expect(nkv.name).toBe('alice')
    expect(nkv.age).toBe(18)
    expect(nkv.tags).toEqual(['1', 'true'])
    expect(nkv.scores).toEqual([1, 2, 0])
  })

  it('源数据不是合法JSON时不写入输出', () => {
    const node = createNode()
    const nkv: Record<string, unknown> = {}
    const { thread } = createTestThread({
      nodeKv: {
        trigger: {
          payload: '{not-json}',
        },
      },
    })

    node.onThread(thread, createMockNextTask(), nkv)
    expect(nkv).toEqual({})
  })
})
