import { VarTypes } from '@shared/common/workflow/component-node'
import { useCallback, useState } from 'react'
import { useWorkflowEnvDialog } from './use-workflow-env-dialog'
import { App } from 'antd'
import { useWorkflowDraft } from '../../hooks/use-workflow-draft'

export const useWorkflowEnvAdd = () => {
  const { submitSyncDraft } = useWorkflowDraft()
  const { message } = App.useApp()
  const {
    addEnv,
    envs,
  } = useWorkflowEnvDialog()

  const [isAdding, setIsAdding] = useState(false)
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
    setIsAdding(false)
    submitSyncDraft()
  }, [newName, newType, addEnv, envs, message, submitSyncDraft])

  const handleCancel = useCallback(() => {
    setNewName('')
    setNewType(VarTypes.String)
    setIsAdding(false)
  }, [])

  return{
    isAdding,
    setIsAdding,
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
