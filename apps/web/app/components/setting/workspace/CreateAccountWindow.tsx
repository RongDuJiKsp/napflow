'use client'
import { RiAddLine, RiForbidLine } from '@remixicon/react'
import SettingItemContainer from '../../_base/container/SettingItemContainer'
import { memo } from 'react'
import { useAccountAddOperators } from '../hooks/use-account-operators'
import Password from '../../_base/input/Password'
import { Button, Input, Label, TextField } from '@heroui/react'
import { twMerge } from 'tailwind-merge'

const CreateAccountWindow = () => {
  const {
    enableFeature,
    formValue,
    handleChangeEmail,
    handleChangeNickname,
    handleChangePassword,
    handleChangePasswordAgain,
    handleSubmit,
  } = useAccountAddOperators()

  return (<>
    {/* 遮罩层 */}
    {!enableFeature && (
      <SettingItemContainer title='账户管理' Icon={RiAddLine}>

        <div className="inset-0 backdrop-blur-sm rounded-2xl z-10 flex items-center justify-center my-5">
          <div className="text-center text-gray-600">
            <RiForbidLine className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="font-semibold">权限不足</p>
            <p className="text-sm">只有管理员可以管理账户</p>
          </div>
        </div>
      </SettingItemContainer>

    )}
    {/* 展示层 */}
    {enableFeature && (
      <SettingItemContainer title='账户管理' Icon={RiAddLine} extra={'管理员权限'} extraClassName='text-green-600 bg-green-100'>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField value={formValue.nickname} onChange={ handleChangeNickname}>
              <Label className="block text-sm font-medium text-purple-700 mb-2">昵称</Label>
              <Input
                type="text"
                className="w-full rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 bg-white text-gray-700 placeholder-pink-300"
                placeholder="请输入用户昵称"
              />
            </TextField>
            <TextField value={formValue.email} onChange={handleChangeEmail}>
              <Label className="block text-sm font-medium text-purple-700 mb-2">邮箱</Label>
              <Input
                type="email"
                className="w-full rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 bg-white text-gray-700 placeholder-pink-300"
                placeholder="请输入用户邮箱"
              />
            </TextField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="block text-sm font-medium text-purple-700 mb-2">密码</Label>
              <Password
                className={{
                  group: ({ isFocusWithin }) =>
                    twMerge(
                      'w-full  rounded-lg border border-pink-200 transition-all duration-200 bg-white',
                      isFocusWithin
                      && 'outline-none ring-2 border-transparent ring-purple-400',
                    ),
                  input: 'placeholder-pink-300',
                }}
                placeholder="设置初始密码"
                value={formValue.password}
                onValueChange={handleChangePassword}
                enableComplexityCheck
              />
            </div>
            <div>
              <Label className="block text-sm font-medium text-purple-700 mb-2">确认密码</Label>
              <Password
                className={{
                  group: ({ isFocusWithin }) =>
                    twMerge(
                      'w-full  rounded-lg border border-pink-200 transition-all duration-200 bg-white',
                      isFocusWithin
                      && 'outline-none ring-2 border-transparent ring-purple-400',
                    ),
                  input: 'placeholder-pink-300',
                }}
                placeholder="请再次确认密码"
                value={formValue.passwordAgain}
                onValueChange={handleChangePasswordAgain}
              />
            </div>

          </div>

          <Button className="mt-4 bg-linear-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-md hover:shadow-lg"
            onClick={handleSubmit}>
            添加账户
          </Button>
        </div>
      </SettingItemContainer>
    )}</>)
}
export default memo(CreateAccountWindow)
