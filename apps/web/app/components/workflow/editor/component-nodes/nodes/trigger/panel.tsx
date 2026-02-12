import { memo } from 'react'
import type { ComponentPanelFc } from '../../types'
import type { TriggerData } from '@shared/common/workflow/node-data/trigger'
import { useTriggerCurd } from './hooks/use-trigger-curd'
import { TriggerOn } from '@shared/common/workflow/node-data/trigger'
import { Label, ListBox, Select } from '@heroui/react'
import ProviderEnv from '../../common/provider-env'
import InputWithEnv from '../../common/input-with-env'

const TriggerPanel: ComponentPanelFc<TriggerData> = ({ id, data }) => {
  const {
    vars,
    handleTriggerTargetChange,
    handleUserIdChange,
    handleGroupIdChange,
  } = useTriggerCurd(id)

  return (
    <div className="flex flex-col gap-4">
      <Select
        value={data.on}
        onChange={v => handleTriggerTargetChange(v as TriggerOn)}
      >
        <Label className="text-purple-700">触发类型</Label>
        <Select.Trigger>
          <Select.Value />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            <ListBox.Item id={TriggerOn.Friend}>私聊触发</ListBox.Item>
            <ListBox.Item id={TriggerOn.Group}>群聊触发</ListBox.Item>
          </ListBox>
        </Select.Popover>
      </Select>

      {data.on === TriggerOn.Friend && (
        <div className="flex flex-col gap-1">
          <Label className="text-purple-700">触发uid</Label>
          <InputWithEnv
            envs={vars}
            value={data.userId || ''}
            onChange={handleUserIdChange}
            className={{
              contentEditable:
                'text-md border border-purple-500 rounded-sm focus:border-purple-700 p-2',
              placeHolder: 'text-pink-200',
            }}
          />
        </div>
      )}

      {data.on === TriggerOn.Group && (
        <div className="flex flex-col gap-1">
          <Label className="text-purple-700">触发gid</Label>
          <InputWithEnv
            envs={vars}
            value={data.groupId || ''}
            onChange={handleGroupIdChange}
            className={{
              contentEditable:
                'text-md border border-purple-500 rounded-sm focus:border-purple-700 p-2',
              placeHolder: 'text-pink-200',
            }}
          />
        </div>
      )}
      <div className="border-b border-pink-200 py-2" />
      <ProviderEnv envs={data.vars} />
    </div>
  )
}
export default memo(TriggerPanel)
