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
    <div className="flex flex-col gap-3">
      {/*   触发类型选择   */}
      <div className="flex flex-col gap-2.5 p-3 bg-white/90 rounded-xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex flex-col gap-1">
          <Label className="text-purple-600 text-xs font-semibold tracking-wide">
            触发类型
          </Label>
          <Select
            value={data.on}
            onChange={v => handleTriggerTargetChange(v as TriggerOn)}
          >
            <Select.Trigger className="border-purple-200 hover:border-purple-400 transition-colors rounded-lg">
              <Select.Value />
            </Select.Trigger>
            <Select.Popover className="min-w-56">
              <ListBox>
                <ListBox.Item
                  id={TriggerOn.Friend}
                  className="px-2 py-1.5 cursor-pointer hover:bg-purple-50 transition-colors"
                >
                  <span className="text-sm"> 私聊触发</span>
                </ListBox.Item>
                <ListBox.Item
                  id={TriggerOn.Group}
                  className="px-2 py-1.5 cursor-pointer hover:bg-purple-50 transition-colors"
                >
                  <span className="text-sm"> 群聊触发</span>
                </ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
        </div>
      </div>

      {/*   私聊触发参数   */}
      {data.on === TriggerOn.Friend && (
        <div className="flex flex-col gap-2.5 p-3 bg-white/90 rounded-xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex flex-col gap-1">
            <Label className="text-purple-600 text-xs font-semibold tracking-wide">
              触发 UID
            </Label>
            <InputWithEnv
              envs={vars}
              value={data.userId || ''}
              onChange={handleUserIdChange}
              placeholder="输入用户ID，输入 $ 引用变量"
              className={{
                contentEditable:
                  'text-sm border border-purple-200 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-200 p-2 transition-all',
                placeHolder: 'text-gray-300',
              }}
            />
          </div>
        </div>
      )}

      {/*   群聊触发参数   */}
      {data.on === TriggerOn.Group && (
        <div className="flex flex-col gap-2.5 p-3 bg-white/90 rounded-xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex flex-col gap-1">
            <Label className="text-purple-600 text-xs font-semibold tracking-wide">
              触发 GID
            </Label>
            <InputWithEnv
              envs={vars}
              value={data.groupId || ''}
              onChange={handleGroupIdChange}
              placeholder="输入群组ID，输入 $ 引用变量"
              className={{
                contentEditable:
                  'text-sm border border-purple-200 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-200 p-2 transition-all',
                placeHolder: 'text-gray-300',
              }}
            />
          </div>
        </div>
      )}

      {/*   提供的环境变量   */}
      <div className="flex flex-col gap-2.5 p-3 bg-white/90 rounded-xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
        <ProviderEnv envs={data.vars} />
      </div>
    </div>
  )
}
export default memo(TriggerPanel)
