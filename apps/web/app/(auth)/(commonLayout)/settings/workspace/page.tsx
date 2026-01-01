import AccountListWindow from '@/app/components/setting/workspace/AccountListWindow'
import CreateAccountWindow from '@/app/components/setting/workspace/CreateAccountWindow'
import SettingLayout from '@/app/components/setting/layouts/SettingLayout'
export default function WorkspaceSettings() {
  return (
    <SettingLayout title='工作区设置'>
      {/* 账户列表 */}
      <AccountListWindow/>

      {/* 账户管理 */}
      <CreateAccountWindow/>
    </SettingLayout>
  )
}
