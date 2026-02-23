'use client'
import { Button, Input, Label, TextArea, TextField } from '@heroui/react'
import {
  RiAppStoreLine,
  RiCloseLine,
  RiPuzzleLine,
  RiSendPlaneLine,
} from '@remixicon/react'
import { memo } from 'react'
import {
  usePublishDesctionForm,
  usePublishDiff,
  usePublishDraftSteps,
} from './hooks/use-publish-draft'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { DiffEditor } from '@monaco-editor/react'
import { useCreation } from 'ahooks'
import type { editor } from 'monaco-editor'
import { useAppMetaQuery } from '@/app/hooks/query/use-app-meta-query'
import { useAppParam } from '../hooks/use-app-param'
import { useAppLastVersionQuery } from '@/app/hooks/query/use-app-last-version-query'

type PublishStepCommProps = {
  onNextStep: () => void;
  onClose: () => void;
}

const PublishStepDiff = ({ onNextStep, onClose }: PublishStepCommProps) => {
  const { latestPublishedJson, draftJson, isLoading } = usePublishDiff()
  const editorOptions = useCreation<editor.IDiffEditorOptions>(
    () => ({
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
    }),
    [],
  )
  return (
    <div>
      {/* Desc */}
      <span className="text-black/50 pl-9 pr-2">
        对比上一次发布和最新草稿状态 确认发布内容
      </span>
      <div className="pt-4">
        <DiffEditor
          options={editorOptions}
          loading={isLoading}
          height={'50vh'}
          width={'75vw'}
          originalLanguage="json"
          original={latestPublishedJson}
          modifiedLanguage="json"
          modified={draftJson}
        />
      </div>
      <div className="py-2 px-4 flex justify-end gap-3">
        <Button variant="tertiary" onClick={onClose}>
          取消
        </Button>
        <Button onClick={onNextStep}>下一步</Button>
      </div>
    </div>
  )
}

const PublishStepForm = ({ onNextStep, onClose }: PublishStepCommProps) => {
  const {
    description,
    handleVersionChange,
    handleDescriptionChange,
    handleSubmit,
  } = usePublishDesctionForm(onNextStep)
  return (
    <div className="px-2 min-w-[32vw]">
      {/* Desc */}
      <span className="text-black/50 pl-9 pr-2">填写版本信息</span>
      <div className="px-12 pt-3 pb-4 flex flex-col gap-3">
        <TextField value={description.version} onChange={handleVersionChange}>
          <Label isRequired>版本号</Label>
          <Input maxLength={30} />
        </TextField>
        <TextField
          value={description.description}
          onChange={handleDescriptionChange}
        >
          <Label isRequired>版本描述</Label>
          <TextArea maxLength={50} rows={4} />
        </TextField>
      </div>
      <div className="py-2 px-4 flex justify-end gap-3">
        <Button variant="tertiary" onClick={onClose}>
          取消
        </Button>
        <Button onClick={handleSubmit}>下一步</Button>
      </div>
    </div>
  )
}

const PublishStepResult = ({ onNextStep }: PublishStepCommProps) => {
  const { appId } = useAppParam()
  const { data: appMeta, isLoading: isAppMetaLoading } = useAppMetaQuery(appId)
  const { data: versionData, isLoading: isVersionDataLoading }
    = useAppLastVersionQuery(appId)

  const isLoading = isAppMetaLoading || isVersionDataLoading

  return (
    <div className="px-2 min-w-[32vw]">
      {/* Desc */}
      <span className="text-black/50 pl-9 pr-2">确认发布结果</span>
      <div className="px-12 pt-3 pb-4 flex flex-col gap-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">加载中...</div>
          </div>
        ) : (
          <>
            {/* 应用信息 */}
            <div className="bg-linear-to-br from-pink-50 to-purple-50 rounded-lg p-4 border border-pink-200">
              <h3 className="text-purple-700 font-semibold mb-3 flex items-center gap-2">
                <RiAppStoreLine size={16} />
                应用信息
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 min-w-20">
                    应用名称:
                  </span>
                  <span className="text-sm text-gray-800 font-medium">
                    {appMeta?.appName || '-'}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-sm text-gray-600 min-w-20">
                    应用描述:
                  </span>
                  <span className="text-sm text-gray-800">
                    {appMeta?.appDescription || '-'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 min-w-20">
                    创建者:
                  </span>
                  <span className="text-sm text-gray-800">
                    {appMeta?.createdBy || '-'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 min-w-20">
                    创建时间:
                  </span>
                  <span className="text-sm text-gray-800">
                    {appMeta?.createdAt
                      ? new Date(appMeta.createdAt).toLocaleString('zh-CN')
                      : '-'}
                  </span>
                </div>
              </div>
            </div>

            {/* 版本信息 */}
            <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
              <h3 className="text-blue-700 font-semibold mb-3 flex items-center gap-2">
                <RiPuzzleLine size={16} />
                版本信息
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 min-w-20">
                    版本号:
                  </span>
                  <span className="text-sm text-gray-800 font-medium">
                    {versionData?.version || '-'}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-sm text-gray-600 min-w-20">
                    版本描述:
                  </span>
                  <span className="text-sm text-gray-800">
                    {versionData?.publishDescription || '-'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 min-w-20">
                    发布者:
                  </span>
                  <span className="text-sm text-gray-800">
                    {versionData?.publishBy || '-'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 min-w-20">
                    发布时间:
                  </span>
                  <span className="text-sm text-gray-800">
                    {versionData?.publishAt
                      ? new Date(versionData.publishAt).toLocaleString('zh-CN')
                      : '-'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 min-w-20">
                    更新时间:
                  </span>
                  <span className="text-sm text-gray-800">
                    {versionData?.lastUpdateAt
                      ? new Date(versionData.lastUpdateAt).toLocaleString(
                        'zh-CN',
                      )
                      : '-'}
                  </span>
                </div>
              </div>
            </div>

            {/* 发布成功提示 */}
            <div className="bg-linear-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 text-green-700">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">插件发布成功！</span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                您的工作流已成功发布为插件，现在可以在插件市场中使用。
              </p>
            </div>
          </>
        )}
      </div>
      <div className="py-2 px-4 flex justify-end gap-3">
        <Button onClick={onNextStep}>完成发布</Button>
      </div>
    </div>
  )
}

const PublsihDraft = () => {
  const {
    shouldDialogOpen,
    handlePublish,
    handleDiffChecked,
    handleFormSubmitSuccess,
    handleClose,
    showDiff,
    showForm,
    showResult,
  } = usePublishDraftSteps()
  return (
    <>
      <Button onClick={handlePublish}>
        <div className="flex items-center gap-3 px-2">
          <span>发布工作流为插件</span>
          <RiSendPlaneLine size={16} />
        </div>
      </Button>
      <Dialog
        open={shouldDialogOpen}
        onClose={handleClose}
        className="relative z-50"
      >
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
            <div className="pb-3">
              {showDiff && (
                <PublishStepDiff
                  onNextStep={handleDiffChecked}
                  onClose={handleClose}
                />
              )}
              {showForm && (
                <PublishStepForm
                  onNextStep={handleFormSubmitSuccess}
                  onClose={handleClose}
                />
              )}
              {showResult && (
                <PublishStepResult
                  onNextStep={handleClose}
                  onClose={handleClose}
                />
              )}
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  )
}
export default memo(PublsihDraft)
