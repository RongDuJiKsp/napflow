import type { WorkflowNode } from '../types'
import type z from 'zod'
import type { ComponentWithClass } from '@/utils/type'
import type { ComponentType, FC } from 'react'
import type { NodeProps } from '@xyflow/react'
import type {
  ComponentNodeData,
  ComponentNodesEnum,
  Var,
} from '@shared/common/workflow/core/component-node'

// data实例
export type ComponentNode<T = unknown> = WorkflowNode<ComponentNodeData<T>>
export type ComponentNodeProps<T = unknown> = NodeProps<ComponentNode<T>>
export type ComponentNodeReactNode<T = unknown> = ComponentType<
  ComponentNodeProps<T>
>
export type ComponentNodeFc<T = unknown> = FC<ComponentNodeProps<T>>
export type ComponentPanelReactNode<T = unknown> = ComponentType<{
  id: ComponentNode<T>['id'];
  data: ComponentNode<T>['data'];
}>
export type ComponentPanelFc<T = unknown> = FC<{
  id: ComponentNode<T>['id'];
  data: ComponentNode<T>['data'];
}>
// class
export type ComponentCreator<
  T = unknown,
  S extends z.ZodRawShape = z.ZodRawShape,
> = {
  create: () => T; // 创建实例data域的默认值
  schema: z.ZodObject<S>; // 发布前校验的schema（平时显示在发布前检查 发布前check）
  label: string; // 丢菜单的节点名称
  icon: ComponentWithClass; // 菜单图标
  nodeComponent: ComponentNodeReactNode<T>; // 节点渲染组件
  editPanelComponent: ComponentPanelReactNode<T>; // 编辑面板组件
  prevNodes?: ComponentNodesEnum[]; // 前置可接受的节点类型
  nextNodes?: ComponentNodesEnum[]; // 后置可接受的节点类型
  env?: Var[];
  mutiPrevHandles?: boolean;
  mutiNextHandles?: boolean;
  isContainer?: boolean; // 是否是容器类节点（如 loop），容器节点用框包住子节点
}

// contextMenu
