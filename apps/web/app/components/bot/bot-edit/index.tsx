'use client'

import { memo } from 'react'
import { RiRobot2Line } from '@remixicon/react'
import { Button, Input, Label, TextArea, TextField } from '@heroui/react'
import { useEditBot } from './hooks/use-edit-bot'

const EditBot = () => {
  const { formValue, handleChangeName, handleChangeDescription, handleSubmit }
    = useEditBot()

  return (
    <div className="p-6 space-y-6">
      {/* 标题 */}
      <h2 className="text-xl font-bold text-gray-800">Bot 设置</h2>

      {/* 基本信息卡片 */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center mb-4">
          <RiRobot2Line className="w-5 h-5 text-gray-600 mr-2" />
          <h3 className="text-base font-semibold text-gray-800">基本信息</h3>
        </div>

        <div className="space-y-4">
          <TextField value={formValue.name} onChange={handleChangeName}>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              机器人名称
            </Label>
            <Input
              maxLength={20}
              className="w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 bg-white text-gray-700 placeholder-gray-400"
              placeholder="请输入机器人名称"
            />
          </TextField>

          <TextField
            value={formValue.description}
            onChange={handleChangeDescription}
          >
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              机器人描述
            </Label>
            <TextArea
              rows={4}
              maxLength={200}
              className="resize-none overflow-hidden w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 bg-white text-gray-700 placeholder-gray-400"
              placeholder="请输入机器人描述"
            />
          </TextField>
        </div>

        <Button
          className="mt-6 bg-linear-to-r from-blue-500 to-indigo-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-md hover:shadow-lg"
          onClick={handleSubmit}
        >
          保存修改
        </Button>
      </div>
    </div>
  )
}

export default memo(EditBot)
