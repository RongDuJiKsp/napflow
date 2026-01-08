'use client'

import { Input, Label, TextField } from '@heroui/react'
import { memo } from 'react'
import { twMerge } from 'tailwind-merge'
import { useNapcatWsConfigForm } from '../hooks/use-napcat-ws-form'

const NapcatWsForm = () => {
  const { config, handleEndpointWsUrlChange, handleEndpointTokenChange } = useNapcatWsConfigForm()

  return (
    <div className="space-y-4">
      <TextField value={config.endpoint.wsUrl} onChange={handleEndpointWsUrlChange}>
        <Label className="block text-sm font-medium text-purple-700 mb-2">
          WebSocket 地址
        </Label>
        <Input
          className={twMerge(
            'w-full rounded-lg border border-pink-200',
            'focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent',
            'transition-all duration-200 bg-white text-gray-700 placeholder-pink-500',
          )}
          placeholder="例如：ws://127.0.0.1:3001"
        />
      </TextField>

      <TextField value={config.endpoint.token ?? ''} onChange={handleEndpointTokenChange}>
        <Label className="block text-sm font-medium text-purple-700 mb-2">
          Token（可选）
        </Label>
        <Input
          className={twMerge(
            'w-full rounded-lg border border-pink-200',
            'focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent',
            'transition-all duration-200 bg-white text-gray-700 placeholder-pink-500',
          )}
          placeholder="如果服务端需要鉴权，请填写"
        />
      </TextField>
    </div>
  )
}

export default memo(NapcatWsForm)
