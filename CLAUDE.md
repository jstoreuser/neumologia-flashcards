# BARCL — Claude Code Configuration

## Project Overview

**BARCL** is a medical education flashcard platform using spaced repetition (SM-2 algorithm). Target audience: pulmonology/pneumology students. The app is offline-first and runs entirely on Firebase.

**Three separate apps (multi-page Vite build):**
- `/index.html` → Study app (main user-facing)
- `/login.html` → Auth flow
- `/admin.html` → Admin dashboard (CRUD + user management)

---

## Commands

```bash
npm run dev          # Dev server (http://localhost:3000)
npm run build        # Production build → /dist
npm run preview      # Preview production build
npm test             # Vitest unit tests (runs once)
npm run test:watch   # Vitest watch mode
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit (strict)
firebase emulators:start  # Start all local Firebase emulators
```

Pre-commit hook (`husky`) runs `npm test` automatically — do not skip with `--no-verify`.

---

## Architecture Rules (CRITICAL)

### Functional, Not OOP
- **No classes** except Lit web components (which require the `@customElement` decorator)
- All services, stores, utilities = plain functions and closures
- The store pattern is `createStore<T>()` from `src/core/store/index.ts` — use it for all new state

### Lit Web Components
- Extend `LitElement` with `@customElement('tag-name')` decorator
- **Always override `createRenderRoot() { return this; }`** — Shadow DOM is disabled; global CSS is used
- Bind to stores via `StoreController` from `src/shared/utils/lit-helpers.ts`
- `unsafeHTML()` directive is only allowed on content already sanitized by DOMPurify

### TypeScript
- Strict mode is ON: `strict: true`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`
- **No `any`** — use `unknown` and narrow properly, or define a proper type
- **No unused variables** — ESLint will warn; CI will catch it
- All shared data contracts live in `/shared/contracts/` and use Zod schemas

### Zod Validation
- All data entering the app from Firestore **must** be parsed with Zod `.parse()` or `.safeParse()`
- Schemas live in `/shared/contracts/` — add new schemas there, not inline
- Zod is the single source of truth for types: `z.infer<typeof MySchema>` everywhere

### Security (Non-negotiable)
- **Admin role** is checked from Firebase Auth custom claims only — **never** from a Firestore field
- All user-generated HTML goes through `sanitizeHtml()` from `src/shared/utils/sanitizer.ts` (DOMPurify)
- **No hard deletes**: flashcards use `isDeleted: true` soft-delete pattern
- Auth errors shown to users must be generic (no user enumeration)
- Do not disable or bypass CSP headers in `firebase.json`

---

## Data Models (Quick Reference)

### Flashcard (`/shared/contracts/flashcard.ts`)
Key fields: `id, question, answer, explanation, imageUrl, specialty, category, subcategory, tags, difficulty, order, isPublished, isDeleted, schemaVersion`

### UserProfile (`/shared/contracts/user.ts`)
Key fields: `uid, email, displayName, role` (`student|admin|editor`), `preferences.theme`, `preferences.dailyGoal`
- Role is locked to `'student'` on client creation; changed only via Cloud Function `set-admin`

### StudyProgress (`/shared/contracts/progress.ts`)
Key fields: `cardId, userId, status` (`new|learning|review|mastered`), `easeFactor, intervalDays, intervalMinutes, repetitions, nextReviewDate, lastRating` (`wrong|hard|good|easy`)
- Stored as subcollection: `users/{userId}/progress/{cardId}`

---

## SM-2 Algorithm
- Located at `src/features/study-session/domain/sm2.ts`
- **Pure function — zero side effects, zero imports from services**
- Ratings map: `wrong` → 1 min | `hard` → 10 min | `good` → 1 hour | `easy` → 4+ hours
- Do not add Firestore or store dependencies here

---

## Firebase & Emulators
- Firebase project: South America East (`southamerica-east1`)
- Cloud Functions are Node.js 20, v2 API only
- Emulator ports: Firestore 8080 | Auth 9099 | Storage 9199 | Functions 5001 | Hosting 5000
- Always run with emulators locally; never point dev at production Firebase

---

## File Layout Conventions
```
src/features/<feature>/
  domain/          # Pure business logic (no side effects)
  <feature>.service.ts   # Firestore/Auth interactions
  store.ts         # createStore<T> state
  selectors.ts     # Derived state (if complex)
  views/           # Lit components
    <component>.ts

shared/contracts/  # Zod schemas + inferred types (used by frontend AND functions)
firebase/functions/src/  # Cloud Functions (TypeScript)
```

---

## Testing
- Unit tests: Vitest, jsdom environment, co-located with source
- E2E tests: Playwright, Chromium only, base URL `http://localhost:3000`
- SM-2 domain logic and pure utils should have unit tests
- Components can be tested with Vitest + jsdom
- All CI gates: `tsc --noEmit` → ESLint → Vitest → Playwright

---

## What NOT to Do
- Do not add classes outside of Lit components
- Do not read `role` from Firestore to check admin access
- Do not use `innerHTML` without DOMPurify sanitization first
- Do not hard-delete flashcards (use `isDeleted: true`)
- Do not add inline `<script>` tags (CSP blocks them)
- Do not use `firebase/compat` — always use modular SDK imports
- Do not commit `.env.local` — use `scripts/generate-env.js` as template
- Do not amend published commits — create new commits
