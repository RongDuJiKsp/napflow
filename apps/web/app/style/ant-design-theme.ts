import type { ThemeConfig } from 'antd'

export const AntDesignTheme: ThemeConfig = {
  components: {
    Menu: {
      // 颜色配置 - 符合项目紫色/粉色主题
      itemColor: '#6b7280', // 菜单项文字颜色 (gray-500)
      itemHoverColor: '#ec4899', // 菜单项悬浮文字颜色 (pink-500)
      itemSelectedColor: '#ffffff', // 菜单项选中文字颜色
      horizontalItemHoverColor: '#ec4899', // 水平菜单项悬浮文字颜色 (pink-500)
      horizontalItemSelectedColor: '#ffffff', // 水平菜单项选中文字颜色

      // 背景色配置
      itemBg: 'transparent', // 菜单项背景色
      itemHoverBg: 'rgba(236, 72, 153, 0.1)', // 菜单项悬浮背景色 (pink-500 with 10% opacity)
      itemSelectedBg: 'rgba(236, 72, 153, 0.9)', // 菜单项选中背景色 (pink-500 with 90% opacity)
      itemActiveBg: 'rgba(252, 165, 165, 0.3)', // 菜单项激活背景色 (pink-300 with 30% opacity)
      horizontalItemHoverBg: 'rgba(253, 242, 248, 0.8)', // 水平菜单项悬浮背景色 (pink-50 with 80% opacity)
      horizontalItemSelectedBg: 'rgba(236, 72, 153, 0.9)', // 水平菜单项选中背景色 (pink-500 with 90% opacity)

      // 子菜单配置
      subMenuItemBg: 'rgba(255, 255, 255, 0.95)', // 子菜单项背景色 (white with 95% opacity)
      subMenuItemSelectedColor: '#ec4899', // 子菜单选中项颜色 (pink-500)
      popupBg: 'rgba(255, 255, 255, 0.98)', // 弹出菜单背景色 (white with 98% opacity)

      // 分组标题配置
      groupTitleColor: '#6b7280', // 分组标题颜色 (gray-500)

      // 危险项配置
      dangerItemColor: '#ef4444', // 危险菜单项文字颜色 (red-500)
      dangerItemHoverColor: '#dc2626', // 危险菜单项悬浮文字颜色 (red-600)
      dangerItemSelectedColor: '#ffffff', // 危险菜单项选中文字颜色
      dangerItemActiveBg: '#fef2f2', // 危险菜单项激活背景色 (red-50)
      dangerItemSelectedBg: '#ef4444', // 危险菜单项选中背景色 (red-500)

      // 禁用状态
      itemDisabledColor: '#d1d5db', // 禁用菜单项文字颜色 (gray-300)

      // 暗色模式配置
      darkPopupBg: 'rgba(31, 41, 55, 0.95)', // 暗色模式弹出菜单背景 (gray-800 with 95% opacity)
      darkItemColor: '#d1d5db', // 暗色模式菜单项文字颜色
      darkItemBg: 'transparent', // 暗色模式菜单项背景
      darkSubMenuItemBg: 'rgba(55, 65, 81, 0.8)', // 暗色模式子菜单项背景 (gray-700 with 80% opacity)
      darkItemSelectedColor: '#ffffff', // 暗色模式菜单项选中颜色
      darkItemSelectedBg: 'rgba(236, 72, 153, 0.9)', // 暗色模式菜单项选中背景 (pink-500 with 90% opacity)
      darkItemHoverBg: 'rgba(55, 65, 81, 0.6)', // 暗色模式菜单项悬浮背景 (gray-700 with 60% opacity)
      darkItemHoverColor: '#f9a8d4', // 暗色模式菜单项悬浮颜色 (pink-300)
      darkGroupTitleColor: '#9ca3af', // 暗色模式分组标题颜色
      darkItemDisabledColor: '#6b7280', // 暗色模式禁用项颜色
      darkDangerItemColor: '#f87171', // 暗色模式危险项颜色
      darkDangerItemSelectedBg: '#ef4444', // 暗色模式危险项选中背景 (red-500)
      darkDangerItemHoverColor: '#fca5a5', // 暗色模式危险项悬浮颜色
      darkDangerItemSelectedColor: '#ffffff', // 暗色模式危险项选中颜色
      darkDangerItemActiveBg: 'rgba(127, 29, 29, 0.4)', // 暗色模式危险项激活背景 (red-900 with 40% opacity)
    },
  },
}
