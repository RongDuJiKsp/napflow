import { memo } from 'react'
import BindingMarket from './BindingMarket'
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

        {/* 右侧：插件管理 */}
        <div className="md:w-1/2">
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
        </div>
      </div>
    </div>
  )
}

export default memo(BotBinding)
