'use client'

import { RiAddLine, RiForbidLine, RiMailLine, RiTimeLine, RiUserLine } from '@remixicon/react'
import { currentUser, mockAccounts } from './mockData'

export default function WorkspaceSettings() {
  const isAdmin = currentUser.isAdmin

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-8 max-h-screen overflow-y-auto">
      <div>
        <h2 className="text-2xl font-bold text-purple-700 mb-6">工作区设置</h2>

        {/* 账户列表 */}
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl shadow-lg p-6 border border-pink-100 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <RiUserLine className="w-6 h-6 text-purple-600 mr-3" />
              <h3 className="text-xl font-semibold text-purple-700">账户列表</h3>
            </div>
            <span className="text-sm text-purple-500 bg-purple-100 px-3 py-1 rounded-full">
              共 {mockAccounts.length} 个账户
            </span>
          </div>

          <div className="space-y-4">
            {mockAccounts.map(account => (
              <div
                key={account.id}
                className={`bg-white rounded-lg p-4 border transition-all duration-200 ${
                  account.isDisabled
                    ? 'border-red-200 bg-red-50 opacity-70'
                    : 'border-pink-100 hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold">
                      {account.nickname.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-800">{account.nickname}</span>
                        {account.isAdmin && (
                          <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded-full">
                            管理员
                          </span>
                        )}
                        {account.isDisabled && (
                          <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                            已禁用
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <RiMailLine className="w-4 h-4 mr-1" />
                        <span>{account.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <RiTimeLine className="w-4 h-4 mr-1" />
                      <span>创建: {formatDate(account.createdAt)}</span>
                    </div>
                    {account.isDisabled && account.disabledAt && (
                      <div className="flex items-center text-sm text-red-600">
                        <RiForbidLine className="w-4 h-4 mr-1" />
                        <span>禁用: {formatDate(account.disabledAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 账户管理 */}
        <div className="relative bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl shadow-lg p-6 border border-pink-100">
          {/* 遮罩层 */}
          {!isAdmin && (
            <div className="absolute inset-0 bg-white bg-opacity-80 backdrop-blur-sm rounded-2xl z-10 flex items-center justify-center">
              <div className="text-center text-gray-600">
                <RiForbidLine className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="font-semibold">权限不足</p>
                <p className="text-sm">只有管理员可以管理账户</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <RiAddLine className="w-6 h-6 text-purple-600 mr-3" />
              <h3 className="text-xl font-semibold text-purple-700">账户管理</h3>
            </div>
            {isAdmin && (
              <span className="text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full">
                管理员权限
              </span>
            )}
          </div>

          {isAdmin && (
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
                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-2">角色</label>
                  <select className="w-full px-4 py-3 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 bg-white text-gray-700">
                    <option value="user">普通用户</option>
                    <option value="admin">管理员</option>
                  </select>
                </div>
              </div>

              <button className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-md hover:shadow-lg">
                添加账户
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
