'use client'
import { useBotsQuery } from '@/app/hooks/query/use-bots-query'
import { memo } from 'react'
import BotListItemCard from './BotListItemCard'

const BotList = () => {
  const { data: bots } = useBotsQuery()
  return (<div>
    {bots?.map(bot => (<BotListItemCard key={bot.botId} item={bot}/>))}
  </div>)
}
export default memo(BotList)
