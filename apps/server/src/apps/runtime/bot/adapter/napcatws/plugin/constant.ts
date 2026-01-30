import type { NodeKlassMap } from '@/src/apps/runtime/core/workflow/constant'
import { NcTriggerNode } from './nodes.ts/trigger-node'
import { ComponentNodesEnum } from '@shared/common/workflow/component-node'
import { NcReplyNode } from './nodes.ts/reply-node'

export const NcKlassMap: typeof NodeKlassMap = {
  [ComponentNodesEnum.Trigger]: NcTriggerNode,
  [ComponentNodesEnum.Reply]: NcReplyNode,
}
