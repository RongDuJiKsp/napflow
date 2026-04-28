'use client'
import type { CommonBotInfo } from '@shared/common/bot/base'
import type { MouseEvent } from 'react'
import { memo, useCallback } from 'react'
import { twMerge } from 'tailwind-merge'
import { useBotState } from './hooks/use-bot-state'
import { Item, Menu, useContextMenu } from 'react-contexify'
import { useBotInfoOperator, useBotOperate } from './hooks/use-bot-operate'
import { dateFmt } from '@/utils/date'
import { useRouter } from 'next/navigation'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import {
  RiCloseCircleLine,
  RiDeleteBin2Line,
  RiEditLine,
  RiPlayCircleLine,
  RiRefreshLine,
  RiStopCircleLine,
} from '@remixicon/react'
import { useConform } from '@/app/hooks/utils/use-conform'

const formatDate = (date?: Date) => {
  if (!date) return '未启动'
  return dateFmt(date)
}

const BotListItemCard = ({ item }: { item: CommonBotInfo }) => {
  const router = useRouter()
  const menuId = `bot-list-item-menu-${item.botId}`
  const { show } = useContextMenu({ id: menuId })
  const {
    stateTwBgColor,
    stateText,
    isBotCanKill,
    isBotCanStart,
    isBotCanStop,
    isBotCanForcePull,
  } = useBotState(item)
  const { startBot, stopBot, killBot, reloadBot } = useBotOperate(item)
  const { editBot, deleteBot } = useBotInfoOperator(item)
  const { isModelOpen, onCancel, onConform } = useConform(deleteBot)

  const handleClick = useCallback(() => {
    router.push(`/bots/${item.botId}`)
  }, [item.botId, router])

  const handleContextMenu = useCallback(
    (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      show({ event: e })
    },
    [show],
  )

  return (
    <>
      <div
        onContextMenu={handleContextMenu}
        onClick={handleClick}
        className="cursor-pointer group relative bg-linear-to-r from-purple-100 to-pink-100 rounded-xl border border-pink-200 p-4 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-purple-300  flex justify-between flex-col h-52"
      >
        {/* 头部信息 */}
        <div className="flex items-center justify-between mb-3 cursor-pointer">
          <div className="flex items-center">
            <div
              className={twMerge(
                'w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold',
                stateTwBgColor,
              )}
            >
              <span className="text-sm">
                {item.botName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="ml-3">
              <h3 className="text-base font-semibold text-purple-700 line-clamp-1">
                {item.botName || '未命名Bot'}
              </h3>
              <p className="text-xs text-gray-500">
                ID: {item.botId.slice(0, 8)}...
              </p>
            </div>
          </div>

          {/* 状态标签 */}
          <div
            className={twMerge(
              'px-2 py-1 rounded-full text-xs font-medium text-white',
              stateTwBgColor,
            )}
          >
            {stateText}
          </div>
        </div>

        {/* 详细信息 */}
        <div className="flex flex-col justify-start h-[6lh]">
          <p
            className={twMerge(
              'text-purple-700 text-sm mb-2 h-[4lh]',
              'line-clamp-4 text-ellipsis overflow-hidden',
            )}
          >
            {item.botDesc}
          </p>

          <div className="flex justify-between text-sm">
            <span className="text-purple-600">适配器</span>
            <span className="text-purple-800 font-medium">
              {item.adapterDesc}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-purple-600">启动时间</span>
            <span className="text-purple-800 font-medium">
              {formatDate(item.state.bootTime)}
            </span>
          </div>
        </div>

        {/* 悬停效果 */}
        <div className="absolute inset-0 rounded-xl bg-linear-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
      </div>
      <Menu id={menuId}>
        <Item onClick={startBot} disabled={!isBotCanStart}>
          <div className="flex gap-2 items-center">
            <RiPlayCircleLine className="h-5 w-5" />
            <div>启动Bot</div>
          </div>
        </Item>
        <Item onClick={stopBot} disabled={!isBotCanStop}>
          <div className="flex gap-2 items-center">
            <RiStopCircleLine className="h-5 w-5" />
            <div>停止Bot</div>
          </div>
        </Item>
        <Item
          onClick={killBot}
          disabled={!isBotCanKill}
          className="contexify-item-danger"
        >
          <div className="flex gap-2 items-center">
            <RiCloseCircleLine className="h-5 w-5" />
            <div>杀死Bot</div>
          </div>
        </Item>
        <Item
          onClick={reloadBot}
          disabled={!isBotCanForcePull}
          className="contexify-item-danger"
        >
          <div className="flex gap-2 items-center">
            <RiRefreshLine className="h-5 w-5" />
            <div>重拉Bot</div>
          </div>
        </Item>
        <Item onClick={editBot}>
          <div className="flex gap-2 items-center">
            <RiEditLine className="h-5 w-5" />
            <div>编辑Bot</div>
          </div>
        </Item>
        <Item onClick={onConform} className="contexify-item-danger">
          <div className="flex gap-2 items-center">
            <RiDeleteBin2Line className="h-5 w-5" />
            <div>删除Bot</div>
          </div>
        </Item>
      </Menu>
      <Dialog open={isModelOpen} onClose={onCancel} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="mx-auto w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="bg-linear-to-r from-red-500 to-pink-500 px-6 py-4">
              <DialogTitle className="text-lg font-semibold text-white">
                确认删除 Bot
              </DialogTitle>
            </div>
            <div className="px-6 py-5 text-sm text-gray-700">
              删除后不可恢复，确认删除「{item.botName || item.botId}」吗？
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

export default memo(BotListItemCard)
