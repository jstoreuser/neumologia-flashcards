/**
 * Entry point for login.html
 *
 * Boot sequence:
 * 1. Redirect already-authenticated users to index.html
 * 2. Register the <barcl-login-form> custom element
 * 3. Mount it into the page container
 */

import { redirectIfAuthenticated } from '@/features/auth/guards';
import '@/features/auth/views/login-form'; // registers <barcl-login-form>

async function boot() {
  // Redirect verified users away from login immediately
  await redirectIfAuthenticated();

  // Mount the Lit component into the page container
  const container = document.querySelector<HTMLElement>('#auth-root');
  if (!container) return;

  // Replace static HTML with the dynamic Lit component
  container.innerHTML = '';
  const form = document.createElement('barcl-login-form');
  container.appendChild(form);
}

boot().catch((err) => {
  console.error('[BARCL] Login boot failed:', err);
});
