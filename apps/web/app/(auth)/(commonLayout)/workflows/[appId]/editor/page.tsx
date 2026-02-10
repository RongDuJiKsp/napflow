import AppPublish from '@/app/components/workflow/app-publish'
import Editor from '@/app/components/workflow/editor'
import StoreOutsideProvider from '@/app/components/workflow/editor/providers/StoreOutsideProvider'
import WorkflowSideMenus from '@/app/components/workflow/side-menus'

export default async function Page() {
  return (
    <StoreOutsideProvider>
      <WorkflowSideMenus elements={[AppPublish]}>
        <div className="w-full h-main overflow-hidden">
          <Editor />
        </div>
      </WorkflowSideMenus>
    </StoreOutsideProvider>
  )
}
