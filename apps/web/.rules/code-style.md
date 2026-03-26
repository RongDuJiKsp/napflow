## 技术栈规则：

使用Next.js 16.1.6 + React 19.2.1 + TypeScript

UI库优先使用HeroUI 3.0.0-beta.3，其次使用Ant Design 6.0.0

状态管理使用Zustand，数据获取使用React Query

网络请求使用Alova库

样式使用TailwindCSS 4 + twMerge

## 代码组织规则：

使用路径别名：@/、@components/、@shared/\*

组件文件使用index.tsx作为入口

Hook文件放在hooks目录下，按功能分类

工具函数放在utils目录下

## 组件开发规则：

所有客户端组件必须添加'use client'指令

使用函数式组件，优先使用React.memo进行性能优化

表单验证使用Zod schema

状态管理使用自定义Hook

事件处理使用useCallback优化

## 样式规则：

使用TailwindCSS类名，避免内联样式

使用twMerge合并样式类

遵循HeroUI的设计系统

## API调用规则：

使用统一的jsonQ实例进行网络请求

错误处理使用Ant Design的message/notification组件

自动处理401错误和token刷新

## 类型安全规则：

启用TypeScript严格模式

使用Zod进行运行时类型验证

充分利用TypeScript类型推断
