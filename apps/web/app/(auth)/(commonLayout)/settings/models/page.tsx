'use client'

import SettingLayout from '@/app/components/setting/layouts/SettingLayout'
import ApiKeyConfigListWindow from '@/app/components/setting/models/ApiKeyConfigListWindow'

export default function Page() {
  return (
    <SettingLayout title={'apikey配置'}>
      <ApiKeyConfigListWindow
      />

    </SettingLayout>
  )
}
