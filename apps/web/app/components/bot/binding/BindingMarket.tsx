import { useAppVersionsQuery } from '@/app/hooks/query/use-app-versions-query'
import { useAppsQuery } from '@/app/hooks/query/use-apps-query'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { Button } from '@heroui/react'
import { RiCloseLine, RiPuzzleLine } from '@remixicon/react'
import { useBoolean } from 'ahooks'
import { memo } from 'react'
const BindingMarketItem = ({ appId, onSelect}: { appId: string, onSelect: (version: string) => void }) => {
  const { data } = useAppVersionsQuery(appId)
  return (
    <div>
      <div>BindingMarketItem</div>
    </div>
  )
}

const BindingMarket = () => {
  const { data } = useAppsQuery()
  const [shouldDialogOpen, dispatchDialog] = useBoolean(false)
  return (
    <div>
      <Button className={'flex gap-2'}>
        <RiPuzzleLine className="w-6 h-6 " />
        <div>绑定插件到Bot</div>
      </Button>
      <Dialog open={shouldDialogOpen} onClose={dispatchDialog.setFalse} className="relative z-50">
        {/* Background */}
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="mx-auto rounded-2xl bg-white shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-6 pb-2 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <RiPuzzleLine className="w-6 h-6 " />
                  <DialogTitle className="text-lg font-semibold text-black/70">
                    绑定插件到Bot
                  </DialogTitle>
                </div>
                <button
                  onClick={dispatchDialog.setFalse}
                  className="text-white/80 hover:text-white transition-colors duration-200"
                >
                  <RiCloseLine className="w-5 h-5" />
                </button>
              </div>
            </div>
            {/* Content */}
            <div className='pb-3'>

            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  )
}

export default memo(BindingMarket)
