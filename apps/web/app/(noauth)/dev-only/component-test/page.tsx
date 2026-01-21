'use client'
import Password from '@/app/components/_base/input/Password'
import InputWithEnv from '@/app/components/workflow/editor/component-nodes/common/input-with-env'
import type { VarCtx } from '@/app/components/workflow/editor/component-nodes/hooks/use-component-node-env'
import { VarTypes } from '@/app/components/workflow/editor/component-nodes/types'
import { useState } from 'react'

const envs: VarCtx[] = [
  {
    name: 'input',
    type: VarTypes.String,
    source: { id: 'start', title: '开始节点' },
  },
  {
    name: 'temp1',
    type: VarTypes.Number,
    source: { id: 'process1', title: '处理1' },
  },
  {
    name: 'temp2',
    type: VarTypes.String,
    source: { id: 'process2', title: '处理2' },
  },
]
export default function Page() {
  const [value, setValue] = useState<string | undefined>()
  const [input, setInput] = useState<string>('')
  return (
    <div><h3>components</h3>
      <h4>password</h4>
      <Password value={value} onValueChange={setValue} enableComplexityCheck/>
      env
      <InputWithEnv value={input} onChange={setInput} envs={envs} />
    </div>

  )
}
