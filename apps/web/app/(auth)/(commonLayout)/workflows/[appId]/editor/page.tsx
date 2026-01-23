import AppPublish from '@/app/components/workflow/app-publish'
import Editor from '@/app/components/workflow/editor'

export default async function Page() {
  return (
    <AppPublish>
      <div className="w-full h-main overflow-hidden">
        <Editor />
      </div>
    </AppPublish>
  )
}
