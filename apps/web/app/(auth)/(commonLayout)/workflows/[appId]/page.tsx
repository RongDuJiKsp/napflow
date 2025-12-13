import Editor from '@/app/components/workflow/editor'

export default async function Page({
  params,
}: {
  params: Promise<{ appId: string }>;
}) {
  const { appId } = await params
  return (
    <div>
      <Editor appId={appId}/>
    </div>
  )
}
