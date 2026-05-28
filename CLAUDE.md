# BARCL — Claude Code Configuration

> Medical education flashcard platform (pulmonology/pneumology) using **minute-based spaced repetition**. Offline-first, runs entirely on Firebase. Vite multi-page app · Lit web components · TypeScript strict · Zod · DOMPurify.

---

## Three Apps (Vite multi-page)

| HTML | Entry | Purpose |
|------|-------|---------|
| `index.html` | `src/main.ts` | Study app — mounts `<barcl-deck>` |
| `login.html` | `src/login.main.ts` | Auth (`<barcl-login-form>`) |
| `admin.html` | `src/admin.main.ts` | Admin CRUD + user management |

---

## Commands

```bash
npm run dev          # Vite dev server → http://localhost:3000 (hot reload)
npm run build        # tsc && vite build → /dist
npm run preview      # preview the production build
npm test             # Vitest (run once) — real tests now exist
npm run test:watch   # Vitest watch
npm run lint         # ESLint (warnings allowed, 0 errors required)
npm run format       # Prettier
firebase emulators:start          # all emulators
firebase deploy --only firestore:rules   # deploy rules (see gotcha below)
```

Pre-commit hook (`.husky/pre-commit`) runs `npm test`. Don't bypass with `--no-verify`.

---

## Path Aliases (use these, never deep relative imports)

```ts
'@/...'       → ./src/*
'@shared/...' → ./shared/*
```
Honored by tsconfig, Vite, and Vitest.

---

## Architecture Rules (CRITICAL)

### Functional, not OOP
- **No classes** except Lit components (`@customElement` + `LitElement`).
- Services, stores, utilities = plain functions/closures.
- State: `createStore<T>()` from `src/core/store/index.ts` — one store per feature, exported as `useXxxStore`, with `xxxActions` (object of fns) and `xxxSelectors` (pure fns).

### Lit components
- **Always `override createRenderRoot() { return this; }`** — Shadow DOM is OFF, global CSS is used.
- `static override styles = css\`\`` stays empty; styles go inline (`style="..."`) or in a `<style>` block in the template.
- Bind stores via `StoreController` from `src/shared/utils/lit-helpers.ts` (`new StoreController(this, store)` → `.value`). `StoreSliceController` exists for slice subscriptions.
- Tag prefix `barcl-`; class prefix `Barcl`; declare in `HTMLElementTagNameMap`.
- Arrow methods for event handlers; clean up listeners in `disconnectedCallback`.
- Register a component via side-effect import: `import '@/features/.../views/foo';`.

