import { useCallback } from 'react'
import type { ItemParams } from 'react-contexify'
import type { ComponentNodeProps } from '../../../types'
type HandlerProps = ItemParams<ComponentNodeProps>

export const useComponentNodeContextMenu = () => {
  const handleDeleteItem = useCallback(({ props }: HandlerProps) => {
    console.log('del', props?.id)
  }, [])
  return {
    handleDeleteItem,
  }
}
