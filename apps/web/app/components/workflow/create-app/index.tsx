'use client'
import { memo } from 'react'
import { Input, Label, TextArea, TextField } from '@heroui/react'
import { twMerge } from 'tailwind-merge'

const CreateAppWindow = () => {
  return (
    <div className={twMerge(
      'p-6 bg-linear-to-br from-purple-50 to-pink-50',
      'rounded-xl border border-pink-200 shadow-sm',
      'max-w-md mx-auto',
    )}>
      <h2 className="text-xl font-semibold text-purple-700 mb-6">
        创建新应用
      </h2>
      <div className="space-y-4">
        <TextField>
          <Label>应用名称</Label>
          <Input maxLength={20} />
        </TextField>
        <TextField>
          <Label>应用描述</Label>
          <TextArea className={'resize-none overflow-hidden'} rows={5} maxLength={50} />
        </TextField>
      </div>
    </div>
  )
}

export default memo(CreateAppWindow)
