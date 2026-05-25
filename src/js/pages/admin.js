import { requireAdmin } from '../guards/role.guard.js';
import { FlashcardsRepository } from '../repositories/flashcards.repository.js';
import { AuthService } from '../services/auth.service.js';
import { Logger } from '../core/logger.js';
import { storage } from '../services/firebase.service.js';
import { ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js';

document.addEventListener('DOMContentLoaded', async () => {
    const adminWorkspace = document.getElementById('admin-workspace');
    const tableBody = document.getElementById('admin-table-body');
    const logoutBtn = document.getElementById('logout-btn');
    const addBtn = document.getElementById('add-new-btn');

    // Modal elements
    const modal = document.getElementById('flashcard-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const form = document.getElementById('flashcard-form');
    const submitBtn = document.getElementById('fc-submit-btn');

    let currentUser = null;

    try {
        currentUser = await requireAdmin();
        adminWorkspace.style.display = 'grid';
        loadTable();
    } catch (e) {
        Logger.error('Admin', 'Bootstrap failed', e);
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            AuthService.logout();
        });
    }

    // Modal logic
    if (addBtn && modal && closeModalBtn) {
        addBtn.addEventListener('click', () => {
            modal.style.display = 'flex';
            modal.classList.remove('hidden');
        });

        closeModalBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            form.reset();
        });
    }

    // Form Submit (Upload + Create)
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const specialty = document.getElementById('fc-specialty').value;
            const question = document.getElementById('fc-question').value;
            const answer = document.getElementById('fc-answer').value;
            const explanation = document.getElementById('fc-explanation').value;
            const imageInput = document.getElementById('fc-image');

            submitBtn.disabled = true;
            const originalText = submitBtn.innerText;
            submitBtn.innerText = 'Fazendo Upload...';

            try {
                let imageUrl = '';
                
                // Pipeline de Upload
                if (imageInput.files && imageInput.files[0]) {
                    const file = imageInput.files[0];
                    const safeName = `${Date.now()}_${file.name.replace(/[^a-z0-9.]/gi, '_')}`;
                    const storageRef = ref(storage, `flashcards/${safeName}`);
                    
                    const snapshot = await uploadBytes(storageRef, file);
                    imageUrl = await getDownloadURL(snapshot.ref);
                    Logger.info('Admin', `Upload complete: ${imageUrl}`);
                }

                submitBtn.innerText = 'Salvando no Banco...';

                // Pipeline de Criação
                await FlashcardsRepository.createCard({
                    specialty,
                    question,
                    answer,
                    explanation,
                    imageUrl,
                    tags: [specialty],
                    published: true // auto-publish for now
                }, currentUser.uid);

                // Success
                modal.style.display = 'none';
                form.reset();
                loadTable();
                
            } catch (error) {
                Logger.error('Admin', 'Failed to create flashcard', error);
                alert('Erro ao criar flashcard: ' + error.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerText = originalText;
            }
        });
    }

    async function loadTable() {
        try {
            const cards = await FlashcardsRepository.getAllAdmin();
            renderTable(cards);
        } catch (e) {
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: red;">Erro ao carregar dados</td></tr>';
        }
    }

    function renderTable(cards) {
        tableBody.innerHTML = '';
        
        if (cards.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Nenhum flashcard encontrado. Execute o npm run seed</td></tr>';
            return;
        }

        cards.forEach(card => {
            const tr = document.createElement('tr');
            
            if (card.deleted) {
                tr.style.opacity = '0.5';
                tr.style.textDecoration = 'line-through';
            }

            const statusColor = card.published ? 'var(--neon-green)' : 'var(--text-secondary)';
            const statusText = card.deleted ? 'Lixeira' : (card.published ? 'Publicado' : 'Draft');

            tr.innerHTML = `
                <td>${card.specialty || 'Geral'}</td>
                <td>
                    <strong style="color: white;">${card.question.substring(0, 40)}${card.question.length > 40 ? '...' : ''}</strong>
                    <br>
                    <small style="color: var(--text-secondary);">${card.id}</small>
                </td>
                <td><span style="color: ${statusColor};">${statusText}</span></td>
                <td>
                    <button class="btn btn-outline" style="padding: 5px 10px; font-size: 0.8rem;" data-action="edit" data-id="${card.id}">Editar</button>
                    ${!card.deleted ? `<button class="btn btn-outline" style="padding: 5px 10px; font-size: 0.8rem; color: #ff4444; border-color: #ff4444;" data-action="delete" data-id="${card.id}">Deletar</button>` : ''}
                </td>
            `;

            tableBody.appendChild(tr);
        });

        tableBody.addEventListener('click', async (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;

            const action = btn.getAttribute('data-action');
            const id = btn.getAttribute('data-id');

            // Previne múltiplas execuções se houver bubbling (removido event listener redundante e substituído pelo do tbody root)
            if (e.target.dataset.handled) return;
            e.target.dataset.handled = true;

            if (action === 'delete') {
                if (confirm(`Atenção: Tem certeza que deseja deletar o card ${id}? (Ele irá para a lixeira)`)) {
                    await FlashcardsRepository.softDelete(id);
                    loadTable();
                }
            } else if (action === 'edit') {
                alert(`Modo de Edição para o card ${id} (Em Breve)`);
            }
            
            setTimeout(() => e.target.dataset.handled = false, 100);
        });
    }
});
