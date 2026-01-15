import type { WorkflowNode } from '../types'
import type z from 'zod'
import type { ComponentWithClass } from '@/utils/type'
import type { ComponentType, FC } from 'react'
import type { NodeProps } from '@xyflow/react'

// component nodes
export enum ComponentNodesEnum {
  Trigger = 'trigger',
}

// data实例
export type ComponentNode<T> = WorkflowNode<{
  type: ComponentNodesEnum;
  title: string;
  desc: string;
} & T>
export type WorkflowComponentProps<T> = NodeProps<ComponentNode<T>>
export type WorkflowComponent<T> = ComponentType<WorkflowComponentProps<T>>
export type WorkflowFc<T> = FC<WorkflowComponentProps<T>>

// class
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ComponentCreator<T = any> = {
  create: () => T; // 创建实例data域的默认值
  schema: z.ZodType; // 发布前校验的schema（平时显示在发布前检查 发布前check）
  label: string; // 丢菜单的节点名称
  icon: ComponentWithClass; // 菜单图标
  nodeComponent: WorkflowComponent<T>; // 节点渲染组件
  editPanelComponent: WorkflowComponent<T>; // 编辑面板组件
}
