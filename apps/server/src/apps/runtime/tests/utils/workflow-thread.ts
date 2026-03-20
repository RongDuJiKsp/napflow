import { vi } from 'vitest'
import type { WorkflowThread } from '../../core/workflow/pool'
import type { WillTask } from '@/src/utils/task-pool'
import { merge } from 'lodash-es'
import type { ComponentNodesEnum } from '@shared/common/workflow/core/component-node'
import { compileTemplate } from '../../utils/templates'

type TestThreadOptions = {
  id?: string;
  nodeKv?: Record<string, Record<string, any>>;
  edges?: Array<{ source: string; target: string; sourceHandle?: string }>;
  commNodes?: Array<any>;
  consumedSubGraphNodes?: Array<any>;
}

export const createMockNextTask = () => {
  const nextTask = {
    abort: vi.fn(),
    submit: vi.fn(),
    orSubmit: vi.fn(),
  }
  return nextTask as unknown as WillTask
}

export const createTestThread = (options: TestThreadOptions = {}) => {
  const graphRunner = {
    removeQueue: vi.fn(),
    enqueueNextMany: vi.fn(),
  }
  const subGraphRunner = {
    enqueue: vi.fn(),
    consumeAll: vi.fn(() => options.consumedSubGraphNodes ?? []),
  }

  const graphManager = {
    getSubGraphHead: vi.fn(
      (parentId: string, subHeadType: ComponentNodesEnum) => {
        const heads = (options.commNodes ?? []).filter(
          node =>
            node.parentId === parentId && node.data?.type === subHeadType,
        )
        if (heads.length !== 1) return null
        return heads[0]
      },
    ),
  }

  const thread = merge(
    {
      id: options.id ?? 'thread-1',
      nodeKv: options.nodeKv ?? {},
      compileEnvTemplate(template: string) {
        return compileTemplate(template, this as WorkflowThread)
      },
      plugin: {
        edges: options.edges ?? [],
        commNodes: options.commNodes ?? [],
        graphManager,
      },
      graphRunner,
      getSubGraphRunner: vi.fn(() => subGraphRunner),
      logger: {
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
        log: vi.fn(),
      },
    },
    {},
  )

  return {
    thread: thread as unknown as WorkflowThread,
    graphRunner,
    subGraphRunner,
  }
}
