'use client'
import { memo } from 'react'
import Password from '../../_base/input/Password'
import { useLoginWindow } from './use-login-window'
import InputWrapper from '../../_base/input/InputWrapper'

const LoginWindow = () => {
  const { input, handleEmailChange, handlePasswordChange, handleSubmit } = useLoginWindow()
  return (
    <div className="max-w-md bg-linear-to-br from-pink-50 to-purple-50 rounded-2xl shadow-lg p-8 border border-pink-100">
      <h2 className="text-2xl font-bold text-center text-purple-600 mb-6">登录</h2>

      <form className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-purple-700 mb-2">
            邮箱地址
          </label>
          <InputWrapper
            type="email"
            id="email"
            className="w-full px-4 py-3 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 bg-white text-gray-700 placeholder-pink-300"
            placeholder="请输入邮箱地址"
            value={input.email}
            onValueChange={handleEmailChange}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-purple-700 mb-2">
            密码
          </label>
          <Password
            value='2'
            onValueChange={handlePasswordChange}
            className="w-full px-4 py-3 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 bg-white text-gray-700 placeholder-pink-300"
            placeholder="请输入密码"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-linear-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-md hover:shadow-lg"
          onClick={handleSubmit}
        >
          登录
        </button>
      </form>
    </div>
  )
}
export default memo(LoginWindow)
