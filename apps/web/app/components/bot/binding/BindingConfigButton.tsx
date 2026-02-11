import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { Button } from '@heroui/react'
import { RiCloseLine, RiPlug2Line, RiSettings2Line } from '@remixicon/react'
import { useBoolean } from 'ahooks'
import { createContext, memo } from 'react'
import { twMerge } from 'tailwind-merge'
import { useBindingConfig } from './hooks/use-binding-config'

const BindingIdContext = createContext<string>('')

const EnvProviderForm = () => {
  const { data } = useBindingBotQuery()
  const { submitConfig } = useBindingConfig()
  return (
    <div>

    </div>
  )
}

const BindingConfigButton = ({ bindingId}: { bindingId: string }) => {
  const [isOpen, setIsOpen] = useBoolean(false)
  return <>
    <Button
      size="sm"
      className={twMerge(
        'bg-linear-to-r from-blue-500 to-purple-500',
        'text-white shadow-md hover:shadow-lg',
        'hover:from-blue-600 hover:to-purple-600',
        'transition-all duration-200',
        'px-3 py-1.5',
      )}
      onClick={setIsOpen.setTrue}
    >
      <RiSettings2Line className="w-4 h-4" />
      <span className="ml-1">配置</span>
    </Button>
    <Dialog open={isOpen} onClose={setIsOpen.setFalse} className="relative z-50">
      {/* Background */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="mx-auto rounded-2xl bg-white shadow-2xl overflow-hidden px-3 py-2 w-[45vw] min-h-[45vh] max-h-[70vh] flex flex-col">
          {/* Header */}
          <div className="px-6 pb-2 pt-4 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <RiPlug2Line className="w-6 h-6" />
                <DialogTitle className="text-lg font-semibold text-black/70">
                  插件绑定设置
                </DialogTitle>
              </div>
              <button
                onClick={close}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <RiCloseLine className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Desc */}
          <div className="px-6 pb-3 shrink-0">
            <span className="text-sm text-black/50">
              对绑定Bot的插件进行个性化设置
            </span>
          </div>

          {/* Env List */}
          <div className="px-6 pb-4 overflow-y-auto flex-1">
            <BindingIdContext.Provider value={bindingId}>
              <EnvProviderForm />
            </BindingIdContext.Provider>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  </>
}

export default memo(BindingConfigButton)
