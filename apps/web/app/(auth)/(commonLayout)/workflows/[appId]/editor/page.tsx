import AppPublish from '@/app/components/workflow/app-publish'
import AppSettings from '@/app/components/workflow/app-settings'
import Editor from '@/app/components/workflow/editor'
import StoreOutsideProvider from '@/app/components/workflow/editor/providers/StoreOutsideProvider'
import WorkflowEnvButton from '@/app/components/workflow/editor/mainview/workflow-env/WorkflowEnvButton'
import WorkflowSideMenus from '@/app/components/workflow/side-menus'

export default async function Page() {
  return (
    <StoreOutsideProvider>
      <WorkflowSideMenus
        elements={[AppSettings, WorkflowEnvButton, AppPublish]}
      >
        <div className="w-full h-main overflow-hidden">
          <Editor />
        </div>
      </WorkflowSideMenus>
    </StoreOutsideProvider>
  )
}
