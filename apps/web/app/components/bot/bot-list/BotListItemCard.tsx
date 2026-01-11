'use client'
import type { CommonBotInfo } from '@shared/common/bot/base'
import { memo } from 'react'
import { twMerge } from 'tailwind-merge'
import { useBotState } from './hooks/use-bot-state'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { RiMore2Fill } from '@remixicon/react'
import { useBotOperate } from './hooks/use-bot-operate'

const formatDate = (date?: Date) => {
  if (!date) return '未启动'
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const BotListItemCard = ({ item }: { item: CommonBotInfo }) => {
  const { stateTwBgColor, stateText, isBotCanKill, isBotCanStart, isBotCanStop } = useBotState(item)
  const { startBot } = useBotOperate(item)

  return (
    <div
      className="group bg-linear-to-br from-pink-50 to-purple-50 rounded-xl border border-pink-200 p-4 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-purple-300 cursor-pointer flex justify-between flex-col"
    >
      {/* 头部信息 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className={twMerge(
            'w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold',
            stateTwBgColor,
          )}>
            <span className="text-sm">
              {item.adapterDesc.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="ml-3">
            <h3 className="text-base font-semibold text-purple-700 line-clamp-1">
              {item.botDesc || '未命名Bot'}
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
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">适配器</span>
          <span className="text-gray-900 font-medium">{item.adapterDesc}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">启动时间</span>
          <span className="text-gray-900 font-medium">{formatDate(item.state.bootTime)}</span>
        </div>

        {item.state.lastExitCode !== undefined && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">退出码</span>
            <span className="text-gray-900 font-medium">{item.state.lastExitCode}</span>
          </div>
        )}
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
            <div className="py-2">
              <MenuItem>
                <button
                  className={twMerge(
                    'w-full text-left px-4 py-3 text-sm flex items-center space-x-3',
                    isBotCanStart
                  && 'text-gray-700 hover:bg-linear-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 cursor-pointer group',
                    !isBotCanStart && 'text-gray-300 cursor-not-allowed',
                  )}
                  onClick={startBot}
                >
                  <div
                    className={twMerge(
                      'w-5 h-5 rounded-full',
                      isBotCanStart
                    && 'bg-linear-to-r from-blue-400 to-indigo-400 group-hover:from-blue-500 group-hover:to-indigo-500',
                      !isBotCanStart && 'bg-gray-300',
                    )}
                  ></div>
                  <span className="font-medium">启动Bot</span>
                </button>
              </MenuItem>
              <MenuItem>
                <button
                  className={twMerge(
                    'w-full text-left px-4 py-3 text-sm flex items-center space-x-3',
                    isBotCanStop
                  && 'text-gray-700 hover:bg-linear-to-r hover:from-amber-50 hover:to-orange-50 hover:text-amber-700 cursor-pointer group',
                    !isBotCanStop && 'text-gray-300 cursor-not-allowed',
                  )}
                >
                  <div
                    className={twMerge(
                      'w-5 h-5 rounded-full',
                      isBotCanStop
                    && 'bg-linear-to-r from-amber-400 to-orange-400 group-hover:from-amber-500 group-hover:to-orange-500',
                      !isBotCanStop && 'bg-gray-300',
                    )}
                  ></div>
                  <span className="font-medium">停止Bot</span>
                </button>
              </MenuItem>
              <div className="mx-3 my-1 h-px bg-linear-to-r from-transparent via-gray-200 to-transparent"></div>
              <MenuItem>
                <button
                  className={twMerge(
                    'w-full text-left px-4 py-3 text-sm flex items-center space-x-3',
                    isBotCanKill
                  && ' text-red-600 hover:bg-linear-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-700 cursor-pointer group',
                    !isBotCanKill && 'text-gray-300 cursor-not-allowed',
                  )}
                >
                  <div
                    className={twMerge(
                      'w-5 h-5 rounded-full',
                      isBotCanKill
                    && 'bg-linear-to-r from-red-400 to-pink-400 group-hover:from-red-500 group-hover:to-pink-500',
                      !isBotCanKill && 'bg-gray-300',
                    )}
                  ></div>
                  <span className="font-medium">Kill Bot</span>
                </button>
              </MenuItem>
            </div>
          </MenuItems>
        </Menu>
      </div>
    </div>
  )
}

export default memo(BotListItemCard)
