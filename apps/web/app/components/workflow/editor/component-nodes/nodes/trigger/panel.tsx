import { memo } from 'react'
import type { ComponentPanelFc } from '../../types'
import type { TriggerData } from './creator'
import { useTriggerCurd } from './hooks/use-trigger-curd'
import { TriggerOn } from './creator'
import { Input, Label, ListBox, Select, TextField } from '@heroui/react'
import ProviderEnv from '../../common/provider-env'

const TriggerPanel: ComponentPanelFc<TriggerData> = ({ id, data }) => {
  const { handleTriggerTargetChange, handleUserIdChange, handleGroupIdChange }
    = useTriggerCurd(id)

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
        <TextField value={data.userId || ''} onChange={handleUserIdChange}>
          <Label className="text-purple-700">触发uid</Label>
          <Input />
        </TextField>
      )}

      {data.on === TriggerOn.Group && (
        <TextField value={data.groupId || ''} onChange={handleGroupIdChange}>
          <Label className="text-purple-700">触发gid</Label>
          <Input />
        </TextField>
      )}
      <div className="border-b border-pink-200 py-2" />
      <ProviderEnv envs={data.vars} />
    </div>
  )
}
export default memo(TriggerPanel)
