'use client'
import { memo } from 'react'
import { Button } from '@heroui/react'
import { RiCloseLine } from '@remixicon/react'
import { twMerge } from 'tailwind-merge'
import { useBindingBotQuery } from '@/app/hooks/query/use-binding-bot-query'
import { useBotParam } from '../hooks/use-bot-param'
import { useBindingItem } from './hooks/use-binding-item'
import BindingConfigButton from './BindingConfigButton'

type BindingItem = NonNullable<
  ReturnType<typeof useBindingBotQuery>['data']
>[number]

const BindingListHeader = ({ count }: { count?: number }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-semibold text-gray-800">已绑定插件</h2>
        {count !== undefined && count > 0 && (
          <span className="inline-flex items-center justify-center h-6 px-2 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
            {count}
          </span>
        )}
      </div>
      <div className="text-sm text-gray-500">管理当前Bot绑定的工作流插件</div>
    </div>
  )
}

const LoadingState = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex items-center space-x-3 text-blue-600">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium">加载绑定列表中...</span>
      </div>
    </div>
  )
}

const EmptyState = () => {
  return (
    <div className="text-center text-gray-500 py-12 bg-linear-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100">
      <RiCloseLine className="w-12 h-12 mx-auto text-gray-300 mb-3" />
      <p className="font-medium">暂无绑定的插件</p>
      <p className="text-sm mt-1 text-gray-600">
        点击右侧&quot;绑定新插件&quot;按钮开始
      </p>
    </div>
  )
}

const BindingListItem = ({ item }: { item: BindingItem }) => {
  const { botId } = useBotParam()
  const { handleUnbind } = useBindingItem(botId, item.bindingId)
  return (
    <div className="binding-item p-4 rounded-lg border border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-semibold text-gray-800">
                {item.app.appName}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                ID: {item.appId}
              </div>
            </div>
            <div className="flex gap-3">
              <BindingConfigButton
                bindingId={item.bindingId}
                ofAppId={item.appId}
                ofAppVersion={item.version}
              />
              <Button
                size="sm"
                className={twMerge(
                  'bg-linear-to-r from-red-500 to-pink-500',
                  'text-white shadow-md hover:shadow-lg',
                  'hover:from-red-600 hover:to-pink-600',
                  'transition-all duration-200',
                  'px-3 py-1.5',
                )}
                onClick={handleUnbind}
              >
                <RiCloseLine className="w-4 h-4" />
                <span className="ml-1">解绑</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500">版本</div>
              <div className="font-medium text-blue-600">{item.version}</div>
            </div>
            <div>
              <div className="text-gray-500">绑定ID</div>
              <div
                className="font-mono text-xs text-gray-700 truncate"
                title={item.bindingId}
              >
                {item.bindingId}
              </div>
            </div>
          </div>

          {item.appPublish.publishDescription && (
            <div>
              <div className="text-gray-500 text-sm mb-1">发布说明</div>
              <div className="text-gray-700 text-sm bg-gray-50 p-2 rounded border border-gray-100">
                {item.appPublish.publishDescription}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500">发布时间</div>
              <div className="text-gray-700">
                {item.appPublish.publishAt
                  ? new Date(item.appPublish.publishAt).toLocaleDateString(
                    'zh-CN',
                    {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    },
                  )
                  : '-'}
              </div>
            </div>
            <div>
              <div className="text-gray-500">发布者</div>
              <div className="text-gray-700">
                {item.appPublish.publishBy || '-'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const BindingListContent = ({ items }: { items: BindingItem[] }) => {
  if (items.length === 0) return <EmptyState />

  return (
    <div className="space-y-3 overflow-y-auto h-72">
      {items.map(item => (
        <BindingListItem key={item.bindingId} item={item} />
      ))}
    </div>
  )
}

const BindingListContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-96">
      {children}
    </div>
  )
}

const BindingList = () => {
  const { botId } = useBotParam()
  const { data, isLoading } = useBindingBotQuery(botId)

  if (isLoading) {
    return (
      <BindingListContainer>
        <BindingListHeader />
        <LoadingState />
      </BindingListContainer>
    )
  }

  return (
    <BindingListContainer>
      <BindingListHeader count={data?.length} />
      <BindingListContent items={data || []} />
    </BindingListContainer>
  )
}

export default memo(BindingList)
