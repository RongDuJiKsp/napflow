import { getNodeEnvMap } from '@/app/components/workflow/editor/component-nodes/hooks/use-component-node-env'
import type { ComponentNode } from '@/app/components/workflow/editor/component-nodes/types'
import type { Var } from '@shared/common/workflow/component-node'
import { ComponentNodesEnum, VarTypes } from '@shared/common/workflow/component-node'
import type { TestEdge, TestNodeWithData, WorkflowEdge } from '../../utils'
import { describe, expect, test } from 'vitest'

type TestComponentNode = TestNodeWithData<{
  title: string;
  vars: Var[];
  sourceVarName?: string;
  type: ComponentNodesEnum
}>

describe('测试getNodeEnvMap能否正确收集节点的env', () => {
  test('正常收集', () => {
    const nodes: TestComponentNode[] = [
      {
        id: '1',
        data: {
          vars: [{ name: 'a', type: VarTypes.String }],
          title: '节点Id1',
          type: ComponentNodesEnum.Trigger,
        },
      },
      {
        id: '2',
        data: {
          vars: [{ name: 'a', type: VarTypes.Number }],
          title: '节点Id2',
          type: ComponentNodesEnum.Reply,
        },
      },
      {
        id: '3',
        data: { title: '', vars: [], type: ComponentNodesEnum.Reply },
      },
    ]
    const edges: TestEdge[] = [
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
    const nodes: TestComponentNode[] = []
    const edges: TestEdge[] = []
    expect(
      getNodeEnvMap(nodes as ComponentNode[], edges as WorkflowEdge[]),
    ).toEqual({})
  })

  test('只有节点没有边', () => {
    const nodes: TestComponentNode[] = [
      {
        id: '1',
        data: {
          vars: [{ name: 'a', type: VarTypes.String }],
          title: '节点1',
          type: ComponentNodesEnum.Trigger,
        },
      },
      {
        id: '2',
        data: {
          vars: [{ name: 'b', type: VarTypes.Number }],
          title: '节点2',
          type: ComponentNodesEnum.Reply,
        },
      },
    ]
    const edges: TestEdge[] = []
    expect(
      getNodeEnvMap(nodes as ComponentNode[], edges as WorkflowEdge[]),
    ).toEqual({
      1: [],
      2: [],
    })
  })

  test('链式结构', () => {
    const nodes: TestComponentNode[] = [
      {
        id: '1',
        data: {
          vars: [{ name: 'var1', type: VarTypes.String }],
          title: '节点1',
          type: ComponentNodesEnum.Trigger,
        },
      },
      {
        id: '2',
        data: {
          vars: [{ name: 'var2', type: VarTypes.Number }],
          title: '节点2',
          type: ComponentNodesEnum.Reply,
        },
      },
      {
        id: '3',
        data: {
          vars: [{ name: 'var3', type: VarTypes.String }],
          title: '节点3',
          type: ComponentNodesEnum.Reply,
        },
      },
    ]
    const edges: TestEdge[] = [
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
    const nodes: TestComponentNode[] = [
      {
        id: '1',
        data: {
          vars: [{ name: 'a', type: VarTypes.String }],
          title: '节点1',
          type: ComponentNodesEnum.Trigger,
        },
      },
      {
        id: '2',
        data: {
          vars: [{ name: 'b', type: VarTypes.Number }],
          title: '节点2',
          type: ComponentNodesEnum.Trigger,
        },
      },
      {
        id: '3',
        data: {
          vars: [{ name: 'c', type: VarTypes.String }],
          title: '节点3',
          type: ComponentNodesEnum.Trigger,
        },
      },
      {
        id: '4',
        data: { title: '合并节点', vars: [], type: ComponentNodesEnum.If },
      },
      {
        id: '5',
        data: { title: '后置节点1', vars: [], type: ComponentNodesEnum.Reply },
      },
      {
        id: '6',
        data: { title: '后置节点2', vars: [], type: ComponentNodesEnum.Reply },
      },
    ]
    const edges: TestEdge[] = [
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
    const nodes: TestComponentNode[] = [
      {
        id: '1',
        data: {
          vars: [{ name: 'a', type: VarTypes.String }],
          title: '节点1',
          type: ComponentNodesEnum.Trigger,
        },
      },
      {
        id: '2',
        data: {
          vars: [{ name: 'b', type: VarTypes.Number }],
          title: '孤立节点',
          type: ComponentNodesEnum.Trigger,
        },
      },
      {
        id: '3',
        data: {
          vars: [{ name: 'c', type: VarTypes.String }],
          title: '节点3',
          type: ComponentNodesEnum.Reply,
        },
      },
    ]
    const edges: TestEdge[] = [{ source: '1', target: '3' }]
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
    const nodes: TestComponentNode[] = [
      {
        id: '1',
        data: {
          vars: [{ name: 'shared', type: VarTypes.String }],
          title: '节点1',
          type: ComponentNodesEnum.Trigger,
        },
      },
      {
        id: '2',
        data: {
          vars: [{ name: 'shared', type: VarTypes.Number }],
          title: '节点2',
          type: ComponentNodesEnum.Trigger,
        },
      },
      {
        id: '3',
        data: { title: '合并节点', vars: [], type: ComponentNodesEnum.If },
      },
    ]
    const edges: TestEdge[] = [
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
    const nodes: TestComponentNode[] = [
      {
        id: 'start',
        data: {
          vars: [{ name: 'input', type: VarTypes.String }],
          title: '开始节点',
          type: ComponentNodesEnum.Trigger,
        },
      },
      {
        id: 'process1',
        data: {
          vars: [{ name: 'temp1', type: VarTypes.Number }],
          title: '处理1',
          type: ComponentNodesEnum.If,
        },
      },
      {
        id: 'process2',
        data: {
          vars: [{ name: 'temp2', type: VarTypes.String }],
          title: '处理2',
          type: ComponentNodesEnum.If,
        },
      },
      {
        id: 'merge',
        data: { title: '合并', vars: [], type: ComponentNodesEnum.If },
      },
      {
        id: 'end',
        data: {
          vars: [{ name: 'output', type: VarTypes.String }],
          title: '结束',
          type: ComponentNodesEnum.Reply,
        },
      },
    ]
    const edges: TestEdge[] = [
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

  test('loop-start 通过 parentId 继承 loop 节点的 env', () => {
    const nodes: TestComponentNode[] = [
      {
        id: 'trigger',
        data: {
          vars: [{ name: 'input', type: VarTypes.String }],
          title: '触发器',
          type: ComponentNodesEnum.Trigger,
        },
      },
      {
        id: 'loop',
        data: {
          vars: [
            { name: 'index', type: VarTypes.Number },
            { name: 'maxIndex', type: VarTypes.Number },
          ],
          title: '循环节点',
          type: ComponentNodesEnum.Loop,
        },
      },
      {
        id: 'loop-start',
        parentId: 'loop',
        data: {
          vars: [{ name: 'item', type: VarTypes.String }],
          title: '循环开始',
          type: ComponentNodesEnum.LoopStart,
        },
      },
    ]
    const edges: TestEdge[] = [{ source: 'trigger', target: 'loop' }]
    const result = getNodeEnvMap(
      nodes as ComponentNode[],
      edges as WorkflowEdge[],
    )
    // loop 节点能读取 trigger 的 env
    expect(result.loop).toEqual([
      {
        name: 'input',
        type: VarTypes.String,
        source: { id: 'trigger', title: '触发器' },
      },
    ])
    // loop-start 通过 parentId 继承 loop 的 env 和 loop 自身的 vars
    expect(result['loop-start']).toEqual([
      {
        name: 'input',
        type: VarTypes.String,
        source: { id: 'trigger', title: '触发器' },
      },
      {
        name: 'index',
        type: VarTypes.Number,
        source: { id: 'loop', title: '循环节点' },
      },
      {
        name: 'maxIndex',
        type: VarTypes.Number,
        source: { id: 'loop', title: '循环节点' },
      },
    ])
  })

  test('loop-start 后的子节点能读取完整的 env 链', () => {
    const nodes: TestComponentNode[] = [
      {
        id: 'trigger',
        data: {
          vars: [{ name: 'userInput', type: VarTypes.String }],
          title: '触发器',
          type: ComponentNodesEnum.Trigger,
        },
      },
      {
        id: 'loop',
        data: {
          vars: [{ name: 'index', type: VarTypes.Number }],
          title: '循环节点',
          type: ComponentNodesEnum.Loop,
        },
      },
      {
        id: 'loop-start',
        parentId: 'loop',
        data: {
          vars: [{ name: 'item', type: VarTypes.String }],
          title: '循环开始',
          type: ComponentNodesEnum.LoopStart,
        },
      },
      {
        id: 'inner-node',
        data: {
          vars: [{ name: 'result', type: VarTypes.String }],
          title: '内部节点',
          type: ComponentNodesEnum.Reply,
        },
      },
    ]
    const edges: TestEdge[] = [
      { source: 'trigger', target: 'loop' },
      { source: 'loop-start', target: 'inner-node' },
    ]
    const result = getNodeEnvMap(
      nodes as ComponentNode[],
      edges as WorkflowEdge[],
    )
    // inner-node 应能读取到完整链路的 env：trigger -> loop -> loop-start -> inner-node
    expect(result['inner-node']).toEqual([
      {
        name: 'userInput',
        type: VarTypes.String,
        source: { id: 'trigger', title: '触发器' },
      },
      {
        name: 'index',
        type: VarTypes.Number,
        source: { id: 'loop', title: '循环节点' },
      },
      {
        name: 'item',
        type: VarTypes.String,
        source: { id: 'loop-start', title: '循环开始' },
      },
    ])
  })

  test('多个前驱节点汇入 loop 时，loop-start 能继承所有 env', () => {
    const nodes: TestComponentNode[] = [
      {
        id: 'node-a',
        data: {
          vars: [{ name: 'varA', type: VarTypes.String }],
          title: '节点A',
          type: ComponentNodesEnum.Trigger,
        },
      },
      {
        id: 'node-b',
        data: {
          vars: [{ name: 'varB', type: VarTypes.Number }],
          title: '节点B',
          type: ComponentNodesEnum.Trigger,
        },
      },
      {
        id: 'loop',
        data: {
          vars: [{ name: 'loopVar', type: VarTypes.Number }],
          title: '循环节点',
          type: ComponentNodesEnum.Loop,
        },
      },
      {
        id: 'loop-start',
        parentId: 'loop',
        data: {
          vars: [{ name: 'item', type: VarTypes.String }],
          title: '循环开始',
          type: ComponentNodesEnum.LoopStart,
        },
      },
    ]
    const edges: TestEdge[] = [
      { source: 'node-a', target: 'loop' },
      { source: 'node-b', target: 'loop' },
    ]
    const result = getNodeEnvMap(
      nodes as ComponentNode[],
      edges as WorkflowEdge[],
    )
    // loop-start 应继承 node-a、node-b 的 env 以及 loop 自身的 vars
    expect(result['loop-start']).toEqual([
      {
        name: 'varA',
        type: VarTypes.String,
        source: { id: 'node-a', title: '节点A' },
      },
      {
        name: 'varB',
        type: VarTypes.Number,
        source: { id: 'node-b', title: '节点B' },
      },
      {
        name: 'loopVar',
        type: VarTypes.Number,
        source: { id: 'loop', title: '循环节点' },
      },
    ])
  })

  test('parentId 指向不存在的节点时不影响正常逻辑', () => {
    const nodes: TestComponentNode[] = [
      {
        id: '1',
        data: {
          vars: [{ name: 'a', type: VarTypes.String }],
          title: '节点1',
          type: ComponentNodesEnum.Trigger,
        },
      },
      {
        id: '2',
        parentId: 'non-existent',
        data: {
          vars: [{ name: 'b', type: VarTypes.Number }],
          title: '节点2',
          type: ComponentNodesEnum.Reply,
        },
      },
    ]
    const edges: TestEdge[] = [{ source: '1', target: '2' }]
    const result = getNodeEnvMap(
      nodes as ComponentNode[],
      edges as WorkflowEdge[],
    )
    // 即使 parentId 不存在，正常边关系仍应正常工作
    expect(result['1']).toEqual([])
    expect(result['2']).toEqual([
      {
        name: 'a',
        type: VarTypes.String,
        source: { id: '1', title: '节点1' },
      },
    ])
  })

  test('loop-start 无外部前驱时仅继承 loop 自身 vars', () => {
    const nodes: TestComponentNode[] = [
      {
        id: 'loop',
        data: {
          vars: [
            { name: 'index', type: VarTypes.Number },
            { name: 'maxIndex', type: VarTypes.Number },
          ],
          title: '循环节点',
          type: ComponentNodesEnum.Loop,
        },
      },
      {
        id: 'loop-start',
        parentId: 'loop',
        data: {
          vars: [{ name: 'item', type: VarTypes.String }],
          title: '循环开始',
          type: ComponentNodesEnum.LoopStart,
        },
      },
    ]
    const edges: TestEdge[] = []
    const result = getNodeEnvMap(
      nodes as ComponentNode[],
      edges as WorkflowEdge[],
    )
    // loop 没有前驱节点，env 为空
    expect(result.loop).toEqual([])
    // loop-start 仅能读取到 loop 自身的 vars
    expect(result['loop-start']).toEqual([
      {
        name: 'index',
        type: VarTypes.Number,
        source: { id: 'loop', title: '循环节点' },
      },
      {
        name: 'maxIndex',
        type: VarTypes.Number,
        source: { id: 'loop', title: '循环节点' },
      },
    ])
  })

  test('iterate-start 后续节点的 iter.item 类型跟随 StringArray 推导为 String', () => {
    const nodes: TestComponentNode[] = [
      {
        id: 'trigger',
        data: {
          vars: [{ name: 'arr', type: VarTypes.StringArray }],
          title: '触发器',
          type: ComponentNodesEnum.Trigger,
        },
      },
      {
        id: 'iterate',
        data: {
          vars: [],
          title: '迭代节点',
          sourceVarName: 'trigger.arr',
          type: ComponentNodesEnum.Iterate,
        },
      },
      {
        id: 'iterate-start',
        parentId: 'iterate',
        data: {
          vars: [],
          title: '迭代起点',
          type: ComponentNodesEnum.IterateStart,
        },
      },
      {
        id: 'inner-node',
        data: {
          vars: [],
          title: '内部节点',
          type: ComponentNodesEnum.Reply,
        },
      },
    ]
    const edges: TestEdge[] = [
      { source: 'trigger', target: 'iterate' },
      { source: 'iterate-start', target: 'inner-node' },
    ]

    const result = getNodeEnvMap(
      nodes as ComponentNode[],
      edges as WorkflowEdge[],
    )

    expect(result['inner-node']).toEqual([
      {
        name: 'arr',
        type: VarTypes.StringArray,
        source: { id: 'trigger', title: '触发器' },
      },
      {
        name: 'iter.item',
        type: VarTypes.String,
        source: { id: 'iterate-start', title: '迭代起点' },
      },
    ])
  })

  test('iterate-start 后续节点的 iter.item 类型跟随 NumberArray 推导为 Number', () => {
    const nodes: TestComponentNode[] = [
      {
        id: 'trigger',
        data: {
          vars: [{ name: 'nums', type: VarTypes.NumberArray }],
          title: '触发器',
          type: ComponentNodesEnum.Trigger,
        },
      },
      {
        id: 'iterate',
        data: {
          vars: [],
          title: '迭代节点',
          sourceVarName: 'trigger.nums',
          type: ComponentNodesEnum.Iterate,
        },
      },
      {
        id: 'iterate-start',
        parentId: 'iterate',
        data: {
          vars: [],
          title: '迭代起点',
          type: ComponentNodesEnum.IterateStart,
        },
      },
      {
        id: 'inner-node',
        data: {
          vars: [],
          title: '内部节点',
          type: ComponentNodesEnum.Reply,
        },
      },
    ]
    const edges: TestEdge[] = [
      { source: 'trigger', target: 'iterate' },
      { source: 'iterate-start', target: 'inner-node' },
    ]

    const result = getNodeEnvMap(
      nodes as ComponentNode[],
      edges as WorkflowEdge[],
    )

    expect(result['inner-node']).toEqual([
      {
        name: 'nums',
        type: VarTypes.NumberArray,
        source: { id: 'trigger', title: '触发器' },
      },
      {
        name: 'iter.item',
        type: VarTypes.Number,
        source: { id: 'iterate-start', title: '迭代起点' },
      },
    ])
  })
})
