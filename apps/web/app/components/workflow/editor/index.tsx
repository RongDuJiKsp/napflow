'use client'
import { memo } from 'react'
import { useAppMeta } from './providers/hooks/use-app-meta'

const Editor = () => {
  const { appId } = useAppMeta()
  return <div>{appId}</div>
}
export default memo(Editor)
