import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import { parseDoc, parseDocs, type ParsableSnapshot } from './firestore-parse';

const Schema = z.object({ id: z.string(), name: z.string().min(1) });

const snap = (id: string, data: Record<string, unknown> | undefined, exists = true): ParsableSnapshot => ({
  id,
  data: () => data,
  exists: () => exists,
});

describe('parseDoc', () => {
  it('parses valid data and merges the id via idField', () => {
    const r = parseDoc(snap('abc', { name: 'Card' }), Schema, { idField: 'id' });
    expect(r).toEqual({ id: 'abc', name: 'Card' });
  });

  it('returns null for a non-existent doc', () => {
    expect(parseDoc(snap('x', undefined, false), Schema, { idField: 'id' })).toBeNull();
  });

  it('returns null and calls onError for malformed data', () => {
    const onError = vi.fn();
    const r = parseDoc(snap('bad', { name: '' }), Schema, { idField: 'id', onError });
    expect(r).toBeNull();
    expect(onError).toHaveBeenCalledOnce();
    expect(onError.mock.calls[0]?.[0]).toBe('bad');
  });

  it('does not require idField (parses data as-is)', () => {
    const Plain = z.object({ name: z.string() });
    expect(parseDoc(snap('1', { name: 'x' }), Plain)).toEqual({ name: 'x' });
  });
});

describe('parseDocs', () => {
  it('keeps valid docs and drops malformed ones', () => {
    const docs = [
      snap('a', { name: 'A' }),
      snap('b', { name: '' }), // invalid
      snap('c', { name: 'C' }),
    ];
    const out = parseDocs(docs, Schema, { idField: 'id' });
    expect(out).toEqual([
      { id: 'a', name: 'A' },
      { id: 'c', name: 'C' },
    ]);
  });
});
