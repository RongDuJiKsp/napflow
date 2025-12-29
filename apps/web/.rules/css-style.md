样式编写风格总结
1. 整体风格特点
现代简约风格：使用清晰的布局、圆角设计、渐变背景

色彩系统：基于HeroUI设计系统，使用渐变色（linear-gradient）作为主要视觉元素

响应式设计：使用TailwindCSS的响应式类名

微交互：包含hover、focus、transition等交互效果

2. 针对组件的样式编写规范
布局样式
使用flex布局为主，配合grid进行复杂布局

间距使用标准的TailwindCSS间距系统（space-x-, space-y-）

容器使用rounded-*实现圆角，常用rounded-lg、rounded-xl、rounded-2xl

颜色应用
背景色：大量使用渐变背景bg-linear-to-r from-* to-*

文字色：使用语义化颜色（text-gray-600、text-red-600等）

边框色：使用border-*配合hover状态变化

交互样式
悬停效果：使用hover:*类名，如hover:shadow-md、hover:bg-*

过渡动画：统一使用transition-all duration-200或transition-colors duration-200

禁用状态：使用disabled:*类名处理禁用状态

组件结构样式
对话框组件：使用固定定位，包含header、content、footer三部分

列表项：使用卡片式设计，包含头像、标题、描述、操作按钮

表单元素：使用统一的边框和焦点样式

3. 样式编写最佳实践
使用twMerge合并样式
className={twMerge(
  'base-classes',
  condition && 'conditional-classes',
  anotherCondition && 'other-classes'
)} 
语义化颜色使用
成功/确认：蓝色系（blue-* to indigo-*）

警告/注意：琥珀色系（amber-* to orange-*）

危险/错误：红色系（red-* to pink-*）

中性/禁用：灰色系（gray-*）

