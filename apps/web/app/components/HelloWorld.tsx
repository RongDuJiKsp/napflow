'use client'
import { memo, useEffect, useMemo, useState } from 'react'
import { hello } from '@shared/funcs/hello-world'

const HelloWorld = () => {
  const shared = useMemo(() => hello('nextjs'), [])
  const [serverResp, setServerResp] = useState('')
  useEffect(() => {
    fetch('http://localhost:3000').then(res => res.text()).then(x => setServerResp(x))
  }, [])
  return (
    <div>
      hello world,{shared} <br/>
      hello world,{serverResp}
    </div>
  )
}
export default memo(HelloWorld)
