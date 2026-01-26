import { useState } from 'react'

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
