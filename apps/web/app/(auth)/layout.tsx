import type { PropsWithChildren } from 'react'
import EnsureAuthToken from '../components/account/context/EnsureAuthToken'

export default function Page({ children }: PropsWithChildren) {
  return (
    <div>
      <EnsureAuthToken>
        {children}
      </EnsureAuthToken>
    </div>
  )
}
