import type { Var } from '@shared/common/workflow/core/component-node'
import type { StateCreator } from 'zustand'

type WorkflowEnvState = {
  envs: Var[];
}

type WorkflowEnvAction = {
  addEnv: (env: Var) => void;
  removeEnv: (envname: string) => void;
  removeEnvByIndex: (index: number) => void;
  setEnvs: (envs: Var[]) => void;
}

export type WorkflowEnvStoreShape = WorkflowEnvState & WorkflowEnvAction

export const createWorkflowEnvStoreShape: StateCreator<
  WorkflowEnvStoreShape
> = set => ({
  envs: [],
  addEnv: (env: Var) => set(state => ({ envs: [...state.envs, env] })),
  removeEnv: (envname: string) =>
    set(state => ({
      envs: state.envs.filter(env => env.name !== envname),
    })),
  removeEnvByIndex: (index: number) =>
    set(state => ({ envs: state.envs.filter((_, i) => i !== index) })),
  setEnvs: (envs: Var[]) => set({ envs }),
})
