import { useAppVersionsQuery } from '@/app/hooks/query/workflow/use-app-versions-query'
import { useCallback, useMemo, useState } from 'react'
import { useAppParam } from '../../hooks/use-app-param'
import type { WorkflowAppData } from '@shared/common/workflow/entity'
import type { WorkflowAppDraft } from '@shared/common/workflow/base'
import { pick } from 'lodash-es'
import { useResetState } from 'ahooks'
import type { WorkflowPublishResp } from '@shared/data-transfer/workflow/info'
import {
  type WorkflowPublishReq,
  ZodCheckWorkflowPublishReq,
} from '@shared/data-transfer/workflow/info'
import { useAreaChangeHandler } from '@/app/hooks/utils/use-immer'
import { useSubmitZod } from '@/app/hooks/utils/use-form'
import { jsonQ } from '@/utils/net'
import { Code } from '@shared/data-transfer/_base'

export enum PublishStep {
  Close, // 关闭发布弹窗
  Diff, // 发布前diff
  Form, // 发布表单
  Result, // 发布结果
}

export const usePublishDraftSteps = () => {
  const [step, setStep] = useState(PublishStep.Close)
  const shouldDialogOpen = step !== PublishStep.Close

  const handlePublish = () => {
    setStep(PublishStep.Diff)
  }

  const showDiff = step === PublishStep.Diff
  const handleDiffChecked = () => {
    setStep(PublishStep.Form)
  }

  const showForm = step === PublishStep.Form
  const handleFormSubmitSuccess = () => {
    setStep(PublishStep.Result)
  }

  const showResult = step === PublishStep.Result

  const handleClose = () => {
    setStep(PublishStep.Close)
  }

  return {
    step,
    shouldDialogOpen,
    showDiff,
    handlePublish,
    handleDiffChecked,
    showForm,
    handleFormSubmitSuccess,
    showResult,
    handleClose,
  }
}

const getAsDraft = (data?: WorkflowAppData): WorkflowAppDraft | undefined =>
  data ? pick(data, ['ofAppId', 'nodes', 'edges', 'envs']) : undefined

export const usePublishDiff = () => {
  const { appId } = useAppParam()
  const { isLoading, data } = useAppVersionsQuery(appId)
  const draftVersion = useMemo(
    () => data?.find(item => item.version === 'draft'),
    [data],
  )
  const latestData = useMemo(
    () => data?.find(item => item.version !== 'draft'),
    [data],
  )

  const draft = draftVersion ? getAsDraft(draftVersion) : null
  const draftJson = JSON.stringify(draft || {}, null, 2)

  const latestPublished = latestData ? getAsDraft(latestData) : null
  const latestPublishedJson = JSON.stringify(latestPublished || {}, null, 2)

  return {
    draft,
    latestPublished,
    draftJson,
    latestPublishedJson,
    isLoading,
  }
}

export const usePublishDesctionForm = (afterSuccess?: () => void) => {
  const { appId } = useAppParam()

  const [description, setDescription, resetDescription]
    = useResetState<WorkflowPublishReq>({ version: '', description: '' })

  const handleVersionChange = useAreaChangeHandler(setDescription, 'version')
  const handleDescriptionChange = useAreaChangeHandler(
    setDescription,
    'description',
  )

  const fetchSubmitPublish = useCallback(
    async (data: WorkflowPublishReq) =>
      await jsonQ.Post<WorkflowPublishResp>(
        `/workflow/flow/${appId}/publish`,
        data,
      ),
    [appId],
  )
  const submitForm = useSubmitZod<WorkflowPublishReq, WorkflowPublishResp>(
    description,
    ZodCheckWorkflowPublishReq,
    fetchSubmitPublish,
    {
      successText: '发布成功',
      errorText: '发布失败',
    },
  )
  const handleSubmit = useCallback(async () => {
    const resp = await submitForm()
    if (resp?.statusCode === Code.Ok) {
      resetDescription()
      afterSuccess?.()
    }
  }, [submitForm, resetDescription, afterSuccess])

  return {
    description,
    handleVersionChange,
    handleDescriptionChange,
    handleSubmit,
  }
}
