import z from 'zod'
import { ZodCheckXYPosition } from './re-export'

export enum NodeClassic {
  Component = 'component', // 组件节点,该节点作为工作流运行路径的组成部分
  Note = 'note', // 注释节点,该节点置于组件节点之下但不跟随拖动，用于说明一部分节点 or 一块区域
}

// node和edge里面许多需要透传的data 所以使用looseObject
export const ZodCheckNode = z
  .looseObject({
    id: z.string(),
    position: ZodCheckXYPosition,
    data: z.any(),
    type: z.enum(NodeClassic),
  })
  .catchall(z.any())

export type Node = z.infer<typeof ZodCheckNode>

export const ZodCheckEdge = z
  .looseObject({
    id: z.string(),
    source: z.string(),
    target: z.string(),
    sourceHandle: z.string().optional().nullable(),
    targetHandle: z.string().optional().nullable(),
  })
  .catchall(z.any())
export type Edge = z.infer<typeof ZodCheckEdge>
