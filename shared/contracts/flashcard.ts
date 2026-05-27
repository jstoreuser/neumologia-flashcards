import { z } from 'zod';

/**
 * Accepts Firebase Timestamp objects, ISO date strings, or native Date.
 * z.any() is intentionally avoided — this union provides runtime safety
 * while remaining compatible with Firestore's Timestamp type.
 */
const TimestampLike = z.union([
  z.date(),
  z.string().datetime({ offset: true }),
  z.object({ toDate: z.function().returns(z.date()) }), // Firestore Timestamp shape
]);

export const FlashcardSchema = z.object({
  id: z.string().optional(),
  question: z.string().min(1, 'La pregunta es obligatoria'),
  answer: z.string().min(1, 'La respuesta es obligatoria'),
  explanation: z.string().default(''),                            // Separate from answer
  imageUrl: z.string().url('URL de imagen inválida').optional().nullable(),
  specialty: z.string().min(1).default('neumologia'),             // Multi-module ready
  category: z.string().min(1, 'Categoría es obligatoria'),
  subcategory: z.string().default(''),
  tags: z.array(z.string()).default([]),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  order: z.number().int().min(0).default(0),                     // Deterministic sort
  isPublished: z.boolean().default(false),
  isDeleted: z.boolean().default(false),                         // Soft delete
  schemaVersion: z.number().int().min(1).default(1),             // Migration support
  createdAt: TimestampLike,
  updatedAt: TimestampLike.optional(),
  authorId: z.string().min(1),
});

export type Flashcard = z.infer<typeof FlashcardSchema>;

export const CreateFlashcardSchema = FlashcardSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isDeleted: true,
  schemaVersion: true,
});

export type CreateFlashcardDto = z.infer<typeof CreateFlashcardSchema>;

export const UpdateFlashcardSchema = FlashcardSchema
  .omit({ id: true, createdAt: true, authorId: true, schemaVersion: true })
  .partial();

export type UpdateFlashcardDto = z.infer<typeof UpdateFlashcardSchema>;

