'use client'

import { mockAccounts } from '@/app/components/setting/workspace/mockData'
import { RiForbidLine, RiMailLine, RiTimeLine, RiUserLine } from '@remixicon/react'
import { memo } from 'react'
import SettingItemContainer from '../../_base/container/SettingItemContainer'

const AccountSettingWindow = () => {
  return (
    <SettingItemContainer title='账户列表' Icon={RiUserLine} extra={` 共 ${mockAccounts.length} 个账户`}>

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
                <div className="w-10 h-10 bg-linear-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold">
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
                  <span>创建: {account.createdAt}</span>
                </div>
                {account.isDisabled && account.disabledAt && (
                  <div className="flex items-center text-sm text-red-600">
                    <RiForbidLine className="w-4 h-4 mr-1" />
                    <span>禁用: {account.disabledAt}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </SettingItemContainer>
  )
}
export default memo(AccountSettingWindow)
