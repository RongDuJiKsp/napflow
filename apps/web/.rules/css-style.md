1. 色彩系统
   主色调：紫色系（purple-_）和粉色系（pink-_）为主

渐变风格：大量使用线性渐变 bg-linear-to-r from-_ to-_

语义色彩：

成功/确认：蓝色系（blue-_ 到 indigo-_）

警告/注意：琥珀色系（amber-_ 到 orange-_）

危险/错误：红色系（red-_ 到 pink-_）

中性/禁用：灰色系（gray-\*）

2. 渐变风格应用
   bg-linear-to-r from-purple-500 to-pink-500
   bg-linear-to-r from-blue-500 to-indigo-500
   bg-linear-to-r from-purple-400 to-pink-400
3. 布局与容器设计
   圆角设计：统一使用 rounded-lg、rounded-xl、rounded-2xl

阴影效果：shadow-lg、shadow-md、hover:shadow-lg

边框风格：细边框 border border-pink-200、border-gray-100

背景设计：渐变背景 bg-linear-to-br from-pink-50 to-purple-50

4. 交互状态样式
   /_ 悬停效果 _/
   hover:from-purple-600 hover:to-pink-600
   hover:bg-purple-50 hover:text-purple-600

/_ 过渡动画 _/
transition-all duration-200
transition-colors duration-200

/_ 焦点状态 _/
focus:ring-2 focus:ring-purple-400 focus:border-transparent 5. 表单元素设计
输入框：白色背景 + 粉色边框 border-pink-200 + 紫色焦点环

标签：紫色标签 text-purple-700 + 中等字体权重

占位符：粉色占位符 placeholder-pink-200

按钮：渐变背景 + 悬停变色效果 + 阴影增强

6. 文本与排版
   标题文字：紫色 text-purple-700 + 字体权重

正文内容：灰色 text-gray-700

标签文字：小字号 text-sm + 中等字体权重

7. 响应式设计
   使用TailwindCSS响应式类名：md:grid-cols-2、hidden md:block

移动端优先的布局策略

8. 样式合并策略
   统一使用 twMerge 合并样式类
   className={twMerge(
   'base-classes',
   condition && 'conditional-classes',
   anotherCondition && 'other-classes'
   )}
   条件样式通过函数参数动态生成
