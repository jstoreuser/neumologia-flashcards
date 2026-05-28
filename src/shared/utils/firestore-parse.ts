import type { z } from 'zod';

/**
 * Minimal structural shape of a Firestore document snapshot — both
 * DocumentSnapshot and QueryDocumentSnapshot satisfy it, and plain
 * objects can stand in for it in tests (no firebase import needed here).
 */
export interface ParsableSnapshot {
  id: string;
  data(): Record<string, unknown> | undefined;
  exists?(): boolean;
}

export interface ParseDocOptions {
  /** Merge the doc id into the parsed object under this key (e.g. 'id' or 'uid'). */
  idField?: string;
  /** Called with the doc id and the ZodError when a document fails validation. */
  onError?: (id: string, error: z.ZodError) => void;
}

/**
 * Validates a single Firestore document against a Zod schema.
 * Returns the parsed value, or null if the doc is missing/malformed —
 * so one bad record never breaks a whole list.
 */
export function parseDoc<S extends z.ZodTypeAny>(
  snap: ParsableSnapshot,
  schema: S,
  options: ParseDocOptions = {},
): z.infer<S> | null {
  if (typeof snap.exists === 'function' && !snap.exists()) return null;

  const data = snap.data();
  if (!data) return null;

  const input = options.idField ? { [options.idField]: snap.id, ...data } : data;
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    options.onError?.(snap.id, parsed.error);
    return null;
  }
  return parsed.data;
}

/**
 * Parses an array of Firestore docs against a schema, dropping (and
 * optionally reporting) malformed ones.
 */
export function parseDocs<S extends z.ZodTypeAny>(
  docs: ParsableSnapshot[],
  schema: S,
  options: ParseDocOptions = {},
): z.infer<S>[] {
  const out: z.infer<S>[] = [];
  for (const d of docs) {
    const parsed = parseDoc(d, schema, options);
    if (parsed !== null) out.push(parsed);
  }
  return out;
}
