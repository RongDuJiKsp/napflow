'use client'

import { RiLockLine, RiUserLine } from '@remixicon/react'
import Password from '@/app/components/_base/input/Password'

export default function AccountSettings() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-purple-700 mb-6">账户设置</h2>

        {/* 个人信息设置 */}
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl shadow-lg p-6 border border-pink-100 mb-6">
          <div className="flex items-center mb-4">
            <RiUserLine className="w-6 h-6 text-purple-600 mr-3" />
            <h3 className="text-xl font-semibold text-purple-700">个人信息</h3>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-purple-700 mb-2">新昵称</label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 bg-white text-gray-700"
              placeholder="请输入新昵称"
              defaultValue="小明"
            />
          </div>

          <button className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-md hover:shadow-lg">
            更新昵称
          </button>
        </div>

        {/* 密码设置 */}
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl shadow-lg p-6 border border-pink-100">
          <div className="flex items-center mb-4">
            <RiLockLine className="w-6 h-6 text-purple-600 mr-3" />
            <h3 className="text-xl font-semibold text-purple-700">密码设置</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2">原始密码</label>
              <Password
                placeholder="请输入当前密码"
                className="w-full px-4 py-3 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 bg-white text-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2">新密码</label>
              <Password
                placeholder="请输入新密码"
                enableComplexityCheck={true}
                className="w-full px-4 py-3 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 bg-white text-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2">确认新密码</label>
              <Password
                placeholder="请再次输入新密码"
                className="w-full px-4 py-3 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 bg-white text-gray-700"
              />
            </div>
          </div>

          <button className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-md hover:shadow-lg">
            更新密码
          </button>
        </div>
      </div>
    </div>
  )
}
