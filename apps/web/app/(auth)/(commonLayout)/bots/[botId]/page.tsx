import { redirect } from 'next/navigation'

export default async function Page({
  params,
}: {
  params: Promise<{ botId: string }>;
}) {
  const { botId } = await params

  redirect(`/bots/${botId}/dashboard`)
}
