/**
 * <barcl-user-list>
 *
 * Admin table of all users. Uses purely reactive state.
 */

import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { StoreController } from '@/shared/utils/lit-helpers';
import { useAdminStore } from '../store';
import { fetchUsers, toggleUserRole } from '../admin.actions';
import { selectUsersList, selectHasPendingOperation } from '../selectors';
import { sanitizeHtml } from '@/shared/utils/sanitizer';
import type { UserProfile } from '@shared/contracts';

@customElement('barcl-user-list')
export class BarclUserList extends LitElement {
  override createRenderRoot() { return this; }

  private _admin = new StoreController(this, useAdminStore);

  override render() {
    const state = this._admin.value;
    const users = selectUsersList(state);
    const { usersStatus, usersError } = state;

    if (usersStatus === 'idle' || usersStatus === 'loading') {
      return html`
        <div style="text-align: center; padding: 60px; color: var(--text-secondary);">
          <span class="spinner" style="border-color: var(--primary); border-right-color: transparent;"></span>
          <div style="margin-top: 16px; font-family: 'Space Grotesk', sans-serif;">Carregando usuários...</div>
        </div>
      `;
    }

    if (usersStatus === 'error' && users.length === 0) {
      return html`
        <div style="text-align: center; padding: 60px; color: #ff5555; background: rgba(255,51,51,0.05); border: 1px solid rgba(255,51,51,0.2); border-radius: 8px;">
          <h3 style="margin: 0 0 8px 0;">Erro ao Carregar</h3>
          <p style="margin: 0; opacity: 0.8;">${sanitizeHtml(usersError || 'Unknown error')}</p>
          <button @click=${() => fetchUsers()} class="btn secondary" style="margin-top: 16px;">Tentar Novamente</button>
        </div>
      `;
    }

    return html`
      ${usersStatus === 'error' ? html`
        <div class="auth-error-banner" role="alert" style="margin-bottom: 16px;">${sanitizeHtml(usersError || '')}</div>
      ` : ''}

      <div style="overflow-x: auto; background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 8px;">
        <table style="width: 100%; border-collapse: collapse; font-family: 'Space Grotesk', sans-serif; font-size: 0.85rem;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border-color); text-align: left; background: rgba(255,255,255,0.03);">
              <th style="padding: 16px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px;">Nome</th>
              <th style="padding: 16px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px;">E-mail</th>
              <th style="padding: 16px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px;">Papel</th>
              <th style="padding: 16px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; text-align: right;">Ação</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(user => this._renderRow(user, state))}
          </tbody>
        </table>
      </div>

      ${users.length === 0 && usersStatus !== 'refreshing' ? html`
        <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
          Nenhum usuário encontrado no banco de dados.
        </div>
      ` : ''}
    `;
  }

  private _renderRow(user: UserProfile, state: any) {
    const isAdmin = user.role === 'admin';
    const isPending = selectHasPendingOperation(state, user.uid);

    return html`
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.03); transition: background 0.15s ease; ${isPending ? 'opacity: 0.6; pointer-events: none;' : ''}"
        @mouseenter=${(e: MouseEvent) => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)')}
        @mouseleave=${(e: MouseEvent) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
      >
        <td style="padding: 16px; color: var(--text-primary);">
          ${sanitizeHtml(user.displayName ?? '—')}
          ${isPending ? html`<span class="spinner" style="width: 12px; height: 12px; border-width: 2px; margin-left: 8px;"></span>` : ''}
        </td>
        <td style="padding: 16px; color: var(--text-secondary);">
          ${sanitizeHtml(user.email)}
        </td>
        <td style="padding: 16px;">
          <span style="
            display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;
            ${isAdmin
              ? 'background: rgba(0,242,254,0.1); color: var(--primary);'
              : 'background: rgba(255,255,255,0.05); color: var(--text-secondary);'}
          ">
            ${user.role}
          </span>
        </td>
        <td style="padding: 16px; text-align: right;">
          <button
            @click=${() => toggleUserRole(user)}
            style="
              padding: 6px 14px; border-radius: 6px; font-size: 0.75rem; cursor: pointer;
              font-family: 'Space Grotesk', sans-serif; font-weight: 600; transition: all 0.15s;
              ${isAdmin
                ? 'background: rgba(255,51,51,0.08); border: 1px solid #ff3333; color: #ff5555;'
                : 'background: rgba(0,242,254,0.08); border: 1px solid var(--primary); color: var(--primary);'}
            "
          >
            ${isAdmin ? 'Remover Admin' : 'Tornar Admin'}
          </button>
        </td>
      </tr>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'barcl-user-list': BarclUserList;
  }
}
