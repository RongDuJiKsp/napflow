import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { useStore } from 'zustand'
import { useEditorOutsideStore } from '../hooks/use-editor-outside-store'
import { memo } from 'react'
import { RiCloseLine, RiPlug2Line } from '@remixicon/react'

const WorkflowEnvDialog = () => {
  const editorOutsideStore = useEditorOutsideStore()
  const isOpen = useStore(editorOutsideStore, state => state.isEnvWindowOpen)
  const close = useStore(editorOutsideStore, state => state.closeEnvWindow)

  return (
    <Dialog open={isOpen} onClose={close}>
      {/* Background */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="mx-auto rounded-2xl bg-white shadow-2xl overflow-hidden px-3 py-2">
          {/* Header */}
          <div className="px-6 pb-2 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <RiPlug2Line className="w-6 h-6 " />
                <DialogTitle className="text-lg font-semibold text-black/70">
                  环境变量
                </DialogTitle>
              </div>
              <button
                onClick={close}
                className="text-white/80 hover:text-white transition-colors duration-200"
              >
                <RiCloseLine className="w-5 h-5" />
              </button>
            </div>
          </div>
          {/* Content */}
          <div className='pb-3'>
            {/* Desc */}
            <span className='text-black/50 pl-9 pr-2'>环境变量在绑定bot时被设置 用于对发布的插件个性化</span>
            <div className='w-[65vw]'>

            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}

export default memo(WorkflowEnvDialog)
