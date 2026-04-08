### 功能目标

| 提出时间 | 预计版本 | 目标内容          | 目标状态 |
| -------- | -------- | ----------------- | -------- |
| 260311   | 26031301 | dify访问节点      | 已完成   |
| 260313   | 26031501 | JSON取字段节点    | 已完成   |
| 260313   | 26031601 | 数组取索引节点    | 已完成   |
| 260314   | 26031601 | Timer触发器       | 已完成   |
| 260317   | 26031701 | ci优化            | 已完成   |
| 260316   | 26031801 | Agent生成workflow | 已完成   |
| 260321   | 26032401 | 项目支持节点整理  | 已完成   |

#### 子目标实现进度

##### [feat] Agent生成workflow 实现进度

| 目标内容             | 目标状态 |
| -------------------- | -------- |
| llm api 配置设置     | 已完成   |
| editor 支持redo undo | 已完成   |
| 支持连接agent        | 已完成   |
| 支持会话中断和恢复   | 已完成   |
| 支持注册editor方法到agent   | 已完成   |
| 会话针对edit支持undo redo   | 已完成   |

### 缺陷修复

| 提出时间 | 预计版本 | 目标内容                                    | 目标状态 |
| -------- | -------- | ------------------------------------------- | -------- |
| 260313   | 26031701 | 富文本编辑器存在卡死的bug                   | 计划中   |
| 260313   | 26031701 | 在bot被操作杀死后仍然能接受消息并且发出响应 | 计划中   |
| 260313   | -        | Bot健康监控看到存在内存泄漏                 | 计划中   |
| 260315   | -        | 循环和迭代可能产生过期数据                  | 计划中   |
| 260316   | 260316   | autoStart没有生效                           | 计划中   |
| 260316   | 260316   | editor界面拉到了过时数据                    | 计划中   |
| 260318   | 260318   | 401时登录页和首页不断跳转                   | 已修复   |

### 类型断言安全性整改（中高风险）

#### 高风险

| 风险级别 | 文件/位置 | 问题描述 | 状态 |
| -------- | --------- | -------- | ---- |
| 高 | apps/server/src/apps/health/check-gc.service.ts:25 | 使用 `as any` 读取 GC 事件 detail，绕过类型系统 | 已完成 |
| 高 | apps/server/src/apps/runtime/core/workflow/nodes/dify-node.ts:80,84 | 对外部 HTTP JSON 响应直接断言结构，缺少校验 | 计划中 |
| 高 | apps/web/app/components/bot/create-bot/hooks/use-create-bot.ts:27,30 | `useContext` 结果用泛型强转，调用方可传任意类型 | 已完成 |
| 高 | apps/web/app/hooks/query/_base.ts:21 | `res.data as QData` 未建立可靠类型约束 | 计划中 |
| 高 | apps/web/utils/form.ts:19 | 递归 transform 后整体强转 `PartialDeep<T>`，结构语义可能漂移 | 计划中 |
| 高 | apps/web/app/components/workflow/editor/mainview/workflow-agent/hooks/use-agent-ws-conn.ts:22 | token 解析后直接断言为枚举值 | 计划中 |

#### 中风险

| 风险级别 | 文件/位置 | 问题描述 | 状态 |
| -------- | --------- | -------- | ---- |
| 中 | apps/web/app/components/workflow/editor/constants.ts:9 | `as unknown as` 双重断言注册节点类型 | 计划中 |
| 中 | apps/web/app/components/workflow/editor/hooks/reactflow-re-exports.ts:18 | `state as unknown as ...` 适配外部库状态类型 | 计划中 |
| 中 | apps/web/app/components/workflow/editor/component-nodes/utils/node.ts:13,19 | 构造节点数据时泛型断言可能掩盖 creator 与类型不一致 | 计划中 |
| 中 | apps/web/app/components/workflow/editor/component-nodes/nodes/iterate/hooks/use-iterate-operator.ts:49<br>apps/web/app/components/workflow/editor/component-nodes/nodes/loop/hooks/use-loop-operator.ts:90 | 按 parentId 过滤后直接断言 `ComponentNode[]` | 计划中 |
