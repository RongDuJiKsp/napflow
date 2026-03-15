import { describe, expect, it } from 'vitest'
import { NodeClassic } from '@shared/common/workflow/core'
import { ComponentNodesEnum, VarTypes } from '@shared/common/workflow/component-node'
import { ArrayIndexReadNode } from './array-index-read-node'

describe('ArrayIndexReadNode', () => {
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

  it('reads an item from source array by numeric index', () => {
    const node = createNode('1')
    const nkv: Record<string, unknown> = {}
    const thread = {
      nodeKv: {
        trigger: {
          text: ['a', 'b', 'c'],
        },
      },
    } as any

    node.onThread(thread, {} as any, nkv)
    expect(nkv.value).toBe('b')
  })

  it('supports variable reference in index input', () => {
    const node = createNode('{{#trigger.index#}}')
    const nkv: Record<string, unknown> = {}
    const thread = {
      nodeKv: {
        trigger: {
          text: [10, 20, 30],
          index: 2,
        },
      },
    } as any

    node.onThread(thread, {} as any, nkv)
    expect(nkv.value).toBe('30')
  })

  it('reads numbers from source array into numeric var', () => {
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
    const thread = {
      nodeKv: {
        trigger: {
          text: [10, 20, 30],
        },
      },
    } as any

    node.onThread(thread, {} as any, nkv)
    expect(nkv.value).toBe(30)
  })

  it('returns empty string when index is invalid', () => {
    const node = createNode('x')
    const nkv: Record<string, unknown> = {}
    const thread = {
      nodeKv: {
        trigger: {
          text: ['a', 'b', 'c'],
        },
      },
    } as any

    node.onThread(thread, {} as any, nkv)
    expect(nkv.value).toBe('')
  })

  it('returns empty string when source is not array', () => {
    const node = createNode('1')
    const nkv: Record<string, unknown> = {}
    const thread = {
      nodeKv: {
        trigger: {
          text: 'abc',
        },
      },
    } as any

    node.onThread(thread, {} as any, nkv)
    expect(nkv.value).toBe('')
  })
})
