'use client'
import Password from '@/app/components/_base/input/Password'
import { useState } from 'react'

export default function Page() {
  const [value, setValue] = useState<string | undefined>()
  return (
    <div><h3>components</h3>
      <h4>password</h4>
      <Password value={value} onChange={setValue} enableComplexityCheck/>
    </div>

  )
}
