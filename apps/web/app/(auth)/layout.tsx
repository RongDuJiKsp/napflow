import type { PropsWithChildren } from 'react'
import EnsureAuthToken from '../components/account/context-provider/EnsureAuthToken'

export default function Page({ children }: PropsWithChildren) {
  return (
    <div>
      <EnsureAuthToken>
        {children}
      </EnsureAuthToken>
    </div>
  )
}
