import { useBindingBotConfigQuery } from '@/app/hooks/query/use-binding-bot-config-query'
import { useBoolean } from 'ahooks'
import { useCallback, useState } from 'react'
import { useBotParam } from '../../hooks/use-bot-param'
import { useBindingConfig } from './use-binding-config'
import type { Var } from '@shared/common/workflow/component-node'

export const useBindingAddEnv = (bindingId: string, env: Var, value: string | undefined) => {
  const { botId } = useBotParam()
  const { refetch } = useBindingBotConfigQuery(botId, bindingId)

  const { submitConfig } = useBindingConfig(bindingId)
  const [isEditing, setIsEditing] = useBoolean(false)
  const [inputValue, setInputValue] = useState(value ?? '')
  const [saving, setSaving] = useState(false)

  const handleSave = useCallback(async () => {
    if (!inputValue.trim()) return
    setSaving(true)
    await submitConfig({ envKV: { [env.name]: inputValue.trim() } })
    await refetch()
    setSaving(false)
    setIsEditing.setFalse()
  }, [inputValue, env.name, submitConfig, refetch, setIsEditing])

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
