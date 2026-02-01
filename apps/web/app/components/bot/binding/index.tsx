import { memo } from 'react'
import PluginManager from './PluginManager'
import BindingList from './BindingList'

const BotBinding = () => {
  return (
    <div className="p-6 bg-linear-to-br from-pink-50 to-purple-50 min-h-full">
      <div className="flex flex-col md:flex-row gap-6">
        {/* 左侧：已绑定插件列表 */}
        <div className="md:w-1/2">
          <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6 h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-purple-700">已绑定插件</h2>
              <div className="text-sm text-gray-500">
                管理当前Bot绑定的工作流插件
              </div>
            </div>
            <BindingList />
          </div>
        </div>

        <div className="md:w-1/2">
          <PluginManager />
        </div>
      </div>
    </div>
  )
}

export default memo(BotBinding)
