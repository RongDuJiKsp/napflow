import { memo } from 'react'
import type { ComponentPanelFc } from '../../types'
import type { TriggerData } from './creator'
import { useTriggerCurd } from './hooks/use-trigger-curd'
import { TriggerOn } from './creator'
import {
  Input,
  Label,
  ListBox,
  Select,
  TextField,
} from '@heroui/react'

const TriggerPanel: ComponentPanelFc<TriggerData> = ({ node }) => {
  const {
    handleTriggerTargetChange,
    handleUserIdChange,
    handleGroupIdChange,
  } = useTriggerCurd(node)

  return (
    <div className="flex flex-col gap-4">
      <Select
        value={node.data.on}
        onChange={v => handleTriggerTargetChange(v as TriggerOn)}
      >
        <Label>触发类型</Label>
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

      {node.data.on === TriggerOn.Friend && (
        <TextField
          value={node.data.userId || ''}
          onChange={handleUserIdChange}
        >
          <Label>触发uid</Label>
          <Input />
        </TextField>
      )}

      {node.data.on === TriggerOn.Group && (
        <TextField
          value={node.data.groupId || ''}
          onChange={handleGroupIdChange}
        >
          <Label>触发gid</Label>
          <Input />
        </TextField>
      )}
    </div>
  )
}
export default memo(TriggerPanel)
