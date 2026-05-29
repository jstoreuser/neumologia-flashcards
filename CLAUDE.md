# BARCL — Claude Code Configuration

> Medical education flashcard platform (pulmonology/pneumology) using **minute-based spaced repetition**. Offline-first, runs entirely on Firebase. Vite multi-page app · Lit web components · TypeScript strict · Zod · DOMPurify.

---

## Production & Project Identity

| | |
|---|---|
| **Firebase project** | `barcl-6e65e` |
| **Primary region** | `southamerica-east1` (callables + getFunctions client region) |
| **Live URL** | https://barcl-6e65e.web.app |
| **Repo** | github.com/jstoreuser/neumologia-flashcards |
| **User base** | **None yet** — deploys to prod are low-risk and authorized; still verify on the live URL after. |

---

## Three Apps (Vite multi-page)

| HTML | Entry | Mounts | Purpose |
|------|-------|--------|---------|
| `index.html` | `src/main.ts` | `<barcl-deck>` | Study app (main user-facing) |
| `login.html` | `src/login.main.ts` | `<barcl-login-form>` | Email/password auth |
| `admin.html` | `src/admin.main.ts` | admin shell | Flashcard CRUD + user management |

---

## Commands

```bash
# Local dev
npm run dev                 # Vite → http://localhost:3000 (hot reload)
firebase emulators:start    # All emulators (firestore/auth/storage/functions/hosting)

# Quality gates
npm test                    # Vitest, 57 tests at last count
npm run lint                # ESLint (0 errors required; warnings allowed)
npx tsc --noEmit            # TypeScript strict typecheck
npm run build               # tsc && vite build → /dist

# Deploys (always scope; the predeploy hook builds functions automatically)
firebase deploy --only firestore:rules,storage
firebase deploy --only hosting              # run `npm run build` first
firebase deploy --only functions            # builds lib/ via predeploy
firebase deploy --only functions:NAME       # single function (e.g. setAdminRole)
```

Pre-commit hook (`.husky/pre-commit`) runs `npm test`. Don't bypass with `--no-verify`.

---

## Path Aliases (use these; never deep relative imports)

```ts
'@/...'       → ./src/*
'@shared/...' → ./shared/*
```
Honored by `tsconfig`, Vite, and Vitest.

---

## Architecture Rules (don't deviate)

### Functional, not OOP
- **No classes** except Lit components (`@customElement` + `LitElement`).
- Services / stores / utilities = plain functions and closures.
- State: `createStore<T>()` from `src/core/store/index.ts`. One store per feature, exported as `useXxxStore`, with `xxxActions` (object of fns) and `xxxSelectors` (pure fns).

### Lit components
- **Always `override createRenderRoot() { return this; }`** — Shadow DOM is OFF; global CSS is used everywhere.
- `static override styles = css\`\`` stays empty; styles go inline (`style="..."`) or in a `<style>` block inside the template.
- Bind stores via `StoreController` from `src/shared/utils/lit-helpers.ts` (`new StoreController(this, store)` → `.value`). `StoreSliceController(this, store, selector)` exists for slice subscriptions.
- Tag prefix `barcl-`; class prefix `Barcl`; always declare in `HTMLElementTagNameMap`.
- Arrow methods for event handlers (preserves `this`); clean up listeners in `disconnectedCallback`.
- Register a component via side-effect import: `import '@/features/.../views/foo';`.

