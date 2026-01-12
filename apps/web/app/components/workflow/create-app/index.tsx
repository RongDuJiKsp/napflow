'use client'
import { memo } from 'react'
import { Input, Label, TextArea, TextField } from '@heroui/react'
import { twMerge } from 'tailwind-merge'
import { useCreateApp } from './hooks/use-create-app'

const CreateAppWindow = () => {
  const { handleChangeAppName, handleChangeAppDescription, form, handleSubmit } = useCreateApp()
  return (
    <div className={twMerge(
      'p-8 bg-linear-to-br from-pink-50 to-purple-50',
      'rounded-2xl border border-pink-100 shadow-lg',
      'max-w-md mx-auto',
    )}>
      <h2 className="text-xl font-semibold text-purple-700 mb-6">
        创建新应用
      </h2>
      <div className="space-y-4">
        <TextField value={form.appName} onChange={handleChangeAppName}>
          <Label>应用名称</Label>
          <Input maxLength={20} />
        </TextField>
        <TextField value={form.appDescription} onChange={handleChangeAppDescription}>
          <Label>应用描述</Label>
          <TextArea className={'resize-none overflow-hidden'} rows={5} maxLength={50} />
        </TextField>
      </div>
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          className={twMerge(
            'inline-flex items-center gap-2 px-6 py-2 rounded-full text-white font-semibold shadow-md',
            'bg-linear-to-r from-purple-500 to-pink-500',
            'hover:from-purple-600 hover:to-pink-600 active:scale-95',
            'focus:outline-none focus:ring-2 focus:ring-purple-300 transition-transform',
          )}
        >
          提交
        </button>
      </div>
    </div>
  )
}

export default memo(CreateAppWindow)
