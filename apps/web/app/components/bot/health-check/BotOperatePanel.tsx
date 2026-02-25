'use client'

import { memo } from 'react'
import { twMerge } from 'tailwind-merge'
import { useDashboardBotOperate } from './hooks/use-dashboard-bot-operate'

const OperateButton = ({
  title,
  onClick,
  disabled,
  theme,
}: {
  title: string;
  onClick: () => void;
  disabled?: boolean;
  theme: 'start' | 'stop' | 'kill' | 'reload';
}) => {
  const themeStyles = {
    start: {
      btn: 'from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600',
      shadow: 'shadow-blue-200',
    },
    stop: {
      btn: 'from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600',
      shadow: 'shadow-amber-200',
    },
    kill: {
      btn: 'from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600',
      shadow: 'shadow-red-200',
    },
    reload: {
      btn: 'from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
      shadow: 'shadow-purple-200',
    },
  }

  return (
    <button
      className={twMerge(
        'px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-all duration-200 shadow-md',
        'bg-linear-to-r',
        !disabled && themeStyles[theme].btn,
        !disabled && themeStyles[theme].shadow,
        !disabled && 'cursor-pointer hover:shadow-lg active:scale-95',
        disabled && 'from-gray-300 to-gray-400 cursor-not-allowed opacity-60',
      )}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {title}
    </button>
  )
}

const BotOperatePanel = () => {
  const { currentBot, botState, startBot, stopBot, killBot, reloadBot }
    = useDashboardBotOperate()

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-800">Bot操作</h3>
        {currentBot && (
          <div
            className={twMerge(
              'px-2.5 py-1 rounded-full text-xs font-medium text-white',
              botState.stateTwBgColor,
            )}
          >
            {botState.stateText}
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-3">
        <OperateButton
          title="启动Bot"
          theme="start"
          onClick={startBot}
          disabled={!botState.isBotCanStart}
        />
        <OperateButton
          title="停止Bot"
          theme="stop"
          onClick={stopBot}
          disabled={!botState.isBotCanStop}
        />
        <OperateButton
          title="杀死Bot"
          theme="kill"
          onClick={killBot}
          disabled={!botState.isBotCanKill}
        />
        <OperateButton
          title="重拉Bot"
          theme="reload"
          onClick={reloadBot}
          disabled={!botState.isBotCanForcePull}
        />
      </div>
    </div>
  )
}

export default memo(BotOperatePanel)
