import z from 'zod'
import type { WorkflowNode } from '../types'

export const NoteDataSchema = z.object({
  content: z.string(),
})
export type NoteData = z.infer<typeof NoteDataSchema>

export type NoteNode = WorkflowNode<NoteData>
