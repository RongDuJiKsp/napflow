'use client'
import { memo } from 'react'

const Editor = ({ appId}: { appId: string }) => {
  return <div>{appId}</div>
}
export default memo(Editor)
