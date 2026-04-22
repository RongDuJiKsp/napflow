import { ExecutionEnvironment, LimitExecEnvMethod } from '@/utils/next'

export const ClientOnly = (scope: string) => LimitExecEnvMethod(ExecutionEnvironment.Browser, scope)
export const ServerOnly = (scope: string) => LimitExecEnvMethod(ExecutionEnvironment.Native, scope)
