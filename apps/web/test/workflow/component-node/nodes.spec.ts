import { getNodeEnvMap } from '@/app/components/workflow/editor/component-nodes/hooks/use-component-node-env'
import type { ComponentNode } from '@/app/components/workflow/editor/component-nodes/types'
import { VarTypes } from '@/app/components/workflow/editor/component-nodes/types'
import type { WorkflowEdge } from '@/app/components/workflow/editor/types'
import type { PartialDeep } from 'type-fest'

describe('正确收集节点的env', () => {
  test('正常收集', () => {
    const nodes: PartialDeep<ComponentNode>[] = [
      {
        id: '1',
        data: {
          vars: [{ name: 'a', type: VarTypes.String }],
          title: '节点Id1',
        },
      },
      {
        id: '2',
        data: {
          vars: [{ name: 'a', type: VarTypes.Number }],
          title: '节点Id2',
        },
      },
      { id: '3', data: { title: '', vars: [] } },
    ]
    const edges: PartialDeep<WorkflowEdge>[] = [
      {
        source: '1',
        target: '3',
      },
      { source: '2', target: '3' },
    ]
    expect(
      getNodeEnvMap(nodes as ComponentNode[], edges as WorkflowEdge[]),
    ).toEqual({
      1: [],
      2: [],
      3: [
        {
          name: 'a',
          type: VarTypes.String,
          source: { id: '1', title: '节点Id1' },
        },
        {
          name: 'a',
          type: VarTypes.Number,
          source: { id: '2', title: '节点Id2' },
        },
      ],
    })
  })

  test('空节点和空边', () => {
    const nodes: PartialDeep<ComponentNode>[] = []
    const edges: PartialDeep<WorkflowEdge>[] = []
    expect(
      getNodeEnvMap(nodes as ComponentNode[], edges as WorkflowEdge[]),
    ).toEqual({})
  })

  test('只有节点没有边', () => {
    const nodes: PartialDeep<ComponentNode>[] = [
      {
        id: '1',
        data: { vars: [{ name: 'a', type: VarTypes.String }], title: '节点1' },
      },
      {
        id: '2',
        data: { vars: [{ name: 'b', type: VarTypes.Number }], title: '节点2' },
      },
    ]
    const edges: PartialDeep<WorkflowEdge>[] = []
    expect(
      getNodeEnvMap(nodes as ComponentNode[], edges as WorkflowEdge[]),
    ).toEqual({
      1: [],
      2: [],
    })
  })

  test('链式结构', () => {
    const nodes: PartialDeep<ComponentNode>[] = [
      {
        id: '1',
        data: {
          vars: [{ name: 'var1', type: VarTypes.String }],
          title: '节点1',
        },
      },
      {
        id: '2',
        data: {
          vars: [{ name: 'var2', type: VarTypes.Number }],
          title: '节点2',
        },
      },
      {
        id: '3',
        data: {
          vars: [{ name: 'var3', type: VarTypes.String }],
          title: '节点3',
        },
      },
    ]
    const edges: PartialDeep<WorkflowEdge>[] = [
      { source: '1', target: '2' },
      { source: '2', target: '3' },
    ]
    const result = getNodeEnvMap(
      nodes as ComponentNode[],
      edges as WorkflowEdge[],
    )
    expect(result['1']).toEqual([])
    expect(result['2']).toEqual([
      {
        name: 'var1',
        type: VarTypes.String,
        source: { id: '1', title: '节点1' },
      },
    ])
    expect(result['3']).toEqual([
      {
        name: 'var1',
        type: VarTypes.String,
        source: { id: '1', title: '节点1' },
      },
      {
        name: 'var2',
        type: VarTypes.Number,
        source: { id: '2', title: '节点2' },
      },
    ])
  })

  test('多前置节点和多后置节点', () => {
    const nodes: PartialDeep<ComponentNode>[] = [
      {
        id: '1',
        data: { vars: [{ name: 'a', type: VarTypes.String }], title: '节点1' },
      },
      {
        id: '2',
        data: { vars: [{ name: 'b', type: VarTypes.Number }], title: '节点2' },
      },
      {
        id: '3',
        data: { vars: [{ name: 'c', type: VarTypes.String }], title: '节点3' },
      },
      { id: '4', data: { title: '合并节点', vars: [] } },
      { id: '5', data: { title: '后置节点1', vars: [] } },
      { id: '6', data: { title: '后置节点2', vars: [] } },
    ]
    const edges: PartialDeep<WorkflowEdge>[] = [
      { source: '1', target: '4' },
      { source: '2', target: '4' },
      { source: '3', target: '4' },
      { source: '4', target: '5' },
      { source: '4', target: '6' },
    ]
    const result = getNodeEnvMap(
      nodes as ComponentNode[],
      edges as WorkflowEdge[],
    )
    expect(result['4']).toEqual([
      {
        name: 'a',
        type: VarTypes.String,
        source: { id: '1', title: '节点1' },
      },
      {
        name: 'b',
        type: VarTypes.Number,
        source: { id: '2', title: '节点2' },
      },
      {
        name: 'c',
        type: VarTypes.String,
        source: { id: '3', title: '节点3' },
      },
    ])
    expect(result['5']).toEqual(result['4'])
    expect(result['6']).toEqual(result['4'])
  })

  test('孤立节点', () => {
    const nodes: PartialDeep<ComponentNode>[] = [
      {
        id: '1',
        data: { vars: [{ name: 'a', type: VarTypes.String }], title: '节点1' },
      },
      {
        id: '2',
        data: {
          vars: [{ name: 'b', type: VarTypes.Number }],
          title: '孤立节点',
        },
      },
      {
        id: '3',
        data: { vars: [{ name: 'c', type: VarTypes.String }], title: '节点3' },
      },
    ]
    const edges: PartialDeep<WorkflowEdge>[] = [{ source: '1', target: '3' }]
    const result = getNodeEnvMap(
      nodes as ComponentNode[],
      edges as WorkflowEdge[],
    )
    expect(result['1']).toEqual([])
    expect(result['2']).toEqual([])
    expect(result['3']).toEqual([
      {
        name: 'a',
        type: VarTypes.String,
        source: { id: '1', title: '节点1' },
      },
    ])
  })

  test('重复变量名在不同节点', () => {
    const nodes: PartialDeep<ComponentNode>[] = [
      {
        id: '1',
        data: {
          vars: [{ name: 'shared', type: VarTypes.String }],
          title: '节点1',
        },
      },
      {
        id: '2',
        data: {
          vars: [{ name: 'shared', type: VarTypes.Number }],
          title: '节点2',
        },
      },
      { id: '3', data: { title: '合并节点' } },
    ]
    const edges: PartialDeep<WorkflowEdge>[] = [
      { source: '1', target: '3' },
      { source: '2', target: '3' },
    ]
    const result = getNodeEnvMap(
      nodes as ComponentNode[],
      edges as WorkflowEdge[],
    )
    expect(result['3']).toEqual([
      {
        name: 'shared',
        type: VarTypes.String,
        source: { id: '1', title: '节点1' },
      },
      {
        name: 'shared',
        type: VarTypes.Number,
        source: { id: '2', title: '节点2' },
      },
    ])
  })

  test('复杂嵌套结构', () => {
    const nodes: PartialDeep<ComponentNode>[] = [
      {
        id: 'start',
        data: {
          vars: [{ name: 'input', type: VarTypes.String }],
          title: '开始节点',
        },
      },
      {
        id: 'process1',
        data: {
          vars: [{ name: 'temp1', type: VarTypes.Number }],
          title: '处理1',
        },
      },
      {
        id: 'process2',
        data: {
          vars: [{ name: 'temp2', type: VarTypes.String }],
          title: '处理2',
        },
      },
      { id: 'merge', data: { title: '合并', vars: [] } },
      {
        id: 'end',
        data: {
          vars: [{ name: 'output', type: VarTypes.String }],
          title: '结束',
        },
      },
    ]
    const edges: PartialDeep<WorkflowEdge>[] = [
      { source: 'start', target: 'process1' },
      { source: 'start', target: 'process2' },
      { source: 'process1', target: 'merge' },
      { source: 'process2', target: 'merge' },
      { source: 'merge', target: 'end' },
    ]
    const result = getNodeEnvMap(
      nodes as ComponentNode[],
      edges as WorkflowEdge[],
    )
    expect(result.merge).toEqual([
      {
        name: 'input',
        type: VarTypes.String,
        source: { id: 'start', title: '开始节点' },
      },
      {
        name: 'temp1',
        type: VarTypes.Number,
        source: { id: 'process1', title: '处理1' },
      },
      {
        name: 'temp2',
        type: VarTypes.String,
        source: { id: 'process2', title: '处理2' },
      },
    ])
    expect(result.end).toEqual([
      {
        name: 'input',
        type: VarTypes.String,
        source: { id: 'start', title: '开始节点' },
      },
      {
        name: 'temp1',
        type: VarTypes.Number,
        source: { id: 'process1', title: '处理1' },
      },
      {
        name: 'temp2',
        type: VarTypes.String,
        source: { id: 'process2', title: '处理2' },
      },
    ])
  })
})