### TypeScript (strict)
`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `isolatedModules`, `useDefineForClassFields: false` (needed for Lit decorators).
- **No `any`** (ESLint warns). Array access is `T | undefined` — handle it.

### Zod validation
- All Firestore reads → use the shared **`parseDoc` / `parseDocs`** from `src/shared/utils/firestore-parse.ts`. Generic over the schema → returns `z.infer<S>`. Options: `idField` (merge `doc.id` under a key like `'id'` or `'uid'`), `onError(id, ZodError)` for logging/telemetry. **Don't `safeParse` Firestore docs by hand** — that pattern is consolidated.
- Schemas live in `/shared/contracts/` and are shared with Cloud Functions.
- Firestore timestamps: schemas use a `TimestampLike` union (Date | ISO string | `{ toDate }`); never `z.date()` alone. Coerce to a `Date` with **`toDate(value)`** from `src/shared/utils/to-date.ts`.

### Security (non-negotiable)
- **Admin = Firebase Auth custom claim** `request.auth.token.admin == true`. NEVER a Firestore field. The Firestore `role` field is display-only; the source of truth is the claim (set via the `setAdminRole` callable).
- User HTML → `sanitizeHtml()` (DOMPurify, strict) before `unsafeHTML()`. Allowed tags only: `b, i, p, ul, li, br, strong, em`; all attributes stripped.
- **Soft delete only**: flashcards use `isDeleted: true`; hard delete is blocked at the rules layer.
- Auth errors shown to users are generic (no user enumeration).
- CSP: `script-src` is strict (`'self'` + reCAPTCHA only, no `unsafe-inline`/`unsafe-eval`). `style-src` keeps `'unsafe-inline'` because the UI uses inline styles. **No inline `<script>` or inline event handlers** (`onclick=`, etc.) — attach listeners in JS.

---

## Helpers cheat-sheet (use these — don't reinvent)

| Helper | Location | What it does |
|---|---|---|
| `createStore<T>(initial)` | `src/core/store/index.ts` | Lightweight Zustand-style store (merge / functional / replace setState + subscribe) |
| `StoreController` / `StoreSliceController` | `src/shared/utils/lit-helpers.ts` | Wire a store to a Lit component (auto subscribe/unsubscribe) |
| `parseDoc<S>(snap, schema, opts)` `parseDocs<S>(docs, schema, opts)` | `src/shared/utils/firestore-parse.ts` | Validate Firestore docs with Zod; skip malformed; optional `idField` + `onError` |
| `toDate(value)` | `src/shared/utils/to-date.ts` | Coerce Firestore Timestamp / ISO string / Date / null → `Date \| null` |
| `sanitizeHtml(html)` | `src/shared/utils/sanitizer.ts` | DOMPurify with the strict medical-text policy |
| `STUDY_CARD_LIMIT` (=1000) | `src/features/flashcards/repository.ts` | Configurable cap on cards loaded per study session |

---

## Data Models (`/shared/contracts/`)

### Flashcard (`flashcard.ts`)
`id, question, answer, explanation, imageUrl, specialty, category, subcategory, tags, difficulty, order, isPublished, isDeleted, schemaVersion, createdAt, updatedAt, authorId`. Zod error messages are in **Spanish**. `CreateFlashcardSchema` / `UpdateFlashcardSchema` (partial) omit server/immutable fields.

### UserProfile (`user.ts`)
`uid, email, displayName, role` (`student | admin | editor`), `preferences.theme`, `preferences.dailyGoal`. Role is locked to `'student'` on client create.

### StudyProgress (`progress.ts`)
`cardId, userId, status` (`new | learning | review | mastered`), `intervalDays, intervalMinutes, repetitions, nextReviewDate, totalReviews, correctStreak, lastReviewedAt, lastRating`. Stored at `users/{uid}/progress/{cardId}`.
- **No `easeFactor`** — removed; was vestigial in the cramming model. A legacy field on read is silently dropped by Zod.

---

## SM-2 (minute-based cramming — NOT classic SM-2)

`src/features/study-session/domain/sm2.ts` — pure function, zero side effects, zero imports from services/stores.

| Rating | First | Subsequent | Cap |
|--------|-------|-----------|-----|
| `wrong` | 1m | resets to 1m | — |
| `hard` | 10m | ×1.5, clamp [10, 60] | 60m |
| `good` | 60m | ×2.5, clamp [60, 240] | 240m |
| `easy` | 240m | ×4.0, floor 240 | none |

Status by interval: `new` (0 reps) → `learning` (<60m) → `review` (<240m) → `mastered` (≥240m). **Don't "fix"** to day-based SM-2 — short-term cramming is the intended model.

### Session completion (`src/features/study-session/store.ts`)
- A session is complete when **every card in the pool reached `mastered`** (`sessionSelectors.isComplete`).
- The deck (`deck.ts`) renders `<barcl-card>` when complete; the card's `_renderComplete` shows stats + two buttons.
- **"Continuar Estudando"** calls `sessionActions.continueStudying()`, which sets `state.forceContinue = true`. While true: `isComplete` returns `false` (completion screen hides) and `pickNextCard` cycles the full pool instead of waiting.

---

## Images

Card images are **bundled assets** in `public/assets/images/` (~108 images extracted from the Anki deck `anki/Diagnostico_Imagens.apkg`), referenced by **relative path** like `assets/images/img_pagina_79_1.jpeg`. They are **NOT** Firebase Storage URLs.

They resolve from the app root and display correctly. The admin image field accepts a **path OR a URL**. **Never** make it `<input type="url">` — its native validation rejects relative paths, and the Zod schema (`z.string().optional().nullable()`) is the real validator.

---

## ⚠️ Gotchas — each one cost a real bug

### 1. Firestore UPDATE rules — use `diff().affectedKeys()`
`request.resource.data.keys().hasOnly([...])` on an UPDATE checks the full resulting document, which still carries immutable fields (`createdAt`, `authorId`, `schemaVersion`) that aren't in the whitelist → every flashcard edit gets permission-denied.
✅ **Use** `request.resource.data.diff(resource.data).affectedKeys().hasOnly([...mutable fields])` — checks only what changed.

### 2. Callables must pin region to match the client
The client calls `getFunctions(app, 'southamerica-east1')`. A v2 callable with no `region` option defaults to `us-central1` and becomes **unreachable** (it bit us on `setAdminRole`).
```ts
export const setAdminRole = https.onCall<...>(
  { region: 'southamerica-east1' },
  async (request) => { ... },
);
```
v1 auth triggers (`createUserProfile`, `deleteUserProfile`) stay in their default regions — they're event-driven, not client-called.

### 3. Functions deploy needs the predeploy build hook
`firebase.json` MUST include this under `functions`:
```json
"predeploy": ["npm --prefix \"$RESOURCE_DIR\" run build"]
```
Without it, `firebase deploy --only functions` ships whatever stale JS is in `lib/`. We had `recursiveDelete` sitting "deployed" but the prod function was running old code for hours until we noticed.

### 4. CSP only applies on real hosting (not the emulator)
The Firebase Hosting **emulator does NOT serve `firebase.json` headers**. To verify CSP, deploy to a **preview channel** (`firebase hosting:channel:deploy <name>`) or to prod.

### 5. The image field is `type="text"`, not `"url"`
Browser-native URL validation blocks the relative asset paths the deck actually uses.

### 6. Don't commit `auth_users.json`
It's the Firebase Auth emulator export → contains user emails + scrypt password hashes. Now gitignored. **Don't track it again.** (Old content still exists in git history; rewrite was not done because Firebase hashes aren't crackable without the project signer key.)

---

## Firestore rules invariants (`firebase/firestore.rules`, deployed)

- `isAdmin()` = `request.auth.token.admin == true`. Never a Firestore field.
- `/users/{uid}` create — locks `role: 'student'` + key whitelist.
- `/users/{uid}` owner update — can only modify `displayName`, `preferences`, `lastLoginAt`.
- `/users/{uid}/progress/{cardId}` — owner or admin only, on reads and writes.
- `/flashcards/{cardId}` student reads require `isPublished == true && isDeleted == false`. Client queries MUST include both `where()` clauses, otherwise permission-denied.
- `/flashcards/{cardId}` — `allow delete: if false` (soft-delete only).
- **Email verification is NOT required.** Storage rules (`firebase/storage.rules`) allow any authenticated read; admin-only write (5MB cap, image MIME types).

Rules changes need a **deploy** (`firebase deploy --only firestore:rules,storage`) — the local file and the Hosting emulator don't apply them at runtime.

---

## Cloud Functions (`firebase/functions/`)

- Runtime: **Node 20** — deprecated 2026-04-30, decommission 2026-10-30. Migration to 22+ is a tracked follow-up.
- Separate `tsconfig.json` (`commonjs`, strict).
- **Predeploy hook** in `firebase.json` builds `lib/` on every deploy.
- Auth triggers (`firebase-functions/v1`):
  - `createUserProfile` (us-central1) — fires on Auth user create; idempotent insert.
  - `deleteUserProfile` (us-east1) — fires on Auth user delete; `recursiveDelete` removes the `progress` subcollection (no orphans).
- Callable (`firebase-functions/v2`):
  - `setAdminRole` (**southamerica-east1**, pinned to match the client) — auth + admin claim + self-revoke guard; sets custom claim and mirrors to `users/{uid}.role` for display.

---

## Services pattern

Two styles coexist — match the surrounding file:
- **Throw `AppError` subclasses** (repositories, auth): `RepositoryError`, `AuthError`, `PermissionError`, `NetworkError`, `ValidationError`, `DomainError` from `src/core/errors`.
- **Return `Result<T, AppError>`** (admin services): discriminated union from `@shared/contracts`.

Map Firebase auth error codes to specific `AppError` subclasses; keep auth-facing messages generic (no user enumeration).

---

## i18n reality (intentional mix — don't unify)
- UI text & boot messages → **Portuguese (PT-BR)**.
- Zod validation errors → **Spanish (ES)**.
- Cloud Function `HttpsError` → English (standard codes).
- Match the nearest existing strings when adding text.

---

## Testing

- **57 tests** across 7 files (Vitest, jsdom, globals on, aliases honored).
- Covered: `sm2` (full), `sanitizer` (XSS vectors), core `store`, `cache-manager` (with fake timers), Zod `contracts` (Firestore timestamp shapes), `firestore-parse`, session-store completion logic.
- `--passWithNoTests` is **removed** from the `test` script; CI runs real tests.
- E2E (Playwright) scaffolded but **no specs** and `@playwright/test` not installed. CI step commented out. Re-enable: `npm i -D @playwright/test` + spec under `e2e/` + uncomment the CI step.

---

## Operational autonomy (this project)

The `.claude/settings.local.json` allowlist authorizes the full cycle without case-by-case prompts:
- `git` (branch/commit/push), `gh pr *` (open / view / checks / **merge**), `firebase deploy *`, build/test/lint commands.
- Prod deploys are fine (no real users); still verify on the live URL after.

Still gated (ask first): `firebase functions:delete`, `git push --force`, branch deletion, `taskkill`, editing `.claude/settings.local.json`.

Branch naming convention: `<type>/<slug>` — `feat/`, `fix/`, `perf/`, `security/`, `refactor/`, `chore/`, `docs/`, `test/`.

---

## Common workflows

### Add a feature touching Firestore
1. New Zod schema in `/shared/contracts/` (if a new entity).
2. Update Firestore rules: explicit `keys().hasOnly` on **create**, `diff().affectedKeys().hasOnly` on **update**.
3. Repository → service → store (`createStore`) → Lit component (`StoreController`).
4. Reads use `parseDoc`/`parseDocs`; HTML output goes through `sanitizeHtml`.
5. Tests for any pure logic (domain / utils).
6. Gates green: `npm test` · `npx tsc --noEmit` · `npm run lint` · `npm run build`.
7. Branch (`feat/...`) → PR → merge → deploy as needed.

### Ship a hotfix
1. Branch off `main` (`fix/...`).
2. Fix + commit + push + PR.
3. `npm test` / typecheck / build green.
4. Merge.
5. Deploy the relevant slice: `firebase deploy --only <hosting|firestore:rules|storage|functions>`. For hosting: `npm run build` first.
6. Verify on https://barcl-6e65e.web.app.

### Change Firestore rules
1. Edit `firebase/firestore.rules`.
2. Reason about UPDATE rules using `diff().affectedKeys()` — `keys().hasOnly()` is a trap (gotcha #1).
3. `firebase deploy --only firestore:rules,storage`. Rules emulator does NOT auto-apply on a running dev server.

### Add a Cloud Function callable
1. New file under `firebase/functions/src/`.
2. **Pin region**: `https.onCall({ region: 'southamerica-east1' }, ...)`.
3. Export from `firebase/functions/src/index.ts`.
4. Client uses `httpsCallable(functions, '<name>')` — `functions` is already region-bound in `src/core/services/firebase.ts`.
5. `firebase deploy --only functions:<name>` (predeploy hook builds automatically).

---

## Known follow-ups (deferred, with reasoning)

- **Node 20 → 22+ functions migration** (decommission 2026-10-30). `firebase-functions` major upgrade has breaking changes — plan carefully.
- **Reconcile env config**: `.env.example` uses `FIREBASE_*`, the app reads `import.meta.env.VITE_FIREBASE_*` (`src/core/services/firebase.ts`), and `scripts/generate-env.js` emits a `runtime-env.js` with yet another shape. Working as-is; touching it without a plan risks breaking the build.
- **`auth_users.json` history rewrite** — file is gitignored now, but old content (4 emails + scrypt hashes) lingers in git history. Hashes aren't crackable without the project signer key, so risk is low; rewrite is destructive (force-push). User's call.
- **DOMPurify `USE_PROFILES: { html: true }`** keeps inert empty `<img>` tags (attributes stripped, so harmless). Tightening to ALLOWED_TAGS-only would be cleaner.
- **`StoreSliceController` adoption** in admin components — perf is fine at current scale; revisit if the deck grows large.

---

## What NOT to Do

- ❌ Classes outside Lit components · ❌ Shadow DOM (`createRenderRoot` must return `this`)
- ❌ Admin checks from Firestore `role` (claims only) · ❌ hard-delete flashcards
- ❌ Raw `safeParse` on Firestore docs (use `parseDoc`/`parseDocs`)
- ❌ `innerHTML`/`unsafeHTML` without `sanitizeHtml` first · ❌ `firebase/compat` (modular SDK only)
- ❌ `z.date()` for Firestore timestamps (use `TimestampLike` + `toDate()`)
- ❌ `keys().hasOnly()` on Firestore UPDATE rules (use `diff().affectedKeys()`)
- ❌ Callables without `{ region: 'southamerica-east1' }` (client mismatch → unreachable)
- ❌ Functions deploy without the predeploy build hook (stale `lib/` ships silently)
- ❌ Inline `<script>` / `onclick=` handlers (breaks the hardened CSP)
- ❌ `<input type="url">` for the image field (rejects relative asset paths)
- ❌ Commit `.env.local` / `service-account.json` / `runtime-env.js` / `auth_users.json` (all gitignored)
- ❌ Hosting emulator for CSP verification (doesn't apply headers — use a preview channel)
- ❌ Point dev at prod Firebase for destructive work — prefer emulators
