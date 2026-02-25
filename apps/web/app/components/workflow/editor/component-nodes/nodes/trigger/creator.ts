import type { ComponentCreator } from '../../types'
import { RiWebhookLine } from '@remixicon/react'
import TriggerNode from './node'
import TriggerPanel from './panel'
import { ComponentNodesEnum } from '@shared/common/workflow/component-node'
import { VarTypes } from '@shared/common/workflow/component-node'
import {
  TriggerDataSchema,
  TriggerOn,
} from '@shared/common/workflow/node-data/trigger'
import type { TriggerData } from '@shared/common/workflow/node-data/trigger'

export const TriggerNodeCreator: ComponentCreator<TriggerData> = {
  create: () => ({
    on: TriggerOn.Friend,
  }),
  schema: TriggerDataSchema,
  label: '消息触发器',
  icon: RiWebhookLine,
  nodeComponent: TriggerNode,
  editPanelComponent: TriggerPanel,
  prevNodes: [],
  nextNodes: [
    ComponentNodesEnum.Reply,
    ComponentNodesEnum.If,
    ComponentNodesEnum.Loop,
  ],
  env: [
    { type: VarTypes.String, name: 'trigger.triggerid' },
    { type: VarTypes.Number, name: 'trigger.uid' },
    { type: VarTypes.Number, name: 'trigger.gid' },
    { type: VarTypes.Number, name: 'trigger.messageid' },
    { type: VarTypes.String, name: 'trigger.msgreadable' },
  ],
}
