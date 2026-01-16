import { useCallback } from 'react'
import type { ItemParams } from 'react-contexify'
import type { WorkflowComponentProps } from '../../../types'
type HandlerProps = ItemParams<WorkflowComponentProps>

export const useComponentNodeContextMenu = () => {
  const handleDeleteItem = useCallback(({ props }: HandlerProps) => {
    console.log('del', props?.id)
  }, [])
  return {
    handleDeleteItem,
  }
}
