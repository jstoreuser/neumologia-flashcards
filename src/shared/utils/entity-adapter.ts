/**
 * Lightweight Entity Adapter
 * Inspired by Redux Toolkit Entity Adapter to manage normalized state safely.
 */

export interface EntityState<T> {
  byId: Record<string, T>;
  allIds: string[];
}

export function createEntityState<T>(): EntityState<T> {
  return { byId: {}, allIds: [] };
}

function getId(entity: any): string {
  const id = entity.id ?? entity.uid;
  if (!id) throw new Error('Entity must have id or uid');
  return id;
}

export const entityAdapter = {
  setMany<T>(state: EntityState<T>, entities: T[]): EntityState<T> {
    const nextById = { ...state.byId };
    const nextAllIds = [...state.allIds];
    for (const entity of entities) {
      const id = getId(entity);
      if (!nextById[id]) {
        nextAllIds.push(id);
      }
      nextById[id] = entity;
    }
    return { byId: nextById, allIds: nextAllIds };
  },

  setAll<T>(entities: T[]): EntityState<T> {
    const byId: Record<string, T> = {};
    const allIds: string[] = [];
    for (const entity of entities) {
      const id = getId(entity);
      byId[id] = entity;
      allIds.push(id);
    }
    return { byId, allIds };
  },

  upsertOne<T>(state: EntityState<T>, entity: T): EntityState<T> {
    const id = getId(entity);
    const isNew = !state.byId[id];
    return {
      byId: { ...state.byId, [id]: entity },
      allIds: isNew ? [...state.allIds, id] : state.allIds,
    };
  },

  updateOne<T>(state: EntityState<T>, id: string, changes: Partial<T>): EntityState<T> {
    if (!state.byId[id]) return state;
    return {
      ...state,
      byId: {
        ...state.byId,
        [id]: { ...state.byId[id], ...changes },
      },
    };
  },

  removeOne<T>(state: EntityState<T>, id: string): EntityState<T> {
    if (!state.byId[id]) return state;
    const { [id]: _, ...nextById } = state.byId;
    return {
      byId: nextById,
      allIds: state.allIds.filter(existingId => existingId !== id),
    };
  },
};
