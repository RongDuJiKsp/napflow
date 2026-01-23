import type { PropsWithChildren } from 'react'
import { memo } from 'react'
import { useStore } from 'zustand'
import { useEditorStore } from '../../../hooks/use-editor-store'
import { useNodes } from '@xyflow/react'
import { NodeClassic } from '@shared/common/workflow/core'
import type { ComponentNode, ComponentPanelFc } from '../../types'
import type { WorkflowNode } from '../../../types'
import { Drawer } from 'antd'
import { ComponentNodeCreatorMap } from '../../constants'
import { twMerge } from 'tailwind-merge'
import { useEditSiderbarMetaEdit } from './hooks/use-edit-siderbar-meta-edit'
import ComponentNodeEnvProvider from '../../providers/ComponentNodeEnvProvider'

const PanelWrapper = ({ children }: PropsWithChildren) => {
  return (
    <>
      <ComponentNodeEnvProvider>{children}</ComponentNodeEnvProvider>
    </>
  )
}

const NodeEditSidebarView: ComponentPanelFc<unknown> = ({ id, data }) => {
  const { handleChangeTitle, handleChangeDescription }
    = useEditSiderbarMetaEdit(id)
  const creator = ComponentNodeCreatorMap[data.type]
  return (
    <PanelWrapper>
      <div className="space-y-0 p-2">
        {/* 标题区域 */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-linear-to-r from-purple-50 to-pink-50 border border-pink-100">
          <div className="shrink-0 p-2 rounded-lg bg-linear-to-r from-purple-500 to-pink-500 text-white shadow-md">
            <creator.icon className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={data.title}
              onChange={e => handleChangeTitle(e.target.value)}
              placeholder={creator.label}
              className={twMerge(
                'w-full text-base font-semibold text-gray-800 bg-transparent border-none',
                'focus:outline-none focus:ring-0 placeholder:text-gray-200',
                'transition-all duration-200',
              )}
            />
          </div>
        </div>

        {/* 描述区域 - 融入分割线 */}
        <div className="border-b border-pink-200 py-2">
          <input
            type="text"
            value={data.desc}
            onChange={e => handleChangeDescription(e.target.value)}
            placeholder="输入节点描述，用于说明该节点的作用和功能"
            className={twMerge(
              'w-full text-sm text-gray-600 bg-transparent border-none',
              'focus:outline-none focus:ring-0 placeholder:text-pink-200',
              'transition-all duration-200',
            )}
          />
        </div>

        {/* 编辑面板内容 */}
        <div className="mt-4">
          <creator.editPanelComponent id={id} data={data} />
        </div>
      </div>
    </PanelWrapper>
  )
}

const NodeEditSidebar = () => {
  // 如果不是组件节点，就不渲染NodeEditSidebarView组件了
  const editorStore = useEditorStore()
  const nodeId = useStore(editorStore, s => s.selectedNodeId)
  const nodes = useNodes<WorkflowNode>()
  const currNode = nodes.find(n => n.id === nodeId)
  const open = currNode?.type === NodeClassic.Component && !currNode.dragging
  return (
    <Drawer open={open} mask={false} closable={false}>
      {open && (
        <NodeEditSidebarView
          id={currNode.id}
          data={currNode.data as ComponentNode['data']}
        />
      )}
    </Drawer>
  )
}

export default memo(NodeEditSidebar)
