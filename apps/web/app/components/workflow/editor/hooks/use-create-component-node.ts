import { useStore } from 'zustand'
import { useEditorStore } from './use-editor-store'
import { useCallback } from 'react'
import type { ComponentNodesEnum } from '../component-nodes/types'
import { createComponentNode } from '../component-nodes/utils/node'

export const useStickyNewComponentNode = () => {
  const editorStore = useEditorStore()
  const stickyNode = useStore(editorStore, state => state.stickyNewNode)
  const createAndSticky = useCallback((nodeType: ComponentNodesEnum) => {
    const node = createComponentNode(nodeType)
    stickyNode(node)
  }, [stickyNode])
  return { createAndSticky }
}
