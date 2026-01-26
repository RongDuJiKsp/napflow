'use client'
import { Button } from '@heroui/react'
import { RiCloseLine, RiPuzzleLine, RiSendPlaneLine } from '@remixicon/react'
import { memo } from 'react'
import { usePublishDraftSteps } from './hooks/use-publish-draft'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { DiffEditor } from '@monaco-editor/react'
import { useCreation } from 'ahooks'
import type { editor } from 'monaco-editor'

type PublishStepCommProps = {
  onNextStep: () => void
  onClose: () => void
}

const PublishStepDiff = ({ onNextStep, onClose }: PublishStepCommProps) => {
  const editorOptions = useCreation<editor.IDiffEditorOptions>(() => ({
    readOnly: true,
    domReadOnly: true,
    useInlineViewWhenSpaceIsLimited: false,
    hideUnchangedRegions: {
      enabled: true,
      revealLineCount: 15, // 当用户点击折叠区域时，一次显示多少行代码
      minimumLineCount: 5, // 只有未更改行数超过这个值才会被折叠
      contextLineCount: 3, //  保留变更行前后的上下文行数
    },
    scrollbar: {
      vertical: 'hidden',
    },
    minimap: {
      enabled: false,
    },
    lineNumbers: line => `${line}&emsp;&emsp;`, // html string

  }), [])
  return (
    <div>
      {/* Desc */}
      <span className='text-black/50 pl-7'>对比上一次发布和最新草稿状态 确认发布内容</span>
      <div className='pt-4'>
        <DiffEditor options={editorOptions} height={'50vh'} width={'75vw'} original='1' modified='2'/>
      </div>
    </div>
  )
}

const PublishStepForm = ({ onNextStep, onClose }: PublishStepCommProps) => {
  return (
    <div>
      Publish Step Form
    </div>
  )
}

const PublishStepResult = ({ onNextStep, onClose }: PublishStepCommProps) => {
  return (
    <div>
      Publish Step Result
    </div>
  )
}

const PublsihDraft = () => {
  const { shouldDialogOpen, handlePublish, handleDiffChecked, handleFormSubmitSuccess, handleClose, showDiff, showForm, showResult } = usePublishDraftSteps()
  return (
    <>
      <div className="absolute right-0 top-0 mt-3 mr-6 z-10">
        <Button onClick={handlePublish}>
          <div className='flex items-center gap-3 px-2'>
            <span>发布工作流为插件</span>
            <RiSendPlaneLine size={16} />
          </div>
        </Button>
      </div>
      <Dialog open={shouldDialogOpen} onClose={handleClose} className="relative z-50">
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
                    将工作流发布为插件
                  </DialogTitle>
                </div>
                <button
                  onClick={handleClose}
                  className="text-white/80 hover:text-white transition-colors duration-200"
                >
                  <RiCloseLine className="w-5 h-5" />
                </button>
              </div>
            </div>
            {/* Content */}
            <div className='px-2 pb-3'>
              {showDiff && <PublishStepDiff onNextStep={handleDiffChecked} onClose={handleClose}/>}
              {showForm && <PublishStepForm onNextStep={handleFormSubmitSuccess} onClose={handleClose}/>}
              {showResult && <PublishStepResult onNextStep={handleClose} onClose={handleClose}/>}
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  )
}
export default memo(PublsihDraft)
