import type { NodeKlassMap } from '@/src/apps/runtime/core/workflow/constant'
import { NcTriggerNode } from './nodes/trigger-node'
import { ComponentNodesEnum } from '@shared/common/workflow/component-node'
import { NcReplyNode } from './nodes/reply-node'
import { IfNode } from '@/src/apps/runtime/core/workflow/nodes/if-node'
import { LoopNode } from '@/src/apps/runtime/core/workflow/nodes/loop-node'
import { LoopStartNode } from '@/src/apps/runtime/core/workflow/nodes/loop-start-node'
import { IterateNode } from '@/src/apps/runtime/core/workflow/nodes/iterate-node'
import { IterateStartNode } from '@/src/apps/runtime/core/workflow/nodes/iterate-start-node'
import { DifyNode } from '@/src/apps/runtime/core/workflow/nodes/dify-node'
import { JsonReadNode } from '@/src/apps/runtime/core/workflow/nodes/json-read-node'

export const NcKlassMap: typeof NodeKlassMap = {
  [ComponentNodesEnum.Trigger]: NcTriggerNode,
  [ComponentNodesEnum.Reply]: NcReplyNode,
  [ComponentNodesEnum.If]: IfNode,
  [ComponentNodesEnum.Loop]: LoopNode,
  [ComponentNodesEnum.LoopStart]: LoopStartNode,
  [ComponentNodesEnum.Iterate]: IterateNode,
  [ComponentNodesEnum.IterateStart]: IterateStartNode,
  [ComponentNodesEnum.Dify]: DifyNode,
  [ComponentNodesEnum.JsonRead]: JsonReadNode,
}
