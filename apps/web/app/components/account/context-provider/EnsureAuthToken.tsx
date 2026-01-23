'use client'
import { useRouter } from 'next/navigation'
import type { PropsWithChildren } from 'react'
import { memo, useEffect } from 'react'

const EnsureAuthToken = ({ children }: PropsWithChildren) => {
  const router = useRouter()

  // Check if the user is logged in
  useEffect(() => {
    if (!localStorage.getItem('auth-token')) router.replace('/login')
  }, [router])

  return <>{children}</>
}
export default memo(EnsureAuthToken)
