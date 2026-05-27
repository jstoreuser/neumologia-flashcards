/**
 * <barcl-user-list>
 *
 * Admin table of all users. Allows promoting/demoting admin role.
 * Role changes go through the Cloud Function via admin.service.
 */

import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { StoreController } from '@/shared/utils/lit-helpers';
import { useAdminStore, adminActions } from '../store';
import { adminSetRole } from '../admin.service';
import { sanitizeHtml } from '@/shared/utils/sanitizer';
import type { UserProfile } from '@shared/contracts';

@customElement('barcl-user-list')
export class BarclUserList extends LitElement {
  override createRenderRoot() { return this; }

  private _admin = new StoreController(this, useAdminStore);

  override render() {
    const { users, isLoadingUsers, error } = this._admin.value;

    if (isLoadingUsers) {
      return html`<div style="text-align: center; padding: 40px;"><div class="loader"></div></div>`;
    }

    if (error) {
      return html`
        <div class="auth-error-banner" role="alert">${sanitizeHtml(error)}</div>
      `;
    }

    if (users.length === 0) {
      return html`
        <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
          Nenhum usuário encontrado.
        </div>
      `;
    }

    return html`
      <div style="overflow-x: auto;">
        <table style="
          width: 100%; border-collapse: collapse;
          font-family: 'Space Grotesk', sans-serif; font-size: 0.85rem;
        ">
          <thead>
            <tr style="border-bottom: 2px solid var(--border-color); text-align: left;">
              <th style="padding: 10px 14px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Nome</th>
              <th style="padding: 10px 14px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">E-mail</th>
              <th style="padding: 10px 14px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Papel</th>
              <th style="padding: 10px 14px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Ação</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(user => this._renderRow(user))}
          </tbody>
        </table>
      </div>
    `;
  }

  private _renderRow(user: UserProfile) {
    const isAdmin = user.role === 'admin';
    return html`
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.15s ease;"
        @mouseenter=${(e: MouseEvent) => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)')}
        @mouseleave=${(e: MouseEvent) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
      >
        <td style="padding: 12px 14px; color: var(--text-primary);">
          ${sanitizeHtml(user.displayName ?? '—')}
        </td>
        <td style="padding: 12px 14px; color: var(--text-secondary);">
          ${sanitizeHtml(user.email)}
        </td>
        <td style="padding: 12px 14px;">
          <span style="
            display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase;
            ${isAdmin
              ? 'background: rgba(0,242,254,0.1); border: 1px solid var(--primary); color: var(--primary);'
              : 'background: rgba(255,255,255,0.05); border: 1px solid var(--border-color); color: var(--text-secondary);'}
          ">
            ${user.role}
          </span>
        </td>
        <td style="padding: 12px 14px;">
          <button
            id="toggle-role-${user.uid}"
            @click=${() => this._handleToggleRole(user)}
            style="
              padding: 6px 14px; border-radius: 4px; font-size: 0.8rem; cursor: pointer;
              font-family: 'Space Grotesk', sans-serif; font-weight: 600; transition: all 0.15s;
              ${isAdmin
                ? 'background: rgba(255,51,51,0.1); border: 1px solid #ff3333; color: #ff5555;'
                : 'background: rgba(0,242,254,0.08); border: 1px solid var(--primary); color: var(--primary);'}
            "
          >
            ${isAdmin ? 'Remover Admin' : 'Tornar Admin'}
          </button>
        </td>
      </tr>
    `;
  }

  private async _handleToggleRole(user: UserProfile) {
    const newIsAdmin = user.role !== 'admin';
    const action = newIsAdmin ? 'admin' : 'estudante';

    if (!confirm(`Alterar papel de ${user.displayName ?? user.email} para ${action}?`)) return;

    try {
      await adminSetRole(user.uid, newIsAdmin);
      // Refresh user list after role change
      const updated = this._admin.value.users.map(u =>
        u.uid === user.uid ? { ...u, role: (newIsAdmin ? 'admin' : 'student') as UserProfile['role'] } : u
      );
      adminActions.setUsers(updated);
    } catch (err) {
      adminActions.setError(err instanceof Error ? sanitizeHtml(err.message) : 'Falha ao alterar papel');
    }
  }

  static override styles = css``;
}

declare global {
  interface HTMLElementTagNameMap {
    'barcl-user-list': BarclUserList;
  }
}
