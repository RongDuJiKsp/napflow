import type { WorkflowNode } from '../types'
import type z from 'zod'
import type { ComponentWithClass } from '@/utils/type'
import type { ComponentType, FC } from 'react'
import type { NodeProps } from '@xyflow/react'

// component nodes
export enum ComponentNodesEnum {
  Trigger = 'trigger',
  Reply = 'reply',
}
// node env
export enum VarTypes {
  String = 'string',
  Number = 'number',
  StringArray = 'Array<string>',
  NumberArray = 'Array<number>',
}
export type Var = {
  name: string;
  type: VarTypes;
}
// data实例
export type ComponentNodeDataExtra = {
  type: ComponentNodesEnum;
  title: string;
  desc: string;
  vars: Var[];
}
export type ComponentNodeData<T = unknown> = ComponentNodeDataExtra & T
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
export type ComponentCreator<T = unknown> = {
  create: () => T; // 创建实例data域的默认值
  schema: z.ZodType; // 发布前校验的schema（平时显示在发布前检查 发布前check）
  label: string; // 丢菜单的节点名称
  icon: ComponentWithClass; // 菜单图标
  nodeComponent: ComponentNodeReactNode<T>; // 节点渲染组件
  editPanelComponent: ComponentPanelReactNode<T>; // 编辑面板组件
  prevNodes?: ComponentNodesEnum[]; // 前置可接受的节点类型
  nextNodes?: ComponentNodesEnum[]; // 后置可接受的节点类型
  env?: Var[];
}

// contextMenu
