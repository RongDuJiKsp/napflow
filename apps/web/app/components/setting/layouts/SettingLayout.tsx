import type { PropsWithChildren } from 'react'
import { memo } from 'react'

const SettingLayout = ({
  title,
  children,
}: PropsWithChildren<{ title: string }>) => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-purple-700 mb-6">{title}</h2>
        {children}
      </div>
    </div>
  )
}
export default memo(SettingLayout)
