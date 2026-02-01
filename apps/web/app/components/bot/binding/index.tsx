import { memo } from 'react'
import PluginManager from './PluginManager'
import BindingList from './BindingList'

const BotBinding = () => {
  return (
    <div className="p-6 bg-linear-to-br from-pink-50 to-purple-50 min-h-full">
      <div className="flex flex-col md:flex-row gap-6">
        {/* 左侧：已绑定插件列表 */}
        <div className="md:w-1/2">
          <BindingList />
        </div>

        {/* 右侧：插件管理 */}
        <div className="md:w-1/2">
          <PluginManager />
        </div>
      </div>
    </div>
  )
}

export default memo(BotBinding)
