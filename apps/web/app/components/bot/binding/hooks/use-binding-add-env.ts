import { useBindingBotConfigQuery } from '@/app/hooks/query/bot/bot-bridge/use-binding-bot-config-query'
import { useBoolean } from 'ahooks'
import { useCallback, useState } from 'react'
import { useBotParam } from '../../hooks/use-bot-param'
import { useBindingConfig } from './use-binding-config'
import { type Var, VarZodChecks } from '@shared/common/workflow/core/component-node'
import { App } from 'antd'
import z from 'zod'

export const useBindingAddEnv = (
  bindingId: string,
  env: Var,
  value: string | undefined,
) => {
  const { notification } = App.useApp()

  const { botId } = useBotParam()
  const { refetch } = useBindingBotConfigQuery(botId, bindingId)

  const { submitConfig } = useBindingConfig(bindingId)
  const [isEditing, setIsEditing] = useBoolean(false)
  const [inputValue, setInputValue] = useState(value ?? '')
  const [saving, setSaving] = useState(false)

  const handleSave = useCallback(async () => {
    const validated = VarZodChecks[env.type].safeParse(inputValue.trim())
    if (!validated.success) {
      notification.error({
        title: '保存失败',
        description: z.prettifyError(validated.error),
      })
      return
    }
    setSaving(true)
    await submitConfig({ envKV: { [env.name]: validated.data } })
    await refetch()
    setSaving(false)
    setIsEditing.setFalse()
  }, [
    inputValue,
    env.name,
    submitConfig,
    refetch,
    setIsEditing,
    env.type,
    notification,
  ])

  const handleCancel = useCallback(() => {
    setInputValue(value ?? '')
    setIsEditing.setFalse()
  }, [value, setIsEditing])

  return {
    isEditing,
    setIsEditing,
    inputValue,
    setInputValue,
    handleSave,
    handleCancel,
    saving,
  }
}
