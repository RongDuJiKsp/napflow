'use client'

import { RiUserLine } from '@remixicon/react'
import { memo } from 'react'
import SettingItemContainer from '../../_base/container/SettingItemContainer'
import { useUpdateNickname } from '../hooks/use-update-userinfo'
import { Button, Input, TextField } from '@heroui/react'

const UserInfoSettingWindow = () => {
  const {
    formValue,
    handleChangeNickname,
    handleSubmit,
  } = useUpdateNickname()
  return (
    <SettingItemContainer title='个人信息' Icon={RiUserLine}>
      <TextField className="mb-4" value={formValue.nickname} onChange={handleChangeNickname}>
        <label className="block text-sm font-medium text-purple-700 mb-2">新昵称</label>
        <Input
          type="text"
          className="w-full rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 bg-white text-gray-700"
          placeholder="请输入新昵称"
        />
      </TextField>
      <Button
        className="mt-4 bg-linear-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-md hover:shadow-lg"
        onClick={handleSubmit}>
        更新昵称
      </Button>
    </SettingItemContainer>

  )
}
export default memo(UserInfoSettingWindow)
