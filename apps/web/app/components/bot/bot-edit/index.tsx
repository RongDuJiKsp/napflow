'use client'

import { memo } from 'react'
import { RiRobot2Line } from '@remixicon/react'
import { Button, Input, Label, TextArea, TextField } from '@heroui/react'
import SettingLayout from '@/app/components/setting/layouts/SettingLayout'
import SettingItemContainer from '@/app/components/_base/container/SettingItemContainer'
import { useEditBot } from './hooks/use-edit-bot'

const EditBot = () => {
  const {
    formValue,
    handleChangeName,
    handleChangeDescription,
    handleSubmit,
  } = useEditBot()

  return (
    <div className="p-6">
      <SettingLayout title="Bot 设置">
        <SettingItemContainer title="基本信息" Icon={RiRobot2Line}>
          <div className="space-y-4">
            <TextField value={formValue.name} onChange={handleChangeName}>
              <Label className="block text-sm font-medium text-purple-700 mb-2">
                机器人名称
              </Label>
              <Input
                maxLength={20}
                className="w-full rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 bg-white text-gray-700 placeholder-pink-500"
                placeholder="请输入机器人名称"
              />
            </TextField>

            <TextField
              value={formValue.description}
              onChange={handleChangeDescription}
            >
              <Label className="block text-sm font-medium text-purple-700 mb-2">
                机器人描述
              </Label>
              <TextArea
                rows={4}
                maxLength={200}
                className="resize-none overflow-hidden w-full rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 bg-white text-gray-700 placeholder-pink-500"
                placeholder="请输入机器人描述"
              />
            </TextField>
          </div>

          <Button
            className="mt-6 bg-linear-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-md hover:shadow-lg"
            onClick={handleSubmit}
          >
            保存修改
          </Button>
        </SettingItemContainer>
      </SettingLayout>
    </div>
  )
}

export default memo(EditBot)
