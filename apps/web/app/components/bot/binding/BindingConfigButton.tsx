import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { Button, Input, Label, TextField } from '@heroui/react'
import {
  RiCheckLine,
  RiCloseLine,
  RiEdit2Line,
  RiPlug2Line,
  RiSettings2Line,
} from '@remixicon/react'
import { useBoolean } from 'ahooks'
import { memo, useMemo } from 'react'
import { twMerge } from 'tailwind-merge'
import { useBotParam } from '../hooks/use-bot-param'
import { useBindingBotConfigQuery } from '@/app/hooks/query/bot/bridge/use-binding-bot-config-query'
import { useAppVersionDataQuery } from '@/app/hooks/query/workflow/use-app-version-data-query'
import type { Var } from '@shared/common/workflow/core/component-node'
import { VarTypes } from '@shared/common/workflow/core/component-node'
import { useBindingAddEnv } from './hooks/use-binding-add-env'

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

/* ──────────────── 单个环境变量行 ──────────────── */
const EnvItem = ({
  env,
  value,
  bindingId,
}: {
  env: Var;
  value: string | undefined;
  bindingId: string;
}) => {
  const {
    isEditing,
    setIsEditing,
    inputValue,
    setInputValue,
    handleSave,
    handleCancel,
    saving,
  } = useBindingAddEnv(bindingId, env, value)

  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-200 group hover:border-gray-300 transition-colors">
      <div className="flex items-center space-x-3 min-w-0 flex-1">
        <span className="text-sm font-medium text-gray-700 shrink-0">
          {env.name}
        </span>
        <span
          className={twMerge(
            'text-xs px-2 py-0.5 rounded-full font-medium shrink-0',
            typeColors[env.type],
          )}
        >
          {typeLabels[env.type]}
        </span>

        {isEditing ? (
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <TextField
              value={inputValue}
              onChange={setInputValue}
              className="flex-1 min-w-0"
            >
              <Label className="sr-only">值</Label>
              <Input placeholder="输入环境变量值" />
            </TextField>
            <button
              onClick={handleSave}
              disabled={saving || !inputValue.trim()}
              className="text-green-500 hover:text-green-700 transition-colors disabled:opacity-50"
            >
              <RiCheckLine className="w-4 h-4" />
            </button>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <RiCloseLine className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <span className="text-sm text-gray-500 truncate">
            {value || <span className="text-gray-300 italic">未设置</span>}
          </span>
        )}
      </div>

      {!isEditing && (
        <button
          onClick={setIsEditing.setTrue}
          className="text-gray-300 hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100 ml-2 shrink-0"
        >
          <RiEdit2Line className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

/* ──────────────── 环境变量配置表单 ──────────────── */
const EnvProviderForm = ({
  bindingId,
  ofAppId,
  ofAppVersion,
}: {
  bindingId: string;
  ofAppId: string;
  ofAppVersion: string;
}) => {
  const { botId } = useBotParam()
  const { data: bindingConfig } = useBindingBotConfigQuery(botId, bindingId)
  const { data: appConfig } = useAppVersionDataQuery(ofAppId, ofAppVersion)

  const envs = useMemo(() => appConfig?.envs ?? [], [appConfig])
  const envKV = useMemo(() => bindingConfig?.envKV ?? {}, [bindingConfig])

  if (envs.length === 0) {
    return (
      <div className="text-center text-sm text-gray-400 py-6">
        该插件没有定义环境变量
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {envs.map((env, index) => (
        <EnvItem
          key={`${env.name}-${index}`}
          env={env}
          value={envKV[env.name] != null ? String(envKV[env.name]) : undefined}
          bindingId={bindingId}
        />
      ))}
    </div>
  )
}

const BindingConfigButton = ({
  bindingId,
  ofAppId,
  ofAppVersion,
}: {
  bindingId: string;
  ofAppId: string;
  ofAppVersion: string;
}) => {
  const [isOpen, setIsOpen] = useBoolean(false)
  return (
    <>
      <Button
        size="sm"
        className={twMerge(
          'bg-linear-to-r from-blue-500 to-purple-500',
          'text-white shadow-md hover:shadow-lg',
          'hover:from-blue-600 hover:to-purple-600',
          'transition-all duration-200',
          'px-3 py-1.5',
        )}
        onClick={setIsOpen.setTrue}
      >
        <RiSettings2Line className="w-4 h-4" />
        <span className="ml-1">配置</span>
      </Button>
      <Dialog
        open={isOpen}
        onClose={setIsOpen.setFalse}
        className="relative z-50"
      >
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
                    插件绑定设置
                  </DialogTitle>
                </div>
                <button
                  onClick={setIsOpen.setFalse}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <RiCloseLine className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Desc */}
            <div className="px-6 pb-3 shrink-0">
              <span className="text-sm text-black/50">
                对绑定Bot的插件进行个性化设置
              </span>
            </div>

            {/* Env List */}
            <div className="px-6 pb-4 overflow-y-auto flex-1">
              <EnvProviderForm {...{ bindingId, ofAppId, ofAppVersion }} />
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  )
}

export default memo(BindingConfigButton)
