'use client'
import { useAppsQuery } from '@/app/hooks/query/workflow/use-apps-query'
import { memo } from 'react'
import AppCard from './AppCard'
import CreateAppCard from './CreateAppCard'

const AppList = () => {
  const { data } = useAppsQuery()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
      <CreateAppCard />
      {data?.map(app => (
        <AppCard key={app.appId} app={app} />
      ))}
    </div>
  )
}

export default memo(AppList)
