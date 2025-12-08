'use client'
import { RiAddLine, RiForbidLine } from '@remixicon/react'
import SettingItemContainer from '../../_base/container/SettingItemContainer'
import { memo } from 'react'
import { useAccountAddOperators } from '../hooks/use-account-operators'

const CreateAccountWindow = () => {
  const { enableFeature } = useAccountAddOperators()

  return (<>
    {/* 遮罩层 */}
    {!enableFeature && (
      <div className="relative bg-linear-to-br from-pink-50 to-purple-50 rounded-2xl shadow-lg p-6 border border-pink-100">
        <div className="absolute inset-0 bg-white bg-opacity-80 backdrop-blur-sm rounded-2xl z-10 flex items-center justify-center">
          <div className="text-center text-gray-600">
            <RiForbidLine className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="font-semibold">权限不足</p>
            <p className="text-sm">只有管理员可以管理账户</p>
          </div>
        </div>
      </div>
    )}
    {/* 展示层 */}
    {enableFeature && (
      <SettingItemContainer title='账户管理' Icon={RiAddLine} extra={'管理员权限'} extraClassName='text-green-600 bg-green-100'>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2">昵称</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 bg-white text-gray-700"
                placeholder="请输入用户昵称"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2">邮箱</label>
              <input
                type="email"
                className="w-full px-4 py-3 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 bg-white text-gray-700"
                placeholder="请输入用户邮箱"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2">密码</label>
              <input
                type="password"
                className="w-full px-4 py-3 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 bg-white text-gray-700"
                placeholder="设置初始密码"
              />
            </div>

          </div>

          <button className="mt-4 bg-linear-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-md hover:shadow-lg">
            添加账户
          </button>
        </div>
      </SettingItemContainer>
    )}</>)
}
export default memo(CreateAccountWindow)
