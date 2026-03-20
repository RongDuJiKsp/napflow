import { useAreaChangeHandler } from '@/app/hooks/utils/use-immer'
import { useSubmitZod } from '@/app/hooks/utils/use-form'
import { jsonQ } from '@/utils/net'
import type { NullResp } from '@shared/data-transfer/_base'
import {
  type UpdateBotReq,
  ZodCheckUpdateBotReq,
} from '@shared/data-transfer/bot/manager'
import { useResetState } from 'ahooks'
import { useCallback, useEffect, useMemo } from 'react'
import { useBotParam } from '../../hooks/use-bot-param'
import { useBotsQuery } from '@/app/hooks/query/bot/bots/use-bots-query'

export const useEditBot = () => {
  const { botId } = useBotParam()
  const { data: bots, refetch } = useBotsQuery()

  const currentBot = useMemo(
    () => bots?.find(bot => bot.botId === botId) ?? null,
    [bots, botId],
  )

  const [formValue, setFormValue] = useResetState<UpdateBotReq>({
    name: '',
    description: '',
  })

  // 当获取到bot信息后，填充表单
  useEffect(() => {
    if (currentBot) {
      setFormValue({
        name: currentBot.botName,
        description: currentBot.botDesc,
      })
    }
  }, [currentBot, setFormValue])

  const handleChangeName = useAreaChangeHandler(setFormValue, 'name')
  const handleChangeDescription = useAreaChangeHandler(
    setFormValue,
    'description',
  )

  const submitFn = useCallback(
    async (data: UpdateBotReq) =>
      await jsonQ.Post<NullResp>(`/bots/${botId}/update`, data),
    [botId],
  )

  const handleSubmit = useSubmitZod(formValue, ZodCheckUpdateBotReq, submitFn, {
    successText: '更新Bot信息成功',
    errorText: '提交失败',
    afterSuccess: () => {
      refetch()
    },
  })

  return {
    currentBot,
    formValue,
    handleChangeName,
    handleChangeDescription,
    handleSubmit,
  }
}
