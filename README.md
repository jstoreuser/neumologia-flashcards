# BARCL — Neumologia Flashcards

Plataforma de flashcards SRS (Spaced Repetition System) para estudantes de pneumologia.
Construído com Vite + TypeScript + Lit + Firebase.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Vite 5, TypeScript strict, Lit 3 |
| Auth | Firebase Authentication |
| Database | Firestore (offline persistence + multi-tab) |
| Storage | Firebase Storage |
| Functions | Cloud Functions for Firebase (Node 20, v2) |
| Hosting | Firebase Hosting |
| Validação | Zod |
| Sanitização | DOMPurify |
| SRS | SM-2 algorithm (puro, frontend) |

---

## Pré-requisitos

- Node.js >= 20
- Firebase CLI: `npm install -g firebase-tools`
- Conta Firebase com projeto configurado

---

## Setup local

```bash
# 1. Clone e instale dependências do frontend
npm install

# 2. Instale dependências das Cloud Functions
cd firebase/functions && npm install && cd ../..

# 3. Copie e preencha as variáveis de ambiente
cp .env.example .env.local
# edite .env.local com as credenciais do seu projeto Firebase

# 4. Rode em modo de desenvolvimento
npm run dev
```

### Variáveis de ambiente (.env.local)

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

---

## Seed de flashcards (primeira vez)

```bash
# Requer GOOGLE_APPLICATION_CREDENTIALS configurado ou firebase login
node scripts/seed-firestore.js
```

---

## Build de produção

```bash
# Frontend
npm run build

# Cloud Functions
cd firebase/functions && npm run build && cd ../..
```

---

## Deploy

```bash
# Login (se necessário)
firebase login

# Deploy de tudo: hosting + firestore rules + storage rules + functions
firebase deploy

# Deploy seletivo
firebase deploy --only hosting
firebase deploy --only firestore
firebase deploy --only functions
```

---

## Estrutura do projeto

```
.
├── src/
│   ├── main.ts                   # Entry point: index.html (app de estudo)
│   ├── login.main.ts             # Entry point: login.html
│   ├── admin.main.ts             # Entry point: admin.html
│   ├── core/
│   │   ├── cache/                # Cache manager (BroadcastChannel cross-tab)
│   │   ├── errors/               # Domain error classes
│   │   ├── lifecycle/            # App lifecycle (auth + boot)
│   │   ├── services/             # Firebase, App Check, Telemetry
│   │   └── store/                # Lightweight reactive store
│   ├── features/
│   │   ├── auth/                 # Login form, auth service, guards
│   │   ├── flashcards/           # Repositório, store, <barcl-card>, <barcl-deck>
│   │   ├── study-session/        # SM-2, session service, <barcl-rating-buttons>
│   │   └── admin/                # CRUD de cards, user management, editor modal
│   ├── shared/
│   │   ├── components/           # <barcl-lightbox>
│   │   └── utils/                # sanitizer, lit-helpers
│   └── css/
│       ├── style.css             # Estilos globais
│       ├── tokens.css            # Design tokens
│       └── login.css             # Estilos da página de login
├── shared/
│   └── contracts/                # Zod schemas compartilhados (Flashcard, User, Progress)
├── firebase/
│   ├── firestore.rules           # Regras de segurança do Firestore
│   ├── storage.rules             # Regras de segurança do Storage
│   └── functions/                # Cloud Functions (Node 20)
│       └── src/
│           ├── auth/on-create.ts # Trigger: cria perfil no registro
│           └── admin/set-admin.ts# Callable: grant/revoke admin claim
└── scripts/
    └── seed-firestore.js         # Seed inicial de flashcards
```

---

## Arquitetura de segurança

| Mecanismo | Detalhe |
|---|---|
| Admin role | Custom claim no token Firebase — nunca lido do Firestore |
| Grant admin | Apenas via Cloud Function `setAdminRole` (não pelo cliente) |
| Firestore rules | Field whitelists em todos os writes |
| XSS | DOMPurify em todo conteúdo de usuário antes de renderizar |
| Auth enumeration | Mensagens de erro genéricas no login |
| App Check | Proteção contra acesso não autorizado à API Firebase |

---

## SM-2 (Spaced Repetition)

O algoritmo SM-2 roda 100% no frontend (`src/features/study-session/domain/sm2.ts`).
O Firestore persiste o estado do progresso por card por usuário.

- `calculateSm2(current, rating)` — puro, sem side effects
- `isDue(progress)` — verifica se um card está vencido
- `previewInterval(progress, rating)` — mostra o próximo intervalo nos botões

---

## Comandos úteis

```bash
npm run dev          # Dev server (porta 3000)
npm run build        # Build de produção
npm run preview      # Preview do build local
firebase emulators:start  # Emuladores locais (Firestore, Auth, Functions)
```
