import { vi } from 'vitest'
import type { WorkflowThread } from '../../core/workflow/pool'
import type { WillTask } from '@/src/utils/task-pool'

type TestThreadOptions = {
  id?: string;
  nodeKv?: Record<string, Record<string, any>>;
  edges?: Array<{ source: string; target: string; sourceHandle?: string }>;
  commNodes?: Array<any>;
  consumedSubGraphNodes?: Array<any>;
}

export const createMockNextTask = () => {
  return {
    abort: vi.fn(),
  } as unknown as WillTask
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

  const thread = {
    id: options.id ?? 'thread-1',
    nodeKv: options.nodeKv ?? {},
    plugin: {
      edges: options.edges ?? [],
      commNodes: options.commNodes ?? [],
    },
    graphRunner,
    getSubGraphRunner: vi.fn(() => subGraphRunner),
    logger: {
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
      log: vi.fn(),
    },
  }

  return {
    thread: thread as unknown as WorkflowThread,
    graphRunner,
    subGraphRunner,
  }
}
