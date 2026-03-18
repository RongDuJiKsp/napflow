'use client'
import { useLocalStorageStringValue } from '@/app/hooks/utils/use-storage'
import { useRouter } from 'next/navigation'
import type { PropsWithChildren } from 'react'
import { memo, useEffect } from 'react'

/**
 * @description EnsureAuthToken 用于监听localStorage的auth-token变化，当auth-token不存在时，自动跳转到登录页。
 * 这样其他拿不到router的组件也能利用setItem在token失效时正确跳转到登录页。
 */
const EnsureAuthToken = ({ children }: PropsWithChildren) => {
  const router = useRouter()
  const authToken = useLocalStorageStringValue('auth-token')

  // Check if the user is logged in
  useEffect(() => {
    if (!authToken) router.replace('/login')
  }, [router, authToken])

  return <>{children}</>
}
export default memo(EnsureAuthToken)
