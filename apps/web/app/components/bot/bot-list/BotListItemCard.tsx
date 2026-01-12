'use client'
import type { CommonBotInfo } from '@shared/common/bot/base'
import { memo, useCallback } from 'react'
import { twMerge } from 'tailwind-merge'
import { useBotState } from './hooks/use-bot-state'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { RiMore2Fill } from '@remixicon/react'
import { useBotInfoOperator, useBotOperate } from './hooks/use-bot-operate'
import { useBoolean } from 'ahooks'
import { noop } from 'lodash-es'

const formatDate = (date?: Date) => {
  if (!date) return '未启动'
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format()
}

const buttonTheme = {
  common: {
    btn: 'text-gray-700 hover:bg-linear-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 cursor-pointer group',
    bg: 'bg-linear-to-r from-blue-400 to-indigo-400 group-hover:from-blue-500 group-hover:to-indigo-500',
  },
  warn: {
    btn: 'text-gray-700 hover:bg-linear-to-r hover:from-amber-50 hover:to-orange-50 hover:text-amber-700 cursor-pointer group',
    bg: 'bg-linear-to-r from-amber-400 to-orange-400 group-hover:from-amber-500 group-hover:to-orange-500',
  },
  danger: {
    btn: 'text-gray-700 hover:bg-linear-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-700 cursor-pointer group',
    bg: 'bg-linear-to-r from-red-400 to-pink-400 group-hover:from-red-500 group-hover:to-pink-500',
  },
}
const MenuItemButton = ({ disabled, title, onClick, theme}: { disabled?: boolean, title: string, onClick: () => void, theme: 'common' | 'warn' | 'danger' }) => {
  return (
    <button
      className={twMerge(
        'w-full text-left px-3 py-2 text-sm flex items-center space-x-3',
        !disabled
                  && buttonTheme[theme].btn,
        disabled && 'text-gray-300 cursor-not-allowed',
      )}
      onClick={disabled ? undefined : onClick}
    >
      <div
        className={twMerge(
          'w-4 h-4 rounded-full',
          !disabled
                    && buttonTheme[theme].bg,
          disabled && 'bg-gray-300',
        )}
      ></div>
      <span className="font-medium">{title}</span>
    </button>
  )
}

const BotListItemCard = ({ item }: { item: CommonBotInfo }) => {
  const { stateTwBgColor, stateText, isBotCanKill, isBotCanStart, isBotCanStop, isBotCanForcePull } = useBotState(item)
  const { startBot } = useBotOperate(item)
  const { editBot, deleteBot } = useBotInfoOperator(item)
  const [showMore, setShowMoreAction] = useBoolean(false)

  const handleMouseEnter = useCallback(() => {
    setShowMoreAction.setTrue()
  }, [setShowMoreAction])
  const handleMouseLeave = useCallback(() => {
    setShowMoreAction.setFalse()
  }, [setShowMoreAction])

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group bg-linear-to-br from-pink-50 to-purple-50 rounded-xl border border-pink-200 p-4 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-purple-300 cursor-pointer flex justify-between flex-col h-52"
    >
      {/* 头部信息 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className={twMerge(
            'w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold',
            stateTwBgColor,
          )}>
            <span className="text-sm">
              {item.botName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="ml-3">
            <h3 className="text-base font-semibold text-purple-700 line-clamp-1">
              {item.botName || '未命名Bot'}
            </h3>
            <p className="text-xs text-gray-500">ID: {item.botId.slice(0, 8)}...</p>
          </div>
        </div>

        {/* 状态标签 */}
        <div className={twMerge(
          'px-2 py-1 rounded-full text-xs font-medium text-white',
          stateTwBgColor,
        )}>
          {stateText}
        </div>
      </div>

      {/* 详细信息 */}
      <div className="flex flex-col justify-start h-[4lh]">
        <p
          className={twMerge(
            'text-purple-700 text-sm mb-2 min-h-[2lh]',
            showMore && 'line-clamp-4',
            !showMore && 'line-clamp-2',
          )}
        >
          {item.botDesc}
        </p>

        {!showMore && (<>
          <div className="flex justify-between text-sm">
            <span className="text-purple-600">适配器</span>
            <span className="text-purple-800 font-medium">{item.adapterDesc}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-purple-600">启动时间</span>
            <span className="text-purple-800 font-medium">{ formatDate(item.state.bootTime && new Date(item.state.bootTime))}</span>
          </div>
        </>)}
      </div>

      {/* 操作 */}
      <div className='flex justify-end'>
        <Menu>
          <MenuButton>
            <div className="p-2 rounded-full hover:bg-linear-to-r hover:from-purple-50 hover:to-pink-50 cursor-pointer group">
              <RiMore2Fill className="w-4 h-4 text-gray-500 group-hover:text-purple-600" />
            </div>
          </MenuButton>
          <MenuItems
            anchor="bottom"
            className="mt-2 w-40 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-100/50 z-50 overflow-hidden"
          >
            <MenuItem>
              <MenuItemButton title='启动Bot' theme='common' onClick={startBot} disabled={!isBotCanStart}/>
            </MenuItem>
            <MenuItem>
              <MenuItemButton title='停止Bot' theme='warn' onClick={noop} disabled={!isBotCanStop}/>
            </MenuItem>
            <div className="mx-3 my-1 h-px bg-linear-to-r from-transparent via-gray-200 to-transparent"></div>
            <MenuItem>
              <MenuItemButton title='杀死Bot' theme='danger' onClick={noop} disabled={!isBotCanKill}/>
            </MenuItem>
            <MenuItem>
              <MenuItemButton title='强拉Bot' theme='danger' onClick={noop} disabled={!isBotCanForcePull}/>
            </MenuItem>
            <div className="mx-3 my-1 h-px bg-linear-to-r from-transparent via-gray-200 to-transparent"></div>
            <MenuItem>
              <MenuItemButton title='编辑Bot' theme='warn' onClick={editBot} />
            </MenuItem>
            <MenuItem>
              <MenuItemButton title='删除Bot' theme='warn' onClick={deleteBot} />
            </MenuItem>
          </MenuItems>
        </Menu>
      </div>
    </div>
  )
}

export default memo(BotListItemCard)
