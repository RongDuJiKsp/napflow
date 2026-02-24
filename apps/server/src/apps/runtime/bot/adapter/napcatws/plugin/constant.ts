import type { NodeKlassMap } from '@/src/apps/runtime/core/workflow/constant'
import { NcTriggerNode } from './nodes/trigger-node'
import { ComponentNodesEnum } from '@shared/common/workflow/component-node'
import { NcReplyNode } from './nodes/reply-node'
import { IfNode } from '@/src/apps/runtime/core/workflow/nodes/if-node'
import { LoopNode } from '@/src/apps/runtime/core/workflow/nodes/loop-node'
import { LoopStartNode } from '@/src/apps/runtime/core/workflow/nodes/loop-start-node'

export const NcKlassMap: typeof NodeKlassMap = {
  [ComponentNodesEnum.Trigger]: NcTriggerNode,
  [ComponentNodesEnum.Reply]: NcReplyNode,
  [ComponentNodesEnum.If]: IfNode,
  [ComponentNodesEnum.Loop]: LoopNode,
  [ComponentNodesEnum.LoopStart]: LoopStartNode,
}
