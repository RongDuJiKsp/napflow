'use client'

import { useCallback, useState } from 'react'
import SettingLayout from '@/app/components/setting/layouts/SettingLayout'
import ApiKeyConfigListWindow from '@/app/components/setting/models/ApiKeyConfigListWindow'
import ApiKeyConfigFormDialog from '@/app/components/setting/models/ApiKeyConfigFormDialog'
import type {
  OpenAIApiModelConfig,
  OpenAIApiModelInput,
} from '@/app/components/setting/models/types'

type DialogState =
  | { mode: 'create' }
  | { mode: 'edit'; targetId: string }
  | null

export default function Page() {
  const [configs, setConfigs] = useState<OpenAIApiModelConfig[]>([
    {
      id: '1',
      endpoint: 'https://api.openai.com/v1',
      apiKey: 'sk-proj-****a2Zx',
      model: 'gpt-4o',
    },
    {
      id: '2',
      endpoint: 'https://openrouter.ai/api/v1',
      apiKey: 'sk-or-v1-****m9Qp',
      model: 'openai/gpt-4.1-mini',
    },
  ])
  const [dialogState, setDialogState] = useState<DialogState>(null)

  const handleOpenCreateDialog = useCallback(() => {
    setDialogState({ mode: 'create' })
  }, [])

  const handleOpenEditDialog = useCallback((targetId: string) => {
    setDialogState({ mode: 'edit', targetId })
  }, [])

  const handleCloseDialog = useCallback(() => {
    setDialogState(null)
  }, [])

  const handleDelete = useCallback((targetId: string) => {
    setConfigs(current => current.filter(config => config.id !== targetId))
  }, [])

  const handleSubmitForm = useCallback(
    (value: OpenAIApiModelInput) => {
      if (dialogState?.mode === 'edit') {
        setConfigs(current =>
          current.map(config =>
            config.id === dialogState.targetId
              ? { ...config, ...value }
              : config,
          ),
        )
        setDialogState(null)
        return
      }

      setConfigs(current => [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          ...value,
        },
        ...current,
      ])
      setDialogState(null)
    },
    [dialogState],
  )

  const editingConfig =
    dialogState?.mode === 'edit'
      ? configs.find(config => config.id === dialogState.targetId)
      : undefined

  return (
    <SettingLayout title={'apikey配置'}>
      <ApiKeyConfigListWindow
        configs={configs}
        onAdd={handleOpenCreateDialog}
        onEdit={handleOpenEditDialog}
        onDelete={handleDelete}
      />

      <ApiKeyConfigFormDialog
        open={dialogState != null}
        mode={dialogState?.mode ?? 'create'}
        initialValue={editingConfig}
        onClose={handleCloseDialog}
        onSubmit={handleSubmitForm}
      />
    </SettingLayout>
  )
}
