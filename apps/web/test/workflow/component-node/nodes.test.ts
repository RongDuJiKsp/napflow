import { getNodeEnvMap } from '@/app/components/workflow/editor/component-nodes/hooks/use-component-node-env'
import type { ComponentNode } from '@/app/components/workflow/editor/component-nodes/types'
import { VarTypes } from '@/app/components/workflow/editor/component-nodes/types'
import type { WorkflowEdge } from '@/app/components/workflow/editor/types'
import type { PartialDeep } from 'type-fest'

describe('正确收集节点的env', () => {
  test('正常收集', () => {
    const nodes: PartialDeep<ComponentNode>[] = [
      { id: '1', data: { vars: [{ name: 'a', type: VarTypes.String }], title: '节点Id1' } },
      { id: '2', data: { vars: [{ name: 'a', type: VarTypes.Number }], title: '节点Id2' } },
      { id: '3', data: { title: '' } },
    ]
    const edges: PartialDeep<WorkflowEdge>[] = [{
      source: '1',
      target: '3',
    },
    { source: '2', target: '3' }]
    expect(getNodeEnvMap(nodes as ComponentNode[], edges as WorkflowEdge[])).toEqual({
      1: [],
      2: [],
      3: [{
        name: 'a',
        type: VarTypes.String,
        source: { id: '1', title: '节点Id1' },
      },
      {
        name: 'a',
        type: VarTypes.Number,
        source: { id: '2', title: '节点Id2' },
      }],
    })
  })
})
