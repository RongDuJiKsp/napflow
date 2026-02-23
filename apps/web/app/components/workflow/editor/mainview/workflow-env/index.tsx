import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { memo, useCallback, useState } from 'react'
import { RiAddLine, RiCloseLine, RiPlug2Line } from '@remixicon/react'
import { VarTypes } from '@shared/common/workflow/component-node'
import { twMerge } from 'tailwind-merge'
import {
  Button,
  Input,
  Label,
  ListBox,
  Select,
  TextField,
} from '@heroui/react'
import { useWorkflowEnvDialog } from './hooks/use-workflow-env-dialog'
import { useWorkflowEnvAdd } from './hooks/use-worlflow-env-add'

const typeColors: Record<VarTypes, string> = {
  [VarTypes.String]: 'bg-blue-100 text-blue-700',
  [VarTypes.Number]: 'bg-green-100 text-green-700',
  [VarTypes.StringArray]: 'bg-purple-100 text-purple-700',
  [VarTypes.NumberArray]: 'bg-pink-100 text-pink-700',
}

const typeLabels: Record<VarTypes, string> = {
  [VarTypes.String]: 'String',
  [VarTypes.Number]: 'Number',
  [VarTypes.StringArray]: 'StringArray',
  [VarTypes.NumberArray]: 'NumberArray',
}

const varTypeOptions = Object.values(VarTypes)

/* ──────────────── 环境变量列表 ──────────────── */
const EnvList = ({ isAdding }: { isAdding: boolean }) => {
  const { envs, deleteEnv } = useWorkflowEnvDialog()

  if (envs.length === 0 && !isAdding) {
    return (
      <div className="text-center text-sm text-gray-400 py-6">
        暂无环境变量，点击下方按钮添加
      </div>
    )
  }

  return (
    <div
      className={twMerge(
        'overflow-hidden transition-all duration-300 ease-in-out',
        isAdding ? 'max-h-0 opacity-0' : 'max-h-[999px] opacity-100',
      )}
    >
      <div className="space-y-2">
        {envs.map((env, index) => (
          <div
            key={`${env.name}-${index}`}
            className="flex items-center justify-between px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-200 group hover:border-gray-300 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">
                {env.name}
              </span>
              <span
                className={twMerge(
                  'text-xs px-2 py-0.5 rounded-full font-medium',
                  typeColors[env.type],
                )}
              >
                {typeLabels[env.type]}
              </span>
            </div>
            <button
              onClick={() => deleteEnv(index)}
              className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
            >
              <RiCloseLine className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ──────────────── 手风琴添加表单 ──────────────── */
const EnvAddAccordion = ({
  isAdding,
  setIsAdding,
}: {
  isAdding: boolean;
  setIsAdding: (adding: boolean) => void;
}) => {
  const onFinish = useCallback(() => {
    setIsAdding(false)
  }, [setIsAdding])
  const { form, setNewName, setNewType, handleAdd, handleCancel }
    = useWorkflowEnvAdd(onFinish)

  return (
    <div className="mt-3">
      <div
        className={twMerge(
          'overflow-hidden transition-all duration-300 ease-in-out',
          isAdding ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-200 space-y-3">
          <TextField value={form.newName} onChange={setNewName}>
            <Label className="text-blue-700">变量名</Label>
            <Input
              placeholder="输入变量名称"
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
          </TextField>

          <Select
            value={form.newType}
            onChange={v => setNewType(v as VarTypes)}
          >
            <Label className="text-blue-700">变量类型</Label>
            <Select.Trigger>
              <Select.Value />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {varTypeOptions.map(type => (
                  <ListBox.Item key={type} id={type}>
                    {typeLabels[type]}
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>

          <div className="flex justify-end space-x-2 pt-1">
            <Button variant="tertiary" onPress={handleCancel}>
              取消
            </Button>
            <Button onPress={handleAdd} isDisabled={!form.newName.trim()}>
              确认
            </Button>
          </div>
        </div>
      </div>

      {/* 添加按钮 */}
      {!isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full flex items-center justify-center space-x-1 py-2 text-sm text-gray-400 hover:text-blue-500 border border-dashed border-gray-300 hover:border-blue-400 rounded-lg transition-colors"
        >
          <RiAddLine className="w-4 h-4" />
          <span>添加环境变量</span>
        </button>
      )}
    </div>
  )
}

/* ──────────────── 主 Dialog ──────────────── */
const WorkflowEnvDialog = () => {
  const { isOpen, close } = useWorkflowEnvDialog()
  const [isAdding, setIsAdding] = useState(false)

  return (
    <Dialog open={isOpen} onClose={close} className="relative z-50">
      {/* Background */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="mx-auto rounded-2xl bg-white shadow-2xl overflow-hidden px-3 py-2 w-[45vw] min-h-[45vh] max-h-[70vh] flex flex-col">
          {/* Header */}
          <div className="px-6 pb-2 pt-4 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <RiPlug2Line className="w-6 h-6" />
                <DialogTitle className="text-lg font-semibold text-black/70">
                  环境变量
                </DialogTitle>
              </div>
              <button
                onClick={close}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <RiCloseLine className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Desc */}
          <div className="px-6 pb-3 shrink-0">
            <span className="text-sm text-black/50">
              环境变量在绑定bot时被设置，用于对发布的插件个性化
            </span>
          </div>

          {/* Env List + Add Form */}
          <div className="px-6 pb-4 overflow-y-auto flex-1">
            <EnvList isAdding={isAdding} />
            <EnvAddAccordion isAdding={isAdding} setIsAdding={setIsAdding} />
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}

export default memo(WorkflowEnvDialog)
