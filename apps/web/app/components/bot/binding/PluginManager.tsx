import { memo } from 'react'
import BindingMarket from './BindingMarket'

const PluginManager = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6 h-full">
      <h2 className="text-xl font-semibold text-purple-700 mb-6">插件管理</h2>
      <div className="space-y-6">
        <div className="p-4 rounded-lg bg-linear-to-r from-purple-50 to-pink-50 border border-purple-100">
          <h3 className="font-medium text-purple-700 mb-2">绑定新插件</h3>
          <p className="text-sm text-gray-600 mb-4">
            从插件市场选择工作流插件绑定到当前Bot
          </p>
          <div className="flex justify-center">
            <BindingMarket />
          </div>
        </div>

        <div className="p-4 rounded-lg border border-gray-200">
          <h3 className="font-medium text-gray-700 mb-2">管理说明</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-purple-400 rounded-full mt-1.5 mr-2 shrink-0" />
              每个插件绑定后，Bot即可使用该插件提供的功能
            </li>
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-purple-400 rounded-full mt-1.5 mr-2 shrink-0" />
              解绑操作将移除插件与Bot的关联
            </li>
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-purple-400 rounded-full mt-1.5 mr-2 shrink-0" />
              绑定ID用于唯一标识每个绑定关系
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default memo(PluginManager)
