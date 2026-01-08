'use client'
import { memo, useMemo } from 'react'
import {
  AdapterConfigContecxt,
  AdapterConfigSetterContext,
  useCreateBot,
} from './hooks/use-create-bot'
import { adapterComponent } from './constances'
import { Input, Label, TextArea, TextField } from '@heroui/react'
import { twMerge } from 'tailwind-merge'

const CreateBotWindow = () => {
  const {
    form,
    handleNameChange,
    handleDescriptionChange,
    handleAdapterConfigChange,
  } = useCreateBot()

  const ConfigArea = useMemo(
    () => adapterComponent[form.adapterTag],
    [form.adapterTag],
  )

  return (
    <div
      className={twMerge(
        'max-w-md mx-auto',
        'bg-linear-to-br from-pink-50 to-purple-50',
        'rounded-2xl shadow-lg p-8 border border-pink-100',
      )}
    >
      <h2 className="text-2xl font-bold text-center text-purple-600 mb-6">
        创建机器人
      </h2>

      <div className="space-y-6">
        <div className="space-y-4">
          <TextField value={form.name} onChange={handleNameChange}>
            <Label className="block text-sm font-medium text-purple-700 mb-2">
              机器人名称
            </Label>
            <Input
              maxLength={20}
              className="w-full rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 bg-white text-gray-700 placeholder-pink-300"
              placeholder="例如：我的小助手"
            />
          </TextField>

          <TextField value={form.description} onChange={handleDescriptionChange}>
            <Label className="block text-sm font-medium text-purple-700 mb-2">
              机器人描述
            </Label>
            <TextArea
              rows={4}
              maxLength={200}
              className={twMerge(
                'resize-none overflow-hidden',
                'w-full rounded-lg border border-pink-200',
                'focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent',
                'transition-all duration-200 bg-white text-gray-700 placeholder-pink-300',
              )}
              placeholder="简单描述一下这个机器人的用途"
            />
          </TextField>
        </div>

        <div className="rounded-xl border border-pink-200 bg-white/70 p-4 shadow-sm">
          <div className="text-sm font-semibold text-purple-700 mb-3">
            连接配置（Napcat WS）
          </div>

          <AdapterConfigContecxt.Provider value={form.adapterConfig}>
            <AdapterConfigSetterContext.Provider value={handleAdapterConfigChange}>
              <ConfigArea />
            </AdapterConfigSetterContext.Provider>
          </AdapterConfigContecxt.Provider>
        </div>
      </div>
    </div>
  )
}
export default memo(CreateBotWindow)
