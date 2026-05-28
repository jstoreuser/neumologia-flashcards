import { describe, it, expect } from 'vitest';
import {
  FlashcardSchema,
  UserProfileSchema,
  StudyProgressSchema,
} from './index';

const firestoreTimestamp = { toDate: () => new Date('2026-01-01T00:00:00.000Z') };

describe('FlashcardSchema', () => {
  const valid = {
    question: 'O que é DPOC?',
    answer: 'Doença pulmonar obstrutiva crônica.',
    category: 'Pneumologia',
    authorId: 'admin-uid',
    createdAt: new Date(),
  };

  it('accepts a minimal valid card and applies defaults', () => {
    const r = FlashcardSchema.safeParse(valid);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.explanation).toBe('');
      expect(r.data.specialty).toBe('neumologia');
      expect(r.data.difficulty).toBe('medium');
      expect(r.data.isPublished).toBe(false);
      expect(r.data.isDeleted).toBe(false);
      expect(r.data.schemaVersion).toBe(1);
      expect(r.data.tags).toEqual([]);
      expect(r.data.order).toBe(0);
    }
  });

  it('accepts all three timestamp shapes for createdAt', () => {
    expect(FlashcardSchema.safeParse({ ...valid, createdAt: new Date() }).success).toBe(true);
    expect(FlashcardSchema.safeParse({ ...valid, createdAt: '2026-01-01T00:00:00.000Z' }).success).toBe(true);
    expect(FlashcardSchema.safeParse({ ...valid, createdAt: firestoreTimestamp }).success).toBe(true);
  });

  it('rejects a card missing a required field', () => {
    const { question, ...noQuestion } = valid;
    expect(FlashcardSchema.safeParse(noQuestion).success).toBe(false);
  });

  it('allows null imageUrl', () => {
    expect(FlashcardSchema.safeParse({ ...valid, imageUrl: null }).success).toBe(true);
  });
});

describe('UserProfileSchema', () => {
  it('accepts a valid profile and defaults role + preferences', () => {
    const r = UserProfileSchema.safeParse({
      uid: 'u1',
      email: 'aluno@example.com',
      createdAt: new Date(),
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.role).toBe('student');
      expect(r.data.preferences.theme).toBe('dark');
      expect(r.data.preferences.dailyGoal).toBe(30);
    }
  });

  it('rejects an invalid email', () => {
    expect(UserProfileSchema.safeParse({ uid: 'u1', email: 'not-an-email', createdAt: new Date() }).success).toBe(false);
  });
});

describe('StudyProgressSchema', () => {
  const valid = {
    cardId: 'c1',
    userId: 'u1',
    nextReviewDate: new Date(),
  };

  it('accepts valid progress and applies SM-2 defaults', () => {
    const r = StudyProgressSchema.safeParse(valid);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.status).toBe('new');
      expect(r.data.easeFactor).toBe(2.5);
      expect(r.data.intervalMinutes).toBe(0);
      expect(r.data.repetitions).toBe(0);
    }
  });

  it('accepts a Firestore Timestamp for nextReviewDate', () => {
    expect(StudyProgressSchema.safeParse({ ...valid, nextReviewDate: firestoreTimestamp }).success).toBe(true);
  });

  it('rejects an out-of-range easeFactor', () => {
    expect(StudyProgressSchema.safeParse({ ...valid, easeFactor: 0.5 }).success).toBe(false);
  });
});
