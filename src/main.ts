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
import { initSidebarController } from '@/features/study-session/sidebar.controller';
import { db } from '@/core/services/firebase';

// Register Lit components (side-effect imports)
import '@/features/flashcards/views/deck';
import '@/shared/components/lightbox';

const lifecycle = createAppLifecycle({
  onReady: async (user) => {
    // 1. Ensure Firestore profile exists (idempotent)
    await createUserProfile(user);

    // 2. Load all flashcards
    flashcardActions.setLoading(true);
    const { data: cards } = await getAllFlashcards(db);
    flashcardActions.setCards(cards, false);

    // Initialize sidebar controller to sync store data with DOM
    initSidebarController();

    // 3. Start study session — builds due queue from loaded cards + progress
    await startStudySession(user);

    // 4. Mount <barcl-deck> into the page container
    const container = document.querySelector<HTMLElement>('#flashcard-workspace');
    if (container) {
      container.innerHTML = '';
      const deck = document.createElement('barcl-deck') as import('@/features/flashcards/views/deck').BarclDeck;
      deck.user = user;
      container.appendChild(deck);
    }

    // 5. Mount global lightbox (listens to open-lightbox events from anywhere)
    if (!document.querySelector('barcl-lightbox')) {
      document.body.appendChild(document.createElement('barcl-lightbox'));
    }

    // 6. Setup logout button
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

    // 7. Reveal workspace now that auth is confirmed and data is loaded
    const workspace = document.getElementById('study-workspace');
    if (workspace) {
      workspace.style.opacity = '1';
      workspace.style.pointerEvents = 'auto';
    }
  },
  onUnauthenticated: () => {
    window.location.replace('/login.html');
  },
});

lifecycle.boot().catch((err) => {
  console.error('[BARCL] Boot failed:', err);
});

window.addEventListener('beforeunload', () => lifecycle.teardown());

