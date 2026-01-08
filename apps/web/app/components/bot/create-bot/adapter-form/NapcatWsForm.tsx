'use client'

import { Input, Label, TextField } from '@heroui/react'
import type { NapcatWsAdapterConfig } from '@shared/common/bot/napcatws-adapter'
import { memo, useCallback, useMemo } from 'react'
import { twMerge } from 'tailwind-merge'
import { z } from 'zod'
import { useNapcatWsConfigForm } from '../hooks/use-napcat-ws-form'

const schema = z.object({
  endpoint: z.object({
    wsUrl: z
      .string()
      .trim()
      .min(1, '请输入 WebSocket 地址')
      .url('WebSocket 地址格式不正确（例如：ws://127.0.0.1:3001）')
      .refine(v => v.startsWith('ws://') || v.startsWith('wss://'), {
        message: 'WebSocket 地址必须以 ws:// 或 wss:// 开头',
      }),
    token: z.string().trim().optional(),
  }),
})

type Errors = Partial<Record<'wsUrl' | 'token', string>>

const NapcatWsForm = () => {
  const { config, setConfig } = useNapcatWsConfigForm()

  const safeConfig = useMemo<NapcatWsAdapterConfig>(
    () => ({
      endpoint: {
        wsUrl: config?.endpoint?.wsUrl ?? '',
        token: config?.endpoint?.token ?? '',
      },
    }),
    [config?.endpoint?.token, config?.endpoint?.wsUrl],
  )

  const errors = useMemo<Errors>(() => {
    const result = schema.safeParse(safeConfig)
    if (result.success) return {}

    const fieldErrors = result.error.flatten().fieldErrors
    return {
      wsUrl: fieldErrors.endpoint?.[0] ?? undefined,
      token: undefined,
    }
  }, [safeConfig])

  const handleWsUrlChange = useCallback(
    (v: string) => {
      setConfig({
        ...safeConfig,
        endpoint: {
          ...safeConfig.endpoint,
          wsUrl: v,
        },
      })
    },
    [safeConfig, setConfig],
  )

  const handleTokenChange = useCallback(
    (v: string) => {
      setConfig({
        ...safeConfig,
        endpoint: {
          ...safeConfig.endpoint,
          token: v,
        },
      })
    },
    [safeConfig, setConfig],
  )

  return (
    <div className="space-y-4">
      <TextField value={safeConfig.endpoint.wsUrl} onChange={handleWsUrlChange}>
        <Label className="block text-sm font-medium text-purple-700 mb-2">
          WebSocket 地址
        </Label>
        <Input
          className={twMerge(
            'w-full rounded-lg border border-pink-200',
            'focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent',
            'transition-all duration-200 bg-white text-gray-700 placeholder-pink-300',
          )}
          placeholder="例如：ws://127.0.0.1:3001"
        />
        {errors.wsUrl && (
          <div className="mt-2 text-sm text-red-600">{errors.wsUrl}</div>
        )}
        {!errors.wsUrl && (
          <div className="mt-2 text-xs text-gray-500">
            支持 `ws://` 或 `wss://`，建议生产环境使用 `wss://`。
          </div>
        )}
      </TextField>

      <TextField value={safeConfig.endpoint.token ?? ''} onChange={handleTokenChange}>
        <Label className="block text-sm font-medium text-purple-700 mb-2">
          Token（可选）
        </Label>
        <Input
          className={twMerge(
            'w-full rounded-lg border border-pink-200',
            'focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent',
            'transition-all duration-200 bg-white text-gray-700 placeholder-pink-300',
          )}
          placeholder="如果服务端需要鉴权，请填写"
        />
      </TextField>
    </div>
  )
}

export default memo(NapcatWsForm)
