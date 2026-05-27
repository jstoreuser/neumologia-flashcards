/**
 * Entry point for admin.html
 *
 * Boot sequence:
 * 1. requireAdmin() — blocks until auth resolves, redirects if not admin
 * 2. Load users list
 * 3. Mount admin shell (tab nav, card list, user list, card editor modal)
 */

import { requireAdmin } from '@/features/auth/guards';
import { adminGetUsers } from '@/features/admin/admin.service';
import { adminActions, useAdminStore } from '@/features/admin/store';
import { telemetry } from '@/core/services/telemetry';
import { logout } from '@/features/auth/auth.service';

// Register Lit components
import '@/features/admin/views/card-list';
import '@/features/admin/views/user-list';
import '@/features/admin/views/card-editor';
import '@/shared/components/lightbox';

async function boot() {
  telemetry.init();

  // Will redirect to login if not authenticated, to index if not admin
  await requireAdmin();

  // Pre-load users in background (non-blocking)
  adminActions.setView('flashcards');
  loadUsers();

  // Mount admin shell into the page
  const container = document.querySelector<HTMLElement>('#admin-panel-root');
  if (!container) return;

  container.innerHTML = '';
  container.appendChild(buildAdminShell());

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await logout();
        window.location.replace('/login.html');
      } catch (err) {
        console.error('[BARCL ADMIN] Logout failed:', err);
      }
    });
  }
}

function buildAdminShell(): DocumentFragment {
  const frag = document.createDocumentFragment();

  // Tab Nav
  const nav = document.createElement('div');
  nav.style.cssText = 'display: flex; gap: 4px; margin-bottom: 24px; border-bottom: 1px solid var(--border-color); padding-bottom: 12px;';
  nav.innerHTML = `
    <button id="admin-tab-flashcards" onclick="window.__barclAdminTab('flashcards')" style="
      padding: 8px 18px; background: rgba(0,242,254,0.1); border: 1px solid var(--primary);
      color: var(--primary); border-radius: 4px; cursor: pointer;
      font-family: 'Space Grotesk', sans-serif; font-weight: 600; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px;">
      Flashcards
    </button>
    <button id="admin-tab-users" onclick="window.__barclAdminTab('users')" style="
      padding: 8px 18px; background: rgba(255,255,255,0.04); border: 1px solid var(--border-color);
      color: var(--text-secondary); border-radius: 4px; cursor: pointer;
      font-family: 'Space Grotesk', sans-serif; font-weight: 600; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px;">
      Usuários
    </button>
  `;
  frag.appendChild(nav);

  // Content panels
  const cardPanel = document.createElement('div');
  cardPanel.id = 'admin-view-flashcards';
  cardPanel.appendChild(document.createElement('barcl-card-list'));
  frag.appendChild(cardPanel);

  const userPanel = document.createElement('div');
  userPanel.id = 'admin-view-users';
  userPanel.style.display = 'none';
  userPanel.appendChild(document.createElement('barcl-user-list'));
  frag.appendChild(userPanel);

  // Card editor modal (always present in DOM, shows via store state)
  frag.appendChild(document.createElement('barcl-card-editor'));

  // Expose tab switcher globally (simpler than full routing for an admin panel)
  (window as unknown as { __barclAdminTab: (tab: string) => void }).__barclAdminTab = (tab) => {
    adminActions.setView(tab as 'flashcards' | 'users');

    const fc = document.getElementById('admin-view-flashcards');
    const us = document.getElementById('admin-view-users');
    const btnFc = document.getElementById('admin-tab-flashcards') as HTMLButtonElement;
    const btnUs = document.getElementById('admin-tab-users') as HTMLButtonElement;

    if (fc) fc.style.display = tab === 'flashcards' ? '' : 'none';
    if (us) us.style.display = tab === 'users' ? '' : 'none';

    const activeStyle = 'background: rgba(0,242,254,0.1); border-color: var(--primary); color: var(--primary);';
    const inactiveStyle = 'background: rgba(255,255,255,0.04); border-color: var(--border-color); color: var(--text-secondary);';

    if (btnFc) btnFc.style.cssText += tab === 'flashcards' ? activeStyle : inactiveStyle;
    if (btnUs) btnUs.style.cssText += tab === 'users' ? activeStyle : inactiveStyle;
  };

  return frag;
}

async function loadUsers() {
  try {
    useAdminStore.setState({ isLoadingUsers: true });
    const users = await adminGetUsers();
    adminActions.setUsers(users);
  } catch (err) {
    adminActions.setError(err instanceof Error ? err.message : 'Falha ao carregar usuários');
  }
}

boot().catch((err) => {
  console.error('[BARCL ADMIN] Boot failed:', err);
  telemetry.captureError(err, { phase: 'adminBoot' });
});
