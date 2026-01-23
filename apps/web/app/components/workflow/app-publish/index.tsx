import type { PropsWithChildren } from 'react'
import { memo } from 'react'
import PublishDraft from './PublishDraft'

const AppPublishLayout = ({ children }: PropsWithChildren) => {
  return (<div className="relative">
    <PublishDraft />
    {children}
  </div>)
}
export default memo(AppPublishLayout)
