import { useCallback } from 'react'
import { useComponentNodeEnv } from '../../../hooks/use-component-node-env'
import { useStoreImmerCurd } from '../../../../hooks/use-reactflow-ext'
import type { ComponentNode } from '../../../types'
import type { ReplyData } from '../creator'

export const useReplyCurd = (id: string) => {
  const { vars } = useComponentNodeEnv(id)
  const { editNode } = useStoreImmerCurd()
  const handleContentChange = useCallback((content: string) => {
    editNode<ComponentNode<ReplyData>>(id, (draft) => {
      draft.data.content = content
    })
  }, [id, editNode])
  return {
    vars,
    handleContentChange,
  }
}
