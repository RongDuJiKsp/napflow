'use client'
import { dateFmt } from '@/utils/date'
import type { WorkflowApp } from '@shared/common/workflow/entity'
import { useBoolean } from 'ahooks'
import Link from 'next/link'
import { type MouseEvent, memo, useCallback } from 'react'
import { Item, Menu, useContextMenu } from 'react-contexify'
import { twMerge } from 'tailwind-merge'
import { RiDeleteBin2Line } from '@remixicon/react'
import { useAppActions } from '../hooks/use-app-actions'
import { useConform } from '@/app/hooks/utils/use-conform'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'

export type AppCardProps = {
  app: WorkflowApp;
}

const AppCard = ({ app }: AppCardProps) => {
  const menuId = `workflow-app-card-menu-${app.appId}`
  const { show } = useContextMenu({ id: menuId })
  const { deleteApp } = useAppActions(app)
  const { isModelOpen, onCancel, onConform } = useConform(deleteApp)
  const [showMore, setShowMoreAction] = useBoolean(false)

  const handleMouseEnter = useCallback(() => {
    setShowMoreAction.setTrue()
  }, [setShowMoreAction])
  const handleMouseLeave = useCallback(() => {
    setShowMoreAction.setFalse()
  }, [setShowMoreAction])

  const handleContextMenu = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      show({ event: e })
    },
    [show],
  )

  return (
    <>
      <Link href={`/workflows/${app.appId}`}>
        <div
          onContextMenu={handleContextMenu}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="group relative bg-linear-to-r from-purple-100 to-pink-100 rounded-xl border border-pink-200 p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-purple-300 cursor-pointer h-52 flex flex-col"
        >
          {/* 应用图标区域 */}
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-linear-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {app.appName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                {app.appName}
              </h3>
              <p className="text-sm text-gray-500">ID: {app.appId}</p>
            </div>
          </div>

          {/* 应用描述 */}
          <p
            className={twMerge(
              'text-gray-600 text-sm  flex-1 mb-2',
              showMore && 'line-clamp-4',
              !showMore && 'line-clamp-2',
            )}
          >
            {app.appDescription}
          </p>

          {/* 底部信息 */}
          {!showMore && (
            <div className="border-t border-gray-100 pt-3">
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>创建者: {app.createdBy}</span>
                <span>{dateFmt(app.createdAt)}</span>
              </div>
            </div>
          )}

          {/* 悬停效果 */}
          <div className="absolute inset-0 rounded-xl bg-linear-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
        </div>
      </Link>
      <Menu id={menuId}>
        <Item onClick={onConform} className="contexify-item-danger">
          <div className="flex gap-2 items-center">
            <RiDeleteBin2Line className="h-5 w-5" />
            <div>删除应用</div>
          </div>
        </Item>
      </Menu>
      <Dialog open={isModelOpen} onClose={onCancel} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="mx-auto w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="bg-linear-to-r from-red-500 to-pink-500 px-6 py-4">
              <DialogTitle className="text-lg font-semibold text-white">
                确认删除工作流
              </DialogTitle>
            </div>
            <div className="px-6 py-5 text-sm text-gray-700">
              删除后不可恢复，确认删除「{app.appName || app.appId}」吗？
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100"
              >
                取消
              </button>
              <button
                type="button"
                onClick={onConform}
                className="px-4 py-2 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600"
              >
                确认删除
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  )
}

export default memo(AppCard)
