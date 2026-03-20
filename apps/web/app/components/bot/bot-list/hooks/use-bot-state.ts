import type { CommonBotInfo } from '@shared/common/bot/base'
import { BotRunningState } from '@shared/common/bot/core/status'

const getStatusText = (state: BotRunningState) => {
  switch (state) {
    case BotRunningState.running:
      return '运行中'
    case BotRunningState.stopped:
      return '已停止'
    case BotRunningState.offline:
      return '离线'
    case BotRunningState.fatal:
      return '错误'
    case BotRunningState.killed:
      return '已终止'
    default:
      return '未知'
  }
}

const getStatusColor = (state: BotRunningState) => {
  switch (state) {
    case BotRunningState.running:
      return 'bg-linear-to-r from-blue-500 to-indigo-500'
    case BotRunningState.stopped:
      return 'bg-gray-400'
    case BotRunningState.offline:
      return 'bg-linear-to-r from-amber-500 to-orange-500'
    case BotRunningState.fatal:
      return 'bg-linear-to-r from-red-500 to-pink-500'
    case BotRunningState.killed:
      return 'bg-gray-600'
    default:
      return 'bg-gray-400'
  }
}

export const useBotState = (bot?: CommonBotInfo) => {
  const state = bot?.state.runningState ?? BotRunningState.stopped
  const isBotCanStart = [
    BotRunningState.stopped,
    BotRunningState.killed,
  ].includes(state)
  const isBotCanStop = [BotRunningState.running].includes(state)
  const isBotCanKill = ![
    BotRunningState.killed,
    BotRunningState.stopped,
  ].includes(state)
  const isBotCanForcePull = [
    BotRunningState.stopped,
    BotRunningState.killed,
  ].includes(state)
  const stateText = getStatusText(state)
  const stateTwBgColor = getStatusColor(state)
  return {
    state,
    isBotCanStop,
    isBotCanStart,
    isBotCanKill,
    stateText,
    isBotCanForcePull,
    stateTwBgColor,
  }
}