### TypeScript (strict)
- `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `isolatedModules`, `useDefineForClassFields: false` (needed for Lit decorators).
- **No `any`** (ESLint warns). Array access is `T | undefined` — handle it.

### Zod validation
- All Firestore data → parse before use. Use the shared helper **`parseDoc` / `parseDocs`** from `src/shared/utils/firestore-parse.ts` (generic over the schema → `z.infer<S>` output type, optional `idField`, optional `onError(id, ZodError)` for logging/telemetry).
- Schemas live in `/shared/contracts/` (shared with Cloud Functions). Types via `z.infer`.
- Firestore timestamps: schemas use a `TimestampLike` union (Date | ISO string | `{toDate}`); never `z.date()` alone. Coerce to Date with **`toDate()`** from `src/shared/utils/to-date.ts`.

### Security (non-negotiable)
- **Admin** = Firebase Auth custom claim `request.auth.token.admin == true` — NEVER a Firestore field. The Firestore `role` field is display-only; the source of truth is the claim (set via the `setAdminRole` callable).
- User HTML → `sanitizeHtml()` (DOMPurify) before `unsafeHTML()`. Allowed tags: `b,i,p,ul,li,br,strong,em`; all attributes stripped.
- **Soft delete only**: flashcards use `isDeleted: true`; hard delete is blocked in rules (`allow delete: if false`).
- Auth errors shown to users are generic (no user enumeration).
- CSP: `script-src` is strict (`'self'` + reCAPTCHA only, no `unsafe-inline`/`unsafe-eval`). `style-src` keeps `'unsafe-inline'` because the UI uses inline styles. **No inline `<script>` or inline event handlers** (`onclick=`, etc.) — attach listeners in JS.

---

## Data Models (`/shared/contracts/`)

### Flashcard (`flashcard.ts`)
`id, question, answer, explanation, imageUrl, specialty, category, subcategory, tags, difficulty, order, isPublished, isDeleted, schemaVersion, createdAt, updatedAt, authorId`. Zod error messages are in **Spanish**. `CreateFlashcardSchema` / `UpdateFlashcardSchema` (partial) omit server/immutable fields.

### UserProfile (`user.ts`)
`uid, email, displayName, role` (`student|admin|editor`), `preferences.theme`, `preferences.dailyGoal`. Role locked to `'student'` on client create.

### StudyProgress (`progress.ts`)
`cardId, userId, status` (`new|learning|review|mastered`), `intervalDays, intervalMinutes, repetitions, nextReviewDate, totalReviews, correctStreak, lastReviewedAt, lastRating`. Stored at `users/{uid}/progress/{cardId}`.
- **No `easeFactor`** — it was vestigial (never updated in the cramming model) and was removed. The schema tolerates the legacy field on read (Zod strips it).

---

## SM-2 (minute-based cramming — NOT classic SM-2)

`src/features/study-session/domain/sm2.ts` — pure function, zero side effects.

| Rating | First | Subsequent | Cap |
|--------|-------|-----------|-----|
| `wrong` | 1m | resets to 1m | — |
| `hard` | 10m | ×1.5, clamp 10–60 | 60m |
| `good` | 60m | ×2.5, clamp 60–240 | 240m |
| `easy` | 240m | ×4.0, floor 240 | none |

Status: `new` (0 reps) → `learning` (<60m) → `review` (<240m) → `mastered` (≥240m). Don't "fix" it to day-based SM-2 — short-term cramming is intentional.

### Session completion
A session is **complete when every card in the pool is `mastered`** (`sessionSelectors.isComplete`). The deck then shows the completion screen. A **"Continuar Estudando"** button sets `forceContinue`, which overrides completion and makes `pickNextCard` cycle the full pool.

---

## Images

Card images are **bundled assets** in `public/assets/images/` (extracted from the Anki deck `anki/Diagnostico_Imagens.apkg`), referenced by **relative path** like `assets/images/img_pagina_79_1.jpeg` — NOT Firebase Storage URLs. They resolve from the app root. The admin image field accepts a path or a URL (don't use `<input type="url">` — its native validation rejects relative paths; the Zod schema is the real validator).

---

## ⚠️ Firestore Rules Gotcha (cost us a real bug)

For **updates**, `request.resource.data` is the FULL resulting document, so `request.resource.data.keys().hasOnly([...])` fails whenever the doc carries immutable fields not in the list (`createdAt`, `authorId`, `schemaVersion`) — which broke ALL flashcard edits.

✅ Use **`request.resource.data.diff(resource.data).affectedKeys().hasOnly([...mutable fields])`** for field-level update restrictions — it checks only what changed.

Other invariants: admin from claims; `/users/{uid}` create locks `role:'student'` + key whitelist; owner can only update `displayName, preferences, lastLoginAt`; progress subcollection owner/admin only. **Email verification is NOT required** (optional — relaxed in storage rules).

> Rules changes need a **deploy** (`firebase deploy --only firestore:rules`) — the local file and the Hosting emulator don't apply them at runtime.

---

## Cloud Functions (`firebase/functions/src/`)

Node 20, region `southamerica-east1`, separate tsconfig. Auth triggers use `firebase-functions/v1` (`createUserProfile`, `deleteUserProfile` — the latter `recursiveDelete`s the progress subcollection). Callable `setAdminRole` uses v2 + custom claims.

---

## Services pattern

Two styles coexist — match the surrounding file:
- **Throw `AppError` subclasses** (repositories): `RepositoryError`, `AuthError`, `PermissionError`, `NetworkError`, `ValidationError`, `DomainError` from `src/core/errors`.
- **Return `Result<T, AppError>`** (admin services): discriminated union from `@shared/contracts`.

Map Firebase auth error codes to specific subclasses; keep auth messages generic.

---

## i18n reality (intentional mix — don't unify)
- UI text & boot messages → **Portuguese**.
- Zod validation errors → **Spanish**.
- Cloud Function `HttpsError` → English (standard codes).
Match the nearest existing strings when adding text.

---

## Testing
- Vitest, jsdom, globals on, co-located `*.test.ts`. Aliases honored.
- Existing coverage: `sm2`, `sanitizer`, core `store`, `cache-manager`, Zod `contracts`, `firestore-parse`, session-store completion logic.
- E2E (Playwright) scaffolded but **no specs yet**; its CI step is commented out (re-enable: `npm i -D @playwright/test` + add a spec under `e2e/`).

---

## Known follow-ups (not yet done)
- **Env config is inconsistent**: `.env.example` uses `FIREBASE_*`, the app reads `VITE_FIREBASE_*` (`src/core/services/firebase.ts`), and `scripts/generate-env.js` emits a `runtime-env.js` with yet another shape. Reconcile before adding env validation.

---

## What NOT to Do
- ❌ Classes outside Lit components · ❌ Shadow DOM (`createRenderRoot` must return `this`)
- ❌ Admin checks from Firestore `role` (claims only) · ❌ hard-delete flashcards
- ❌ `innerHTML`/`unsafeHTML` without `sanitizeHtml` first · ❌ `firebase/compat` (modular SDK only)
- ❌ `z.date()` for Firestore timestamps (use `TimestampLike` + `toDate()`)
- ❌ `keys().hasOnly()` on Firestore UPDATE rules (use `diff().affectedKeys()`)
- ❌ inline `<script>` / `onclick=` handlers (breaks the hardened CSP)
- ❌ `<input type="url">` for the image field (rejects relative asset paths)
- ❌ commit `.env.local` / `service-account.json` / `runtime-env.js`
- ❌ point dev at prod Firebase for destructive work — prefer emulators
