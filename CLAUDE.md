# BARCL — Claude Code Configuration

> Medical education flashcard platform (pulmonology) using spaced repetition. Vite multi-page app, Lit web components, TypeScript strict, Firebase backend (Firestore + Auth + Functions + Storage), Zod everywhere.

---

## Quick Commands

```bash
npm run dev               # Vite dev server → http://localhost:3000
npm run build             # tsc + vite build → /dist
npm test                  # Vitest (--passWithNoTests)
npm run lint              # ESLint warn-mode
npm run format            # Prettier
firebase emulators:start  # Firestore 8080, Auth 9099, Storage 9199, Functions 5001
```

Pre-commit (`.husky/pre-commit`): runs `npm test`. Don't bypass with `--no-verify`.

---

## Three Apps (Vite multi-page)

| HTML | Entry | Purpose |
|------|-------|---------|
| `index.html` | `src/main.ts` | Study app (`<barcl-deck>`) |
| `login.html` | `src/login.main.ts` | Auth (`<barcl-login-form>`) |
| `admin.html` | `src/admin.main.ts` | Admin CRUD + user management |

---

## Path Aliases (use these, never relative `../../`)

```ts
'@/...'      → ./src/*
'@shared/...' → ./shared/*
```

Tsconfig has `paths` set; Vite + Vitest both honor them.

---

## ⚡ Core Patterns — Copy These

### Store (functional, Zustand-like)

```ts
// src/features/<feature>/store.ts
import { createStore } from '@/core/store';

export interface MyState { foo: string; loading: boolean; }
const initial: MyState = { foo: '', loading: false };

export const useMyStore = createStore<MyState>(initial);

export const myActions = {
  setFoo: (foo: string) => useMyStore.setState({ foo }),
  // function form for derived updates:
  appendItems: (items: Item[]) =>
    useMyStore.setState((s) => ({ items: [...s.items, ...items] })),
};

export const mySelectors = {
  isReady: (s: MyState) => !s.loading && s.foo.length > 0,
};
```

Rules:
- One `createStore<T>()` per feature, exported as `useXxxStore`
- Actions = plain object of functions (`xxxActions`)
- Selectors = plain object of pure functions (`xxxSelectors`)
- `setState` shallow-merges by default; pass `replace: true` for full replace
- Never mutate state — always return new object/array

### Lit Component (Shadow DOM OFF)

```ts
// src/features/<feature>/views/my-thing.ts
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { StoreController } from '@/shared/utils/lit-helpers';
import { useMyStore, myActions, mySelectors } from '../store';

@customElement('barcl-my-thing')
export class BarclMyThing extends LitElement {
  override createRenderRoot() { return this; }   // ← MANDATORY: light DOM

  @property({ attribute: false }) user: User | null = null;
  @state() private _localOpen = false;

  private _store = new StoreController(this, useMyStore);

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener('some-event', this._handler);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('some-event', this._handler);
  }

  override render() {
    const state = this._store.value;
    if (!mySelectors.isReady(state)) return html`<div>Loading…</div>`;

    return html`
      <style>
        .container { display: flex; gap: 12px; }
      </style>
      <div class="container">${state.foo}</div>
    `;
  }

  private _handler = (e: Event) => { /* arrow → preserves this */ };

  static override styles = css``;   // ← always empty; styles go inline or in <style> blocks
}

declare global {
  interface HTMLElementTagNameMap {
    'barcl-my-thing': BarclMyThing;
  }
}
```

