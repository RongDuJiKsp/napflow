import z from 'zod'

export const NoteDataSchema = z.object({
  content: z.string(),
})
export type NoteData = z.infer<typeof NoteDataSchema>
