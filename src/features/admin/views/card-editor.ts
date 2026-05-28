/**
 * <barcl-card-editor>
 *
 * Modal form for creating and editing flashcards. Uses purely reactive UI state.
 */

import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { StoreController } from '@/shared/utils/lit-helpers';
import { useAdminStore, adminActions } from '../store';
import { saveFlashcard } from '../admin.actions';
import { CreateFlashcardSchema, UpdateFlashcardSchema } from '@shared/contracts';
import { sanitizeHtml } from '@/shared/utils/sanitizer';
import { auth } from '@/core/services/firebase';

@customElement('barcl-card-editor')
export class BarclCardEditor extends LitElement {
  override createRenderRoot() { return this; }

  private _admin = new StoreController(this, useAdminStore);

  override render() {
    const { editorOpen, editorMode, editingCardId, isSaving, editorError, flashcards } = this._admin.value;
    if (!editorOpen) return html``;

    const card = editingCardId ? flashcards.byId[editingCardId] : null;
    const isEdit = editorMode === 'edit';

    return html`
      <div style="
        position: fixed; inset: 0;
        background: rgba(0,0,0,0.75);
        backdrop-filter: blur(6px);
        z-index: 1000;
        display: flex; align-items: center; justify-content: center;
        padding: 20px;
      " @click=${this._handleBackdropClick}>
        <div class="pacs-panel" style="
          width: 100%; max-width: 640px;
          max-height: 90vh; overflow-y: auto;
          padding: 30px; border: 1px solid var(--border-color);
          border-radius: 6px; box-shadow: 0 0 40px rgba(0,242,254,0.15);
        " @click=${(e: Event) => e.stopPropagation()}>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
            <h2 style="font-family: 'Space Grotesk', sans-serif; font-size: 1.1rem; text-transform: uppercase; letter-spacing: 1px; margin: 0;">
              ${isEdit ? 'Editar Flashcard' : 'Novo Flashcard'}
            </h2>
            <button @click=${adminActions.closeEditor} style="background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 1.5rem; line-height: 1;">×</button>
          </div>

          ${editorError ? html`
            <div class="auth-error-banner" style="margin-bottom: 20px;" role="alert">${sanitizeHtml(editorError)}</div>
          ` : ''}

          <form id="card-editor-form" @submit=${this._handleSubmit}>
            ${this._field('Pergunta *', 'fc-question', 'textarea', card?.question ?? '', true)}
            ${this._field('Resposta *', 'fc-answer', 'textarea', card?.answer ?? '', true)}
            ${this._field('Explicação', 'fc-explanation', 'textarea', card?.explanation ?? '', false)}

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              ${this._field('Especialidade *', 'fc-specialty', 'text', card?.specialty ?? 'neumologia', true)}
              ${this._field('Categoria *', 'fc-category', 'text', card?.category ?? '', true)}
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
              ${this._field('Subcategoria', 'fc-subcategory', 'text', card?.subcategory ?? '', false)}
              
              <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 6px; color: var(--text-secondary); font-size: 0.8rem; text-transform: uppercase;">Dificuldade</label>
                <select id="fc-difficulty" style="width: 100%; padding: 10px; background: rgba(0,0,0,0.5); border: 1px solid var(--border-color); color: white; border-radius: 4px; font-family: 'Plus Jakarta Sans', sans-serif;">
                  ${(['easy', 'medium', 'hard'] as const).map(d => html`<option value="${d}" ?selected=${card?.difficulty === d}>${d}</option>`)}
                </select>
              </div>

              ${this._field('URL da Imagem', 'fc-imageUrl', 'text', card?.imageUrl ?? '', false)}
            </div>

            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px; padding: 12px; border: 1px solid var(--border-color); border-radius: 4px;">
              <input type="checkbox" id="fc-isPublished" ?checked=${card?.isPublished === true} style="width: 16px; height: 16px; cursor: pointer; accent-color: var(--primary);">
              <label for="fc-isPublished" style="cursor: pointer; font-size: 0.9rem;">Publicado (visível para estudantes)</label>
            </div>

            <div style="display: flex; gap: 12px; justify-content: flex-end;">
              <button type="button" @click=${adminActions.closeEditor} style="padding: 10px 20px; background: rgba(255,255,255,0.05); border: 1px solid var(--border-color); color: var(--text-secondary); border-radius: 4px; cursor: pointer;">Cancelar</button>
              <button type="submit" class="btn btn-primary" ?disabled=${isSaving} style="padding: 10px 24px;">
                ${isSaving ? html`<span class="spinner"></span>Salvando...` : (isEdit ? 'Salvar Alterações' : 'Criar Flashcard')}
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  private _field(label: string, id: string, type: 'text' | 'textarea', value: string, required: boolean) {
    const inputStyle = `width: 100%; padding: 10px; background: rgba(0,0,0,0.5); border: 1px solid var(--border-color); color: white; border-radius: 4px; box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.9rem;`;
    return html`
      <div style="margin-bottom: 16px;">
        <label for="${id}" style="display: block; margin-bottom: 6px; color: var(--text-secondary); font-size: 0.8rem; text-transform: uppercase;">${label}</label>
        ${type === 'textarea' 
          ? html`<textarea id="${id}" ?required=${required} rows="3" style="${inputStyle} resize: vertical;" .value=${value}></textarea>` 
          : html`<input type="${type}" id="${id}" ?required=${required} style="${inputStyle}" .value=${value}>`}
      </div>
    `;
  }

  private async _handleSubmit(e: Event) {
    e.preventDefault();
    const { editorMode, editingCardId } = this._admin.value;
    const dto = this._readForm();

    if (editorMode === 'create') {
      const parsed = CreateFlashcardSchema.safeParse({ ...dto, authorId: auth.currentUser?.uid ?? 'unknown' });
      if (!parsed.success) return adminActions.setEditorError('Dados inválidos: ' + JSON.stringify(parsed.error.flatten().fieldErrors));
      await saveFlashcard(null, parsed.data as unknown as Partial<import('@shared/contracts').Flashcard>);
    } else {
      const parsed = UpdateFlashcardSchema.safeParse(dto);
      if (!parsed.success) return adminActions.setEditorError('Dados inválidos: ' + JSON.stringify(parsed.error.flatten().fieldErrors));
      await saveFlashcard(editingCardId, parsed.data as unknown as Partial<import('@shared/contracts').Flashcard>);
    }
  }

  private _readForm(): Record<string, unknown> {
    const get = (id: string) => this.querySelector<HTMLInputElement | HTMLTextAreaElement>(`#${id}`)?.value.trim() ?? '';
    return {
      question: get('fc-question'),
      answer: get('fc-answer'),
      explanation: get('fc-explanation'),
      specialty: get('fc-specialty') || 'neumologia',
      category: get('fc-category'),
      subcategory: get('fc-subcategory'),
      difficulty: this.querySelector<HTMLSelectElement>('#fc-difficulty')?.value ?? 'medium',
      imageUrl: get('fc-imageUrl') || null,
      isPublished: this.querySelector<HTMLInputElement>('#fc-isPublished')?.checked ?? false,
      tags: [],
    };
  }

  private _handleBackdropClick() {
    if (!this._admin.value.isSaving) adminActions.closeEditor();
  }
}
