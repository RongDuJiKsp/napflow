import { describe, expect, it } from 'vitest'
import { NodeClassic } from '@shared/common/workflow/core'
import {
  ComponentNodesEnum,
  VarTypes,
} from '@shared/common/workflow/component-node'
import { ArrayIndexReadNode } from '../../core/workflow/nodes/array-index-read-node'
import { createMockNextTask, createTestThread } from '../utils/workflow-thread'

describe('数组索引读取节点', () => {
  const createNode = (index: string) => {
    return new ArrayIndexReadNode({
      id: 'array-index-read',
      type: NodeClassic.Component,
      data: {
        type: ComponentNodesEnum.ArrayIndexRead,
        vars: [{ name: 'value', type: VarTypes.String }],
        sourceVarName: 'trigger.text',
        index,
      },
    })
  }

  it('按数字索引从源数组读取元素', () => {
    const node = createNode('1')
    const nkv: Record<string, unknown> = {}
    const { thread } = createTestThread({
      nodeKv: {
        trigger: {
          text: ['a', 'b', 'c'],
        },
      },
    })

    node.onThread(thread, createMockNextTask(), nkv)
    expect(nkv.value).toBe('b')
  })

  it('支持在索引输入中使用变量引用', () => {
    const node = createNode('{{#trigger.index#}}')
    const nkv: Record<string, unknown> = {}
    const { thread } = createTestThread({
      nodeKv: {
        trigger: {
          text: [10, 20, 30],
          index: 2,
        },
      },
    })

    node.onThread(thread, createMockNextTask(), nkv)
    expect(nkv.value).toBe(30)
  })

  it('可将源数组中的数字读取到数值变量', () => {
    const node = new ArrayIndexReadNode({
      id: 'array-index-read',
      type: NodeClassic.Component,
      data: {
        type: ComponentNodesEnum.ArrayIndexRead,
        vars: [{ name: 'value', type: VarTypes.Number }],
        sourceVarName: 'trigger.text',
        index: '2',
      },
    })
    const nkv: Record<string, unknown> = {}
    const { thread } = createTestThread({
      nodeKv: {
        trigger: {
          text: [10, 20, 30],
        },
      },
    })

    node.onThread(thread, createMockNextTask(), nkv)
    expect(nkv.value).toBe(30)
  })

  it('索引无效时返回 undefined', () => {
    const node = createNode('x')
    const nkv: Record<string, unknown> = {}
    const { thread } = createTestThread({
      nodeKv: {
        trigger: {
          text: ['a', 'b', 'c'],
        },
      },
    })

    node.onThread(thread, createMockNextTask(), nkv)
    expect(nkv.value).toBeUndefined()
  })

  it('源数据不是数组时返回 undefined', () => {
    const node = createNode('1')
    const nkv: Record<string, unknown> = {}
    const { thread } = createTestThread({
      nodeKv: {
        trigger: {
          text: 'abc',
        },
      },
    })

    node.onThread(thread, createMockNextTask(), nkv)
    expect(nkv.value).toBeUndefined()
  })
})
