import { z } from 'zod';

export const MemoryBlockSchema = z.object({
  id: z.string(),
  content: z.string().max(8000),
  category: z.string(),
  importance: z.number().min(1).max(10),
  active: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export const MemoryBlockCreateSchema = z.object({
  content: z.string().max(8000),
  category: z.string(),
  importance: z.number().min(1).max(10),
  active: z.boolean().default(true)
});

export const MemoryBlockUpdateSchema = z.object({
  content: z.string().max(8000).optional(),
  category: z.string().optional(),
  importance: z.number().min(1).max(10).optional(),
  active: z.boolean().optional()
});

export const MemoryQueryFilterSchema = z.object({
  category: z.string().optional(),
  min_importance: z.number().min(1).max(10).optional(),
  active_only: z.boolean().optional()
});

export type MemoryBlock = z.infer<typeof MemoryBlockSchema>;
export type MemoryBlockCreate = z.infer<typeof MemoryBlockCreateSchema>;
export type MemoryBlockUpdate = z.infer<typeof MemoryBlockUpdateSchema>;
export type MemoryQueryFilter = z.infer<typeof MemoryQueryFilterSchema>;
