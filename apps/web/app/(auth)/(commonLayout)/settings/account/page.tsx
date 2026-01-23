import PasswordSettingWindow from '@/app/components/setting/account/PasswordWindow'
import UserInfoSettingWindow from '@/app/components/setting/account/UserInfoWindow'
import SettingLayout from '@/app/components/setting/layouts/SettingLayout'

export default function AccountSettings() {
  return (
    <SettingLayout title="账户设置">
      {/* 个人信息设置 */}
      <UserInfoSettingWindow />
      {/* 密码设置 */}
      <PasswordSettingWindow />
    </SettingLayout>
  )
}
