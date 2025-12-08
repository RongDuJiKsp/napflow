import AccountListWindow from '@/app/components/setting/workspace/AccountListWindow'
import CreateAccountWindow from '@/app/components/setting/workspace/CreateAccountWindow'

export default function WorkspaceSettings() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-purple-700 mb-6">工作区设置</h2>

        {/* 账户列表 */}
        <AccountListWindow/>

        {/* 账户管理 */}
        <CreateAccountWindow/>
      </div>
    </div>
  )
}
