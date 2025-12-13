'use client'
import { useAppsQuery } from '@/app/hooks/query/use-apps-query'
import Link from 'next/link'
import { memo } from 'react'

const AppList = () => {
  const { data } = useAppsQuery()
  return (
    <div>
      {data?.map(app => (
        <Link key={app.appId} href={`/workflows/${app.appId}`}>
          {app.appName}:{app.appDescription}
        </Link>
      ))}
    </div>
  )
}
export default memo(AppList)
