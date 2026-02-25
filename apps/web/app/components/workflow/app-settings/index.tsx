'use client'
import { Button, Input, Label, TextArea, TextField } from '@heroui/react'
import { RiCloseLine, RiSettings3Line } from '@remixicon/react'
import { memo } from 'react'
import { useAppSettings } from './hooks/use-app-settings'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'

const AppSettings = () => {
  const {
    isOpen,
    formValue,
    handleOpen,
    handleClose,
    handleChangeAppName,
    handleChangeAppDescription,
    handleSubmit,
  } = useAppSettings()

  return (
    <>
      <Button onClick={handleOpen} variant="tertiary">
        <div className="flex items-center gap-2">
          <RiSettings3Line size={16} />
          <span>设置</span>
        </div>
      </Button>
      <Dialog
        open={isOpen}
        onClose={handleClose}
        className="relative z-50"
      >
        {/* Background */}
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="mx-auto rounded-2xl bg-white shadow-2xl overflow-hidden min-w-[32vw]">
            {/* Header */}
            <div className="px-6 pb-2 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <RiSettings3Line className="w-6 h-6" />
                  <DialogTitle className="text-lg font-semibold text-black/70">
                    工作流设置
                  </DialogTitle>
                </div>
                <button
                  onClick={handleClose}
                  className="text-black/50 hover:text-black/80 transition-colors duration-200"
                >
                  <RiCloseLine className="w-5 h-5" />
                </button>
              </div>
            </div>
            {/* Content */}
            <div className="px-12 pt-3 pb-4 flex flex-col gap-3">
              <TextField value={formValue.appName} onChange={handleChangeAppName}>
                <Label isRequired>工作流名称</Label>
                <Input maxLength={20} />
              </TextField>
              <TextField
                value={formValue.appDescription}
                onChange={handleChangeAppDescription}
              >
                <Label isRequired>工作流描述</Label>
                <TextArea
                  className="resize-none overflow-hidden"
                  rows={4}
                  maxLength={50}
                />
              </TextField>
            </div>
            <div className="py-2 px-4 flex justify-end gap-3">
              <Button variant="tertiary" onClick={handleClose}>
                取消
              </Button>
              <Button onClick={handleSubmit}>保存</Button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  )
}

export default memo(AppSettings)
