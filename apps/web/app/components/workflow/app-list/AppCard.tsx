'use client'
import { dateFmt } from '@/utils/date'
import type { WorkflowApp } from '@shared/common/workflow/base'
import { useBoolean } from 'ahooks'
import Link from 'next/link'
import { type MouseEvent, memo, useCallback } from 'react'
import { Item, Menu, useContextMenu } from 'react-contexify'
import { twMerge } from 'tailwind-merge'
import { RiDeleteBin2Line } from '@remixicon/react'
import { useAppActions } from '../hooks/use-app-actions'

export type AppCardProps = {
  app: WorkflowApp;
}

const AppCard = ({ app }: AppCardProps) => {
  const menuId = `workflow-app-card-menu-${app.appId}`
  const { show } = useContextMenu({ id: menuId })
  const { deleteApp } = useAppActions(app)
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
        <Item onClick={deleteApp} className="contexify-item-danger">
          <div className="flex gap-2 items-center">
            <RiDeleteBin2Line className="h-5 w-5" />
            <div>删除应用</div>
          </div>
        </Item>
      </Menu>
    </>
  )
}

export default memo(AppCard)
