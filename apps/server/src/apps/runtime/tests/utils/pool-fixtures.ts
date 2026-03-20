import { vi } from 'vitest'
import type { Edge, Node } from '@shared/common/workflow/core'
import { NodeClassic } from '@shared/common/workflow/core'
import { ComponentNodesEnum } from '@shared/common/workflow/core/component-node'
import { ReplyTarget } from '@shared/common/workflow/node-data/reply'
import { TriggerOn } from '@shared/common/workflow/node-data/trigger'
import { Task } from '@/src/utils/task-pool'
import { NodeKlassMap } from '../../core/workflow/constant'
import type { CommNode, TriggerOnEvents } from '../../core/workflow/node'
import {
  CommPlugin,
  CommPluginTaskManager,
  GraphRunner,
  WorkflowThread,
} from '../../core/workflow/pool'

export type TestNode = Node
export type TestEdge = Edge

type GraphNode = {
  id: string;
}

export const TestNodes = {
  trigger(id = 'trigger-1'): TestNode {
    return {
      id,
      type: NodeClassic.Component,
      position: { x: 0, y: 0 },
      data: {
        type: ComponentNodesEnum.Trigger,
        vars: [],
        on: TriggerOn.Friend,
        userId: 'u1',
      },
    }
  },

  reply(id = 'reply-1'): TestNode {
    return {
      id,
      type: NodeClassic.Component,
      position: { x: 0, y: 0 },
      data: {
        type: ComponentNodesEnum.Reply,
        vars: [],
        content: 'pong',
        replyTarget: ReplyTarget.User,
        userId: 'u1',
      },
    }
  },

  note(id = 'note-1'): TestNode {
    return {
      id,
      type: NodeClassic.Note,
      position: { x: 0, y: 0 },
      data: {
        text: 'ignore note node',
      },
    }
  },
}

export const TestEdges = {
  link(source: string, target: string, id: string): TestEdge {
    return {
      id,
      source,
      target,
    }
  },
}

export const createDefaultWorkflowFixture = () => {
  const trigger = TestNodes.trigger('trigger-1')
  const reply = TestNodes.reply('reply-1')
  const note = TestNodes.note('note-1')

  const nodes: TestNode[] = [trigger, reply, note]
  const edges: TestEdge[] = [
    TestEdges.link('trigger-1', 'reply-1', 'e1'),
    TestEdges.link('note-1', 'reply-1', 'e2'),
  ]

  return {
    nodes,
    edges,
  }
}

export const createTestPlugin = (
  configs: { threadMaxLiveSecond?: number } = {},
) => {
  const { nodes, edges } = createDefaultWorkflowFixture()
  return new CommPlugin(
    nodes,
    edges,
    [],
    { envKV: { token: 'abc' } },
    NodeKlassMap,
    configs,
  )
}

const castGraphNode = (node: GraphNode): CommNode => {
  return node as unknown as CommNode
}

export const createGraphRunnerFixture = (
  adjacency: Record<string, string[]>,
  mainNodeIds: string[] | null = null,
) => {
  const nodeIds = new Set<string>(Object.keys(adjacency))
  for (const nextIds of Object.values(adjacency))
    for (const nextId of nextIds) nodeIds.add(nextId)

  const nodesById: Record<string, GraphNode> = {}
  for (const nodeId of nodeIds) nodesById[nodeId] = { id: nodeId }

  const prevMap = new Map<string, string[]>()
  for (const nodeId of nodeIds) prevMap.set(nodeId, [])

  for (const [source, nextIds] of Object.entries(adjacency))
    for (const target of nextIds) prevMap.get(target)!.push(source)

  const nodeGraph = new Map<CommNode, { prev: CommNode[]; next: CommNode[] }>()
  for (const nodeId of nodeIds) {
    const node = castGraphNode(nodesById[nodeId])
    const prev = (prevMap.get(nodeId) ?? []).map(id =>
      castGraphNode(nodesById[id]),
    )
    const next = (adjacency[nodeId] ?? []).map(id =>
      castGraphNode(nodesById[id]),
    )
    nodeGraph.set(node, { prev, next })
  }

  const commNodeCache: Record<string, CommNode> = {}
  for (const nodeId of nodeIds)
    commNodeCache[nodeId] = castGraphNode(nodesById[nodeId])

  const mainGraphNodes = mainNodeIds
    ? new Set(mainNodeIds.map(nodeId => castGraphNode(nodesById[nodeId])))
    : null

  return {
    runner: new GraphRunner(nodeGraph, mainGraphNodes, commNodeCache),
    nodesById: commNodeCache,
  }
}

export const createThreadFixture = (
  options: {
    endpoint?: TriggerOnEvents | string;
    threadMaxLiveSecond?: number;
    nodeImpl?: ReturnType<typeof vi.fn>;
  } = {},
) => {
  const onThread = options.nodeImpl ?? vi.fn(async () => Promise.resolve())
  const triggerNode = {
    id: 'trigger-mock',
    triggerEv: 'chatMessage',
    onThread,
  }

  const plugin = {
    taskManager: {
      threads: {} as Record<string, WorkflowThread>,
      tasks: {},
      removeThread: vi.fn(),
    },
    configs: {
      threadMaxLiveSecond: options.threadMaxLiveSecond,
    },
    graphManager: {
      nodeGraph: new Map([[triggerNode, { prev: [], next: [] }]]),
      graphHeadConnectedNodes: new Set([triggerNode]),
      commNodeCache: { [triggerNode.id]: triggerNode },
      graphHead: triggerNode,
      commNodes: [triggerNode],
      getSubGraph: vi.fn(() => new Map()),
    },
  }
  plugin.taskManager.removeThread.mockImplementation(
    CommPluginTaskManager.prototype.removeThread.bind(plugin.taskManager),
  )

  const endpoint = (options.endpoint ?? 'chatMessage') as TriggerOnEvents
  const thread = new WorkflowThread(endpoint, plugin as unknown as CommPlugin)
  plugin.taskManager.threads[thread.id] = thread

  return {
    thread,
    plugin,
    onThread,
  }
}

export const createWillTaskSpy = () => {
  const nextTask = Task.will(() => undefined)
  return {
    nextTask,
    abortSpy: vi.spyOn(nextTask, 'abort'),
  }
}
