import { createParamContext } from '@/utils/react'

export type AppParam = {
  appId: string;
}

const { context: AppParamContext, useContextHook: useAppParam } = createParamContext<AppParam>('AppParam')
export { AppParamContext, useAppParam }
