import WorkflowProvider from '@/app/components/workflow/providers/WorkflowProvider'
import type { PropsWithChildren } from 'react'

export default async function Layout({
  children,
  params,
}: PropsWithChildren<{
  params: Promise<{ appId: string }>;
}>) {
  const param = await params
  return <WorkflowProvider appParam={param}>{children}</WorkflowProvider>
}
