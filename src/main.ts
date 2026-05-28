/**
 * Entry point for index.html (main study app)
 *
 * Boot sequence:
 * 1. Initialize telemetry (global error handlers)
 * 2. Wait for Firebase Auth to settle
 * 3. Redirect unauthenticated / unverified users to login.html
 * 4. Ensure Firestore user profile exists
 * 5. Load first page of flashcards into the store
 * 6. Start the study session
 * 7. Mount <barcl-deck> into the page container
 */

import { createAppLifecycle } from '@/core/lifecycle/app-lifecycle';
import { createUserProfile, logout } from '@/features/auth/auth.service';
import { getAllFlashcards } from '@/features/flashcards/repository';
import { flashcardActions } from '@/features/flashcards/store';
import { startStudySession } from '@/features/study-session/session.service';
import { db } from '@/core/services/firebase';
import { layoutActions } from '@/features/study-session/layout.store';

// Register Lit components (side-effect imports)
import '@/features/study-session/views/study-drawer';

// Register Lit components (side-effect imports)
import '@/features/flashcards/views/deck';
import '@/shared/components/lightbox';

// ── Boot Screen Helpers ────────────────────────────────────────────────────────

function bootStep(message: string) {
  const el = document.getElementById('boot-message');
  if (el) el.textContent = message;
}

function bootSuccess() {
  const screen = document.getElementById('boot-screen');
  if (!screen) return;
  screen.style.opacity = '0';
  screen.style.visibility = 'hidden';
  setTimeout(() => screen.remove(), 600);
}

function bootError(message: string) {
  const screen = document.getElementById('boot-screen');
  const spinner = document.getElementById('boot-spinner');
  const errorIcon = document.getElementById('boot-error-icon');
  const msg = document.getElementById('boot-message');
  const retryBtn = document.getElementById('boot-retry-btn');

  if (spinner) spinner.style.display = 'none';
  if (errorIcon) errorIcon.style.display = 'block';
  if (msg) {
    msg.textContent = message;
    msg.style.color = '#ff8080';
  }
  if (retryBtn) {
    retryBtn.style.display = 'inline-block';
    // Listener attached here instead of an inline onclick, so the CSP
    // script-src can drop 'unsafe-inline'. Property assignment is idempotent.
    retryBtn.onclick = () => window.location.reload();
  }
  if (screen) screen.style.background = '#0a0608'; // subtle red tint
}

// ── Boot Sequence ──────────────────────────────────────────────────────────────

const lifecycle = createAppLifecycle({
  onReady: async (user) => {
    try {
      // Step 1: Ensure Firestore profile exists (idempotent)
      bootStep('Carregando perfil...');
      await createUserProfile(user);

      // Step 2: Load all published flashcards
      bootStep('Buscando flashcards...');
      flashcardActions.setLoading(true);
      const { data: cards } = await getAllFlashcards(db);
      flashcardActions.setCards(cards, false);

      if (cards.length === 0) {
        bootError('Nenhum flashcard encontrado. Entre em contato com o suporte.');
        return;
      }

      // Step 3: Deprecated Sidebar Sync
      bootStep('Preparando layout...');
      // Logic moved to Lit components inside study-drawer

      // Step 4: Build study queue from progress data
      bootStep('Calculando fila de revisão...');
      await startStudySession(user);

      // Step 5: Mount <barcl-deck>
      bootStep('Iniciando sessão...');
      const container = document.querySelector<HTMLElement>('#flashcard-workspace');
      if (container) {
        container.innerHTML = '';
        const deck = document.createElement('barcl-deck') as import('@/features/flashcards/views/deck').BarclDeck;
        deck.user = user;
        container.appendChild(deck);
      }

      // Step 6: Mount global lightbox
      if (!document.querySelector('barcl-lightbox')) {
        document.body.appendChild(document.createElement('barcl-lightbox'));
      }

      // Step 6.5: Populate user profile
      const userNameDisplay = document.getElementById('user-name-display');
      const userEmailDisplay = document.getElementById('user-email-display');
      const userAvatar = document.getElementById('user-avatar');
      if (userNameDisplay && userEmailDisplay && userAvatar) {
        const displayName = user.displayName || 'Estudante';
        userNameDisplay.textContent = displayName;
        userEmailDisplay.textContent = user.email || 'Sem e-mail';
        userAvatar.textContent = displayName.charAt(0).toUpperCase();
      }

      // Step 7: Setup logout button
      const logoutBtn = document.getElementById('btn-logout');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
          try {
            await logout();
            window.location.href = '/login.html';
          } catch (err) {
            console.error('[BARCL] Logout failed:', err);
          }
        });
      }

      // Step 7.5: Setup drawer button
      const openDrawerBtn = document.getElementById('btn-open-drawer');
      if (openDrawerBtn) {
        openDrawerBtn.addEventListener('click', () => {
          layoutActions.openDrawer();
        });
      }

      // Step 8: Reveal workspace
      const workspace = document.getElementById('study-workspace');
      if (workspace) {
        workspace.style.opacity = '1';
        workspace.style.pointerEvents = 'auto';
      }

      // Step 9: Hide boot screen
      bootSuccess();

    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[BARCL] Boot failed:', err);

      // Friendly messages for known errors
      if (msg.includes('listar flashcards')) {
        bootError('Erro ao carregar flashcards. Verifique sua conexão e tente novamente.');
      } else if (msg.includes('sessão') || msg.includes('session')) {
        bootError('Erro ao carregar sessão de estudo. Tente novamente.');
      } else if (msg.includes('permission') || msg.includes('PERMISSION_DENIED')) {
        bootError('Sem permissão para acessar os dados. Faça logout e entre novamente.');
      } else {
        bootError('Ocorreu um erro inesperado. Tente novamente.');
      }
    }
  },

  onUnauthenticated: () => {
    window.location.replace('/login.html');
  },
});

lifecycle.boot().catch((err) => {
  console.error('[BARCL] Boot failed:', err);
  bootError('Falha crítica ao inicializar. Tente recarregar a página.');
});

window.addEventListener('beforeunload', () => lifecycle.teardown());
