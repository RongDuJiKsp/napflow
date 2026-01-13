import type React from 'react'
import type { WorkflowNode } from '../types'

// component nodes
export enum ComponentNodesEnum {
  Tragger = 'tragger',
}

export type ComponentNode<T> = WorkflowNode<{
  type: ComponentNodesEnum;
} & T>

export type ComponentCreator<T> = {
  create: () => ComponentNode<T>;
  component: React.ComponentType<{ nodeId: string, data: ComponentNode<T> }>
  editPanel: React.ComponentType<{ nodeId: string, data: ComponentNode<T> }>
}
