'use client'

import { Input, Label, TextField } from '@heroui/react'
import { memo } from 'react'
import { twMerge } from 'tailwind-merge'
import { useNapcatWsConfigForm } from '../hooks/use-napcat-ws-form'

const NapcatWsForm = () => {
  const {
    config,
    handleEndpointWsUrlChange,
    handleEndpointTokenChange,
    handleReconnectMaxAttemptsChange,
    handleReconnectIntervalChange,
    handleHeartBeatDurationlChange,
  } = useNapcatWsConfigForm()

  return (
    <div className="space-y-4">
      <TextField
        value={config.endpoint.wsUrl}
        onChange={handleEndpointWsUrlChange}
      >
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

      <TextField
        value={config.endpoint.token ?? ''}
        onChange={handleEndpointTokenChange}
      >
        <Label className="block text-sm font-medium text-purple-700 mb-2">
          Token（可选）
        </Label>
        <Input
          className={twMerge(
            'w-full rounded-lg border border-pink-200',
            'focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent',
            'transition-all duration-200 bg-white text-gray-700 placeholder-pink-500',
          )}
          placeholder="与NapCat服务端配置项‘token’一致"
        />
      </TextField>

      <div>
        <Label className="block text-sm font-medium text-purple-700 mb-2">
          重连配置
        </Label>
        <div className="flex gap-3">
          <TextField
            value={String(config.retryConfig?.retryMaxTimes ?? '')}
            onChange={handleReconnectMaxAttemptsChange}
          >
            <Label className="block text-xs text-gray-600 mb-1">
              最大重连次数
            </Label>
            <Input
              type="number"
              className={twMerge(
                'w-full rounded-lg border border-pink-200',
                'focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent',
                'transition-all duration-200 bg-white text-gray-700 placeholder-pink-500',
              )}
              placeholder="为0时关闭重连"
              min={0}
            />
          </TextField>

          <TextField
            value={String(config.retryConfig?.retryDelay ?? '')}
            onChange={handleReconnectIntervalChange}
          >
            <Label className="block text-xs text-gray-600 mb-1">
              重连间隔（ms）
            </Label>
            <Input
              type="number"
              className={twMerge(
                'w-full rounded-lg border border-pink-200',
                'focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent',
                'transition-all duration-200 bg-white text-gray-700 placeholder-pink-500',
              )}
              placeholder="例如：1000"
              min={1000}
              step={100}
            />
          </TextField>
        </div>
      </div>
      <div>
        <Label className="block text-sm font-medium text-purple-700 mb-2">
          健康性检查
        </Label>
        <div className="flex gap-3">
          <TextField
            value={String(config.heartBeatDuration ?? '')}
            onChange={handleHeartBeatDurationlChange}
          >
            <Label className="block text-xs text-gray-600 mb-1">
              心跳间隔（ms）
            </Label>
            <Input
              className={twMerge(
                'w-full rounded-lg border border-pink-200',
                'focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent',
                'transition-all duration-200 bg-white text-gray-700 placeholder-pink-500',
              )}
              placeholder="与服务端‘心跳间隔’一致"
            />
          </TextField>
        </div>
      </div>
    </div>
  )
}

export default memo(NapcatWsForm)
