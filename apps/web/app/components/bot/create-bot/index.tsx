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
import { Radio, RadioGroup } from '@headlessui/react'
import { AdapterTag } from '@shared/common/bot/base'

const adapterOptions = [
  {
    label: 'Napcat Ws Client',
    desc: '通过 WebSocket 作为客户端 连接 Napcat 服务',
    value: AdapterTag.napcatWs,
  },
]
const AdapterRadio = ({
  option,
}: {
  option: (typeof adapterOptions)[number];
}) => {
  return (
    <Radio value={option.value}>
      {({ checked }) => (
        <div
          className={twMerge(
            'cursor-pointer rounded-xl border p-4 shadow-sm transition-all duration-200',
            'bg-white/70',
            checked
              ? 'border-purple-300 ring-2 ring-purple-200'
              : 'border-pink-200 hover:shadow-md hover:bg-purple-50',
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-gray-800">
                {option.label}
              </div>
              <div className="mt-1 text-xs text-gray-500">{option.desc}</div>
            </div>

            <div
              className={twMerge(
                'h-5 w-5 rounded-full border transition-all duration-200',
                checked
                  ? 'border-transparent bg-linear-to-r from-purple-500 to-pink-500'
                  : 'border-pink-200 bg-white',
              )}
            />
          </div>
        </div>
      )}
    </Radio>
  )
}

const CreateBotWindow = () => {
  const {
    form,
    handleNameChange,
    handleDescriptionChange,
    handleAdapterTagChange,
    handleAdapterConfigChange,
  } = useCreateBot()

  const ConfigArea = useMemo(
    () => adapterComponent[form.adapterTag],
    [form.adapterTag],
  )

  return (
    <div
      className={twMerge(
        'max-w-4xl mx-auto',
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
              className="w-full rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 bg-white text-gray-700 placeholder-pink-500"
              placeholder="例如：我的小助手"
            />
          </TextField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <TextField
                value={form.description}
                onChange={handleDescriptionChange}
              >
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
                    'transition-all duration-200 bg-white text-gray-700 placeholder-pink-500',
                  )}
                  placeholder="简单描述一下这个机器人的用途"
                />
              </TextField>
            </div>

            <div className="space-y-4">
              <div>
                <div className="block text-sm font-medium text-purple-700 mb-2">
                  适配器类型
                </div>

                <RadioGroup
                  value={form.adapterTag}
                  onChange={handleAdapterTagChange}
                  className="grid grid-cols-1 gap-3"
                >
                  {adapterOptions.map(option => (
                    <AdapterRadio key={option.value} option={option} />
                  ))}
                </RadioGroup>
              </div>

              <div className="rounded-xl border border-pink-200 bg-white/70 p-4 shadow-sm">
                <div className="text-sm font-semibold text-purple-700 mb-3">
                  连接配置
                </div>

                <AdapterConfigContecxt.Provider value={form.adapterConfig}>
                  <AdapterConfigSetterContext.Provider
                    value={handleAdapterConfigChange}
                  >
                    <ConfigArea />
                  </AdapterConfigSetterContext.Provider>
                </AdapterConfigContecxt.Provider>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default memo(CreateBotWindow)
