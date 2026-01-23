'use client'
import { useBotsQuery } from '@/app/hooks/query/use-bots-query'
import { memo } from 'react'
import BotListItemCard from './BotListItemCard'
import CreateBotCard from './CreateBotCard'

const BotList = () => {
  const { data: bots } = useBotsQuery()
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
      <CreateBotCard />
      {bots?.map(bot => (
        <BotListItemCard key={bot.botId} item={bot} />
      ))}
    </div>
  )
}
export default memo(BotList)
