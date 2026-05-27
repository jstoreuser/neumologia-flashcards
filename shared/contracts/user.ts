import { z } from 'zod';

export const UserRoleSchema = z.enum(['student', 'admin', 'editor']);

export const UserProfileSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  displayName: z.string().optional().nullable(),
  role: UserRoleSchema.default('student'),
  preferences: z.object({
    theme: z.enum(['light', 'dark']).default('dark'),
    dailyGoal: z.number().min(5).max(200).default(30),
  }).default({ theme: 'dark', dailyGoal: 30 }),
  createdAt: z.any(),
  lastLoginAt: z.any().optional()
});

export type UserProfile = z.infer<typeof UserProfileSchema>;
