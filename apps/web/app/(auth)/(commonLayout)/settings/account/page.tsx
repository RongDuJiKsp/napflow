import PasswordSettingWindow from '@/app/components/setting/account/PasswordWindow'
import UserInfoSettingWindow from '@/app/components/setting/account/UserInfoWindow'

export default function AccountSettings() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-purple-700 mb-6">账户设置</h2>
        {/* 个人信息设置 */}
        <UserInfoSettingWindow/>
        {/* 密码设置 */}
        <PasswordSettingWindow/>
      </div>
    </div>
  )
}
