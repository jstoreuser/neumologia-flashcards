import { z } from 'zod';

const TimestampLike = z.union([
  z.date(),
  z.string().datetime({ offset: true }),
  z.custom<{ toDate: () => Date }>((val: any) => typeof val?.toDate === 'function'),
]);

export const StudyProgressSchema = z.object({
  cardId: z.string(),
  userId: z.string(),
  status: z.enum(['new', 'learning', 'review', 'mastered']).default('new'),
  intervalDays: z.number().min(0).default(0), // Kept for backwards compatibility
  intervalMinutes: z.number().min(0).default(0),
  repetitions: z.number().min(0).default(0),           // SM-2: number of times rated ≥ 'good'
  nextReviewDate: TimestampLike,
  totalReviews: z.number().min(0).default(0),
  correctStreak: z.number().min(0).default(0),
  lastReviewedAt: TimestampLike.optional(),
  lastRating: z.enum(['wrong', 'hard', 'good', 'easy']).optional(),
});

export type StudyProgress = z.infer<typeof StudyProgressSchema>;

