/**
 * Entry point for admin.html
 *
 * Boot sequence:
 * 1. requireAdmin() — blocks until auth resolves, redirects if not admin
 * 2. Mount <barcl-admin-shell>
 * 3. Shell takes over routing and state management
 */

import { requireAdmin } from '@/features/auth/guards';
import { telemetry } from '@/core/services/telemetry';

// Register Lit components
import '@/features/admin/views/admin-shell/shell';

async function boot() {
  telemetry.init();

  // Will redirect to login if not authenticated, to index if not admin
  await requireAdmin();

  // Mount admin shell into the page
  const container = document.querySelector<HTMLElement>('#admin-panel-root');
  if (!container) return;

  container.innerHTML = '';
  container.appendChild(document.createElement('barcl-admin-shell'));
}

boot().catch((err) => {
  console.error('[BARCL ADMIN] Boot failed:', err);
  telemetry.captureError(err, { phase: 'adminBoot' });
});