Rules:
- **`override createRenderRoot() { return this; }`** on EVERY component — no Shadow DOM
- Tag prefix: `barcl-`
- `static override styles = css\`\`` always empty (Shadow DOM is off, styles wouldn't scope anyway)
- Styles: either `style="…"` inline or `<style>` block inside `html\`…\`` template
- Use CSS variables: `--text-primary`, `--text-secondary`, `--border-color`, `--primary`, `--error-color`
- Component reads store via `new StoreController(this, store)` → `.value`
- For slice subscriptions (perf): use `StoreSliceController` with a selector
- Arrow methods for event handlers (`_x = (e) => {…}`) — preserves `this`
- ALWAYS clean up listeners in `disconnectedCallback`
- ALWAYS declare in `HTMLElementTagNameMap` for type safety

### Side-effect import to register a component

```ts
import '@/features/study-session/views/rating-buttons';  // ← registers <barcl-rating-buttons>
```

---

## ⚡ Service / Repository Pattern

Two styles co-exist; match the surrounding code:

### Style A — throw AppError subclasses (read repositories)

```ts
// src/features/flashcards/repository.ts
export async function getFlashcardById(db: Firestore, id: string): Promise<Flashcard> {
  try {
    const snapshot = await getDoc(doc(db, 'flashcards', id));
    const parsed = FlashcardSchema.safeParse({ id: snapshot.id, ...snapshot.data() });
    if (!parsed.success) throw new RepositoryError('Documento inválido');
    return parsed.data;
  } catch (error) {
    if (error instanceof RepositoryError) throw error;
    throw new RepositoryError('Falha ao buscar flashcard');
  }
}
```

### Style B — return `Result<T, AppError>` (admin services)

```ts
// shared/contracts/core.ts
export type Result<T, E = AppError> =
  | { success: true; data: T }
  | { success: false; error: E };

// src/features/admin/admin.service.ts
export async function adminSomething(): Promise<Result<Foo>> {
  try {
    // …work…
    return { success: true, data };
  } catch (err: any) {
    telemetry.captureError(err, { feature: 'admin', operation: 'something' });
    return { success: false, error: createError('Falhou', err) };
  }
}
```

### AppError hierarchy (`src/core/errors/index.ts`)

```
AppError
├── ValidationError   ('validation_error')
├── AuthError         ('auth_error')
├── PermissionError   ('permission_error')
├── NetworkError      ('network_error')
├── RepositoryError   ('repository_error')
└── DomainError       ('domain_error')
```

Map Firebase Auth error codes to specific subclasses; messages must be **generic for auth** (no user enumeration), **localized in PT/ES** for everything else.

---

## ⚡ Zod Validation Pattern

```ts
// ALWAYS use safeParse for Firestore data; never trust the shape
const parsed = FlashcardSchema.safeParse({ id: doc.id, ...doc.data() });
if (!parsed.success) {
  console.warn('[BARCL] Malformed:', doc.id, parsed.error.format());
  return null;   // skip, don't crash the session
}
return parsed.data;
```

- Schemas live in `/shared/contracts/` and are shared with Cloud Functions
- DTOs: `CreateFlashcardSchema = FlashcardSchema.omit({ id: true, createdAt: true, …})` then `.partial()` for updates
- Timestamps in schemas use `TimestampLike` union (Date | ISO string | Firestore Timestamp shape) — never `z.date()` directly because Firestore returns Timestamp objects

---

## ⚡ HTML Sanitization Pattern

ALL dynamic HTML from Firestore → `sanitizeHtml()` → `unsafeHTML()`:

```ts
import { sanitizeHtml } from '@/shared/utils/sanitizer';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

render() {
  return html`<div>${unsafeHTML(sanitizeHtml(card.question))}</div>`;
}
```

DOMPurify config (strict): allows only `b, i, p, ul, li, br, strong, em` — no `style`, `href`, `src`, `onerror`, etc.

---

## ⚡ Boot Sequence (study app)

```
1. telemetry.init()
2. onAuthStateChanged (once)
   ├─ no user → window.location.replace('/login.html')
   └─ user:
       a. createUserProfile(user)           ← idempotent
       b. getAllFlashcards(db) → store
       c. startStudySession(user)           ← loads progress, builds queue
       d. mount <barcl-deck>
       e. mount <barcl-lightbox> (singleton on body)
       f. wire logout button
       g. reveal #study-workspace
3. window 'beforeunload' → lifecycle.teardown()
```

Use `createAppLifecycle({ onReady, onUnauthenticated })` — never roll your own auth observer.

---

## ⚡ Singleton Reusable: `<barcl-lightbox>`

Mounted once on `document.body`. Open from anywhere via event:

```ts
this.dispatchEvent(new CustomEvent('open-lightbox', {
  detail: { url: card.imageUrl },
  bubbles: true,
  composed: true,
}));
```

The lightbox listens on `document` for `open-lightbox` and `keydown` (Esc to close), and toggles `document.body.style.overflow` to lock scroll.

---

## ⚡ SM-2 Algorithm — Quick Reference

`src/features/study-session/domain/sm2.ts` — **pure function, no imports from services**.

Rating → interval mapping (minute-based, not day-based):

| Rating  | First | Subsequent | Multiplier | Cap |
|---------|-------|-----------|-----------|-----|
| `wrong` | 1m    | resets to 1m | —       | —   |
| `hard`  | 10m   | prev × 1.5 | clamp 10–60 | 60m |
| `good`  | 60m   | prev × 2.5 | clamp 60–240 | 240m |
| `easy`  | 240m  | prev × 4.0 | min 240m | none |

Status by interval: `new` (0 reps) → `learning` (<60m) → `review` (<240m) → `mastered` (≥240m).

Use `previewInterval(progress, rating)` to render `"1m"`, `"4h"`, `"2d"` labels.

---

## ⚡ File Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Lit component | `kebab-case.ts` | `rating-buttons.ts` |
| Service | `name.service.ts` | `auth.service.ts` |
| Store | `store.ts` (or `xxx.store.ts`) | `layout.store.ts` |
| Repository | `repository.ts` | `flashcards/repository.ts` |
| Selectors | `selectors.ts` | `admin/selectors.ts` |
| Actions | `actions.ts` or `xxx.actions.ts` | `admin.actions.ts` |
| Domain logic | `kebab-case.ts` | `sm2.ts` |
| Tag name | `barcl-kebab-case` | `barcl-rating-buttons` |
| Class name | `BarclPascalCase` | `BarclRatingButtons` |

---

## ⚡ Internationalization Reality

This project mixes Portuguese (PT-BR) and Spanish (ES). Don't "fix" this — match the local context:

- **UI text & boot messages** → **Portuguese** (`'Carregando perfil...'`, `'Buscando flashcards...'`)
- **Zod validation errors** → **Spanish** (`'La pregunta es obligatoria'`)
- **AppError messages** → **Portuguese** for most (`'Falha ao buscar flashcard'`) — but `PermissionError` default is Spanish (`'No tienes permiso…'`)
- **Cloud Function errors** → English (HttpsError codes are standard)

When adding strings, mirror what the nearest existing strings use.

---

## ⚡ Firestore Security (Critical Rules)

`firebase/firestore.rules` — read before changing data access:

- **`isAdmin()`** = `request.auth.token.admin == true` — claim, NOT a Firestore field
- **`users/{uid}` create** — role hard-locked to `'student'` + key whitelist
- **`users/{uid}` update by owner** — can only modify `displayName`, `preferences`, `lastLoginAt`. Role mutation by owner is blocked.
- **Hard deletes on `/flashcards`** — `allow delete: if false`. Use `isDeleted: true`.
- **Flashcard reads for students** — must have `isPublished: true && isDeleted: false`. Queries from client must include both `where()` clauses or they get permission-denied.
- **`/users/{uid}/progress/{cardId}`** — owner or admin only, on both reads and writes

If you add a new collection, add rules with the same paranoid posture: explicit whitelist, no `if true`.

---

## ⚡ Cloud Functions Conventions

- Location: `firebase/functions/src/`, separate `tsconfig.json` (`commonjs`, strict)
- Region: `southamerica-east1`
- Mixed API versions:
  - **Auth triggers** (`on-create.ts`, `on-delete.ts`) → `firebase-functions/v1` (v1 still required for auth triggers)
  - **Callable** (`set-admin.ts`) → `firebase-functions/v2` (`https.onCall<T>`)
- Callable functions: validate `request.auth` → check admin claim → validate input → guard against self-revocation → use `logger.info/error` with structured context
- Custom claims = source of truth. Mirror to Firestore `role` field only for display.

---

## ⚡ TypeScript Strictness (don't fight it, embrace it)

`tsconfig.json` enables: `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `isolatedModules`.

Implications:
- `array[0]` is `T | undefined` — always check or use non-null assertion only when truly safe
- `{ foo?: string }` is NOT the same as `{ foo: string | undefined }` — pick the right one
- Lit's `override` keyword required on `render`, `connectedCallback`, `disconnectedCallback`, `createRenderRoot`
- `useDefineForClassFields: false` — needed for Lit decorators (`@property`, `@state`)

ESLint warns on `any` and unused vars — clean these up before committing.

---

## ⚡ Testing — Configured but Empty

Vitest + Playwright are wired up, but **0 test files exist**. The pre-commit hook uses `--passWithNoTests`.

Opportunity: **prime targets for first tests**:
- `src/features/study-session/domain/sm2.ts` — pure, easy, high-value
- `src/shared/utils/sanitizer.ts` — security-critical
- `src/core/store/index.ts` — small surface, clear contract
- Zod schemas — round-trip Firestore data

When writing tests:
- Co-locate: `sm2.test.ts` next to `sm2.ts`
- Globals are on (`describe`, `it`, `expect` no import needed)
- Environment is `jsdom`
- E2E tests go in `/e2e/` for Playwright

---

## ❌ What NOT to Do

- ❌ Add classes outside Lit components
- ❌ Use Shadow DOM (`createRenderRoot` must return `this`)
- ❌ Check admin role from Firestore — only from Auth claims
- ❌ Hard-delete flashcards — use `isDeleted: true`
- ❌ Use `innerHTML` or `unsafeHTML()` without `sanitizeHtml()` first
- ❌ Use `firebase/compat` — modular SDK only
- ❌ Use `z.date()` for Firestore timestamps — use the `TimestampLike` union pattern
- ❌ Show specific Firebase auth error messages to users (enumeration risk)
- ❌ Mutate state in stores — always return new objects
- ❌ Forget `override` keyword on Lit lifecycle methods
- ❌ Use relative imports across features — use `@/` alias
- ❌ Commit `.env.local`, `service-account.json`, or `runtime-env.js` (all gitignored)
- ❌ Amend pushed commits — create new ones
- ❌ Run dev against production Firebase — emulators only locally

---

## 🎯 When the User Asks for a Feature

1. Find the closest existing pattern (store + component + service trio)
2. Add Zod schema to `/shared/contracts/` if a new entity
3. Add Firestore rules with explicit whitelist
4. Wire feature: repository → service → store → component
5. Sanitize any user-input HTML before render
6. Localize strings in PT (UI) / ES (Zod errors)
7. Add the `override` keyword on Lit lifecycle methods
8. Update `HTMLElementTagNameMap` global declaration
9. Run `npm run lint` and `npm test` before committing
