import type { ComponentNodesEnum } from '@shared/common/workflow/component-node'
import type { IfData } from '@shared/common/workflow/node-data/if'
import type { IterateData } from '@shared/common/workflow/node-data/iterate'
import type { IterateStartData } from '@shared/common/workflow/node-data/iterate-start'
import type { LoopData } from '@shared/common/workflow/node-data/loop'
import type { LoopStartData } from '@shared/common/workflow/node-data/loop-start'
import type { ReplyData } from '@shared/common/workflow/node-data/reply'
import type { TriggerData } from '@shared/common/workflow/node-data/trigger'
import type { DifyData } from '@shared/common/workflow/node-data/dify'
import type { JsonReadData } from '@shared/common/workflow/node-data/json-read'
import type { ArrayIndexReadData } from '@shared/common/workflow/node-data/array-index-read'
import type { ComponentNode } from '../types'
import type { WorkflowNode } from '../../types'
import { safeAssertIsComponentNode } from '../../utils/node-asserts'

export type NodeDataTypeForEnum = {
  [ComponentNodesEnum.Trigger]: TriggerData;
  [ComponentNodesEnum.If]: IfData;
  [ComponentNodesEnum.Iterate]: IterateData;
  [ComponentNodesEnum.IterateStart]: IterateStartData;
  [ComponentNodesEnum.Loop]: LoopData;
  [ComponentNodesEnum.LoopStart]: LoopStartData;
  [ComponentNodesEnum.Reply]: ReplyData;
  [ComponentNodesEnum.Dify]: DifyData;
  [ComponentNodesEnum.JsonRead]: JsonReadData;
  [ComponentNodesEnum.ArrayIndexRead]: ArrayIndexReadData;
}

export type NodeTypeForEnum = {
  [K in ComponentNodesEnum]: ComponentNode<NodeDataTypeForEnum[K]>;
}

export const safeAssertComponentNode = <E extends ComponentNodesEnum>(
  type: E,
  node?: ComponentNode,
): NodeTypeForEnum[E] | null => {
  if (!node || node.data.type !== type) return null
  return node as NodeTypeForEnum[E]
}

export const safeAssertWorkflowNodeAsComponentNode = <
  E extends ComponentNodesEnum,
>(
  type: E,
  node?: WorkflowNode,
): NodeTypeForEnum[E] | null => {
  const componentNode = safeAssertIsComponentNode(node)
  if (!componentNode) return null
  return safeAssertComponentNode(type, componentNode)
}
