import { E2E_LOGIN_ENVS } from './login'
import { E2E_NAPFLOW_ENVS } from './napflow'
import { E2E_NET_ENVS } from './net'

const E2eEnvs = {
  ...E2E_NET_ENVS,
  ...E2E_LOGIN_ENVS,
  ...E2E_NAPFLOW_ENVS,
}

console.log('Using e2e envs')
console.table(E2E_NET_ENVS)

export default E2eEnvs
