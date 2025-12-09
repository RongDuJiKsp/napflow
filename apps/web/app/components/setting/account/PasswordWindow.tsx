'use client'

import { RiLockLine } from '@remixicon/react'
import { memo } from 'react'
import Password from '@/app/components/_base/input/Password'
import SettingItemContainer from '@/app/components/_base/container/SettingItemContainer'
import { useUpdatePassword } from '../hooks/use-update-password'
const PasswordSettingWindow = () => {
  const {
    handleChangeOldPassword,
    handleChangeNewPassword,
    handleChangeConfirmPassword,
    handleSubmit,
    formValue,
  } = useUpdatePassword()
  return (
    <SettingItemContainer title='密码设置' Icon={RiLockLine}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-purple-700 mb-2">原始密码</label>
          <Password
            value={formValue.oldPassword}
            onValueChange={handleChangeOldPassword}
            placeholder="请输入当前密码"
            className="w-full px-4 py-3 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 bg-white text-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-purple-700 mb-2">新密码</label>
          <Password
            value={formValue.newPassword}
            onValueChange={handleChangeNewPassword}
            placeholder="请输入新密码"
            enableComplexityCheck
            className="w-full px-4 py-3 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 bg-white text-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-purple-700 mb-2">确认新密码</label>
          <Password
            value={formValue.confirmPassword}
            onValueChange={handleChangeConfirmPassword}
            placeholder="请再次输入新密码"
            className="w-full px-4 py-3 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 bg-white text-gray-700"
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="mt-4 bg-linear-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-md hover:shadow-lg">
        更新密码
      </button>
    </SettingItemContainer>
  )
}
export default memo(PasswordSettingWindow)
