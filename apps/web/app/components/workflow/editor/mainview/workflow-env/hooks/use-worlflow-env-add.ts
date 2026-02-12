import { VarTypes } from '@shared/common/workflow/component-node'
import { useCallback, useState } from 'react'
import { useWorkflowEnvDialog } from './use-workflow-env-dialog'
import { App } from 'antd'
import { useWorkflowDraft } from '../../../hooks/use-workflow-draft'

export const useWorkflowEnvAdd = (onFinish?: () => void) => {
  const { submitSyncDraft } = useWorkflowDraft()
  const { message } = App.useApp()
  const {
    addEnv,
    envs,
  } = useWorkflowEnvDialog()

  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState<VarTypes>(VarTypes.String)

  const handleAdd = useCallback(() => {
    if (!newName.trim()) return
    if (envs.find(env => env.name === newName.trim())) {
      message.error('环境变量已存在')
      return
    }
    addEnv({ name: newName.trim(), type: newType })
    setNewName('')
    setNewType(VarTypes.String)
    onFinish?.()
    submitSyncDraft()
  }, [newName, newType, addEnv, envs, message, submitSyncDraft, onFinish])

  const handleCancel = useCallback(() => {
    setNewName('')
    setNewType(VarTypes.String)
    onFinish?.()
  }, [onFinish])

  return{
    handleAdd,
    handleCancel,
    form: {
      newName,
      newType,
    },
    setNewName,
    setNewType,
  }
}
