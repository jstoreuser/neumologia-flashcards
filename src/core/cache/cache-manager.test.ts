import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  cacheGet,
  cacheSet,
  invalidateByDomain,
  invalidateAll,
  FlashcardCache,
  ProgressCache,
} from './cache-manager';

beforeEach(() => invalidateAll());

describe('cacheGet / cacheSet', () => {
  it('stores and retrieves a value by domain + discriminator', () => {
    cacheSet('flashcards', 'k1', { a: 1 });
    expect(cacheGet<{ a: number }>('flashcards', 'k1')).toEqual({ a: 1 });
  });

  it('returns null for a missing key', () => {
    expect(cacheGet('flashcards', 'missing')).toBeNull();
  });

  it('isolates entries across different discriminators', () => {
    cacheSet('flashcards', 'k1', 'one');
    cacheSet('flashcards', 'k2', 'two');
    expect(cacheGet('flashcards', 'k1')).toBe('one');
    expect(cacheGet('flashcards', 'k2')).toBe('two');
  });
});

describe('TTL expiry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the value before expiry and null after', () => {
    cacheSet('flashcards', 'k', 'val', 1000);
    expect(cacheGet('flashcards', 'k')).toBe('val');
    vi.setSystemTime(1001);
    expect(cacheGet('flashcards', 'k')).toBeNull();
  });
});

describe('invalidation', () => {
  it('invalidateByDomain removes only entries of that domain', () => {
    cacheSet('flashcards', 'k', 'fc');
    cacheSet('progress', 'u1', 'pg');
    invalidateByDomain('flashcards', false);
    expect(cacheGet('flashcards', 'k')).toBeNull();
    expect(cacheGet('progress', 'u1')).toBe('pg');
  });

  it('invalidateAll clears everything', () => {
    cacheSet('flashcards', 'k', 'fc');
    cacheSet('progress', 'u1', 'pg');
    invalidateAll();
    expect(cacheGet('flashcards', 'k')).toBeNull();
    expect(cacheGet('progress', 'u1')).toBeNull();
  });
});

describe('typed wrappers — roundtrip', () => {
  it('FlashcardCache stores per specialty + page', () => {
    FlashcardCache.set('neumologia', 0, [{ id: 'a' }]);
    expect(FlashcardCache.get('neumologia', 0)).toEqual([{ id: 'a' }]);
    expect(FlashcardCache.get('neumologia', 1)).toBeNull();
  });

  it('ProgressCache stores per uid', () => {
    ProgressCache.set('user-1', { card: { repetitions: 2 } });
    expect(ProgressCache.get('user-1')).toEqual({ card: { repetitions: 2 } });
  });
});
