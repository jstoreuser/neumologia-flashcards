import { z } from 'zod';

const TimestampLike = z.union([
  z.date(),
  z.string().datetime({ offset: true }),
  z.object({ toDate: z.function().returns(z.date()) }),
]);

export const StudyProgressSchema = z.object({
  cardId: z.string(),
  userId: z.string(),
  status: z.enum(['new', 'learning', 'review', 'mastered']).default('new'),
  easeFactor: z.number().min(1.3).max(5.0).default(2.5),
  intervalDays: z.number().min(0).default(0),
  repetitions: z.number().min(0).default(0),           // SM-2: number of times rated ≥ 'good'
  nextReviewDate: TimestampLike,
  totalReviews: z.number().min(0).default(0),
  correctStreak: z.number().min(0).default(0),
  lastReviewedAt: TimestampLike.optional(),
  lastRating: z.enum(['wrong', 'hard', 'good', 'easy']).optional(),
});

export type StudyProgress = z.infer<typeof StudyProgressSchema>;

