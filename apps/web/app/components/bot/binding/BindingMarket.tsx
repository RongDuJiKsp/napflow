'use client'
import { useAppVersionsQuery } from '@/app/hooks/query/use-app-versions-query'
import { useAppsQuery } from '@/app/hooks/query/use-apps-query'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { Button } from '@heroui/react'
import {
  RiAddLine,
  RiCheckLine,
  RiCloseLine,
  RiPuzzleLine,
} from '@remixicon/react'
import type { WorkflowApp } from '@shared/common/workflow/base'
import { useBoolean } from 'ahooks'
import { memo, useCallback, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import {
  type SelectPair,
  type SelectedItem,
  useBindingMarket,
} from './hooks/use-binding-market'

// 左侧应用列表组件
const AppList = ({
  apps,
  selectedAppId,
  onAppSelect,
}: {
  apps: WorkflowApp[];
  selectedAppId: string | null;
  onAppSelect: (appId: string) => void;
}) => {
  return (
    <div className="w-1/3 border-r border-gray-200 pr-6">
      <h3 className="text-sm font-semibold text-gray-800 mb-4">可用插件</h3>
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {apps.map(app => (
          <div
            key={app.appId}
            className={twMerge(
              'p-3 rounded-lg border cursor-pointer transition-all duration-200',
              selectedAppId === app.appId
                ? 'border-blue-300 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50/30',
            )}
            onClick={() => onAppSelect(app.appId)}
          >
            <div className="font-medium text-gray-800">{app.appName}</div>
            {app.appDescription && (
              <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                {app.appDescription}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// 中间应用版本列表组件
const AppVersionList = ({
  appId,
  onSelect,
}: {
  appId: string;
  onSelect: (pair: SelectPair) => void;
}) => {
  const { data: versions } = useAppVersionsQuery(appId)

  return (
    <div className="space-y-2">
      {versions
        ?.filter(v => v.version !== 'draft')
        .map(version => (
          <div
            key={version.version}
            className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors duration-200 cursor-pointer"
            onClick={() => onSelect({ appId, version: version.version })}
          >
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-700">
                {version.version}
              </div>
              {version.publishDescription && (
                <div className="text-xs text-gray-500 mt-1">
                  {version.publishDescription}
                </div>
              )}
            </div>
            <RiAddLine className="w-4 h-4 text-blue-500" />
          </div>
        ))}
    </div>
  )
}

const SelectedList = ({
  selectedItems,
  onRemoveItem,
  onConfirm,
}: {
  selectedItems: SelectedItem[];
  onRemoveItem: (selectPair: SelectPair) => void;
  onConfirm: () => void;
}) => {
  return (
    <div className="w-1/3">
      <h3 className="text-sm font-semibold text-gray-800 mb-4">
        已选插件版本
      </h3>
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {selectedItems.length === 0 ? (
          <div className="text-center text-gray-500 py-8">暂无选择</div>
        ) : (
          selectedItems.map(item => (
            <div
              key={`${item.appId}-${item.version}`}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50"
            >
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-800">
                  {item.appName}/{item.version}
                </div>
              </div>
              <button
                onClick={() =>
                  onRemoveItem({ appId: item.appId, version: item.version })
                }
                className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-1"
              >
                <RiCloseLine className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* 确认按钮 */}
      {selectedItems.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <Button
            className={twMerge(
              'w-full bg-linear-to-r from-blue-500 to-indigo-500',
              'text-white shadow-md hover:shadow-lg',
              'hover:from-blue-600 hover:to-indigo-600',
              'transition-all duration-200',
            )}
            onPress={onConfirm}
          >
            <RiCheckLine className="w-5 h-5" />
            确认绑定 ({selectedItems.length})
          </Button>
        </div>
      )}
    </div>
  )
}

const BingingDialogInner = ({ onClose }: { onClose?: () => void }) => {
  const {
    apps,
    selectItemsWithName,
    handleAddItem,
    handleRemoveItem,
    handleConfirm,
  } = useBindingMarket(onClose)
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null)

  const selectedApp = apps?.find(app => app.appId === selectedAppId)
  const handleAppSelect = useCallback((appId: string) => {
    setSelectedAppId(appId)
  }, [])

  if (!apps) return null

  return (
    <DialogPanel className="mx-auto rounded-2xl bg-white shadow-2xl overflow-hidden w-full max-w-6xl max-h-[80vh]">
      {/* Header */}
      <div className="px-6 pb-2 pt-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <RiPuzzleLine className="w-6 h-6 text-gray-600" />
            <DialogTitle className="text-lg font-semibold text-gray-800">
              绑定插件到Bot
            </DialogTitle>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
          >
            <RiCloseLine className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex h-[500px] p-6 gap-6">
        {/* 左侧：应用列表组件 */}
        <AppList
          apps={apps}
          selectedAppId={selectedAppId}
          onAppSelect={handleAppSelect}
        />

        {/* 中间：版本列表 */}
        <div className="w-1/3 border-r border-gray-200 pr-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">
            {selectedApp ? `${selectedApp.appName} 版本` : '选择插件查看版本'}
          </h3>
          <div className="max-h-[400px] overflow-y-auto">
            {selectedAppId ? (
              <AppVersionList appId={selectedAppId} onSelect={handleAddItem} />
            ) : (
              <div className="text-center text-gray-500 py-8">
                请先选择一个插件
              </div>
            )}
          </div>
        </div>

        {/* 右侧：已选列表组件 */}
        <SelectedList
          selectedItems={selectItemsWithName}
          onRemoveItem={handleRemoveItem}
          onConfirm={handleConfirm}
        />
      </div>
    </DialogPanel>
  )
}

const BindingMarket = () => {
  const { data: apps } = useAppsQuery()
  const [shouldDialogOpen, dispatchDialog] = useBoolean(false)
  // 添加loading状态
  if (apps === undefined) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-3 text-blue-600">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">加载插件列表中...</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Button
        className={twMerge(
          'flex gap-2 bg-linear-to-r from-blue-500 to-indigo-500',
          'text-white shadow-lg hover:shadow-xl',
          'hover:from-blue-600 hover:to-indigo-600',
          'transition-all duration-200',
        )}
        onPress={dispatchDialog.setTrue}
      >
        <RiPuzzleLine className="w-6 h-6" />
        <div>绑定插件到Bot</div>
      </Button>

      <Dialog
        open={shouldDialogOpen}
        onClose={dispatchDialog.setFalse}
        className="relative z-50"
      >
        {/* Background */}
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <BingingDialogInner onClose={dispatchDialog.setFalse} />
        </div>
      </Dialog>
    </div>
  )
}

export default memo(BindingMarket)
