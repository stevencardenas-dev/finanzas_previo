import { isAuthenticated, logout, getWorkspaceId } from './auth.js';
import { getCreditCards, createCreditCard } from './api.js';
import { showToast } from './ui.js';

if (!isAuthenticated()) {
    window.location.href = 'index.html';
}

const workspaceId = getWorkspaceId();
const cardList = document.getElementById('card-list');
const cardModal = document.getElementById('card-modal');
const addCardBtn = document.getElementById('add-card-btn');
const closeBtn = document.getElementById('close-modal');
const cardForm = document.getElementById('card-form');
const logoutBtn = document.getElementById('logout-btn');

document.addEventListener('DOMContentLoaded', async () => {
    await loadCards(workspaceId);

    if (addCardBtn) addCardBtn.addEventListener('click', () => cardModal.classList.add('active'));
    if (closeBtn) closeBtn.addEventListener('click', () => cardModal.classList.remove('active'));
    
    window.addEventListener('click', (e) => {
        if (e.target === cardModal) cardModal.classList.remove('active');
    });

    if (cardForm) {
        cardForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nombre = document.getElementById('card-name').value;
            const moneda = document.getElementById('card-currency').value;
            const cupo = parseFloat(document.getElementById('card-cupo').value);
            const diaCorte = parseInt(document.getElementById('card-dia-corte').value);
            const diaPago = parseInt(document.getElementById('card-dia-pago').value);
            
            const btnSubmit = cardForm.querySelector('button[type="submit"]');

            try {
                btnSubmit.disabled = true;
                btnSubmit.textContent = 'Guardando...';

                await createCreditCard({
                    workspaceId: parseInt(workspaceId),
                    nombre,
                    moneda,
                    cupo,
                    diaCorte,
                    diaPago
                });

                showToast('Tarjeta creada con éxito', 'success');
                cardModal.classList.remove('active');
                cardForm.reset();
                await loadCards(workspaceId);
            } catch (error) {
                showToast(error.message, 'error');
            } finally {
                btnSubmit.disabled = false;
                btnSubmit.textContent = 'Guardar Tarjeta';
            }
        });
    }

    if (logoutBtn) logoutBtn.addEventListener('click', logout);
});

async function loadCards(workspaceId) {
    try {
        const cards = await getCreditCards(workspaceId);
        cardList.innerHTML = '';

        if (cards.length === 0) {
            cardList.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:2rem;">No hay tarjetas registradas</td></tr>';
            return;
        }

        cards.forEach(card => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div style="display:flex; align-items:center; gap:0.75rem;">
                        <i class="fas fa-credit-card" style="color: var(--primary-color);"></i>
                        ${card.nombre}
                    </div>
                </td>
                <td>${card.moneda}</td>
                <td><span style="font-weight:600;">$${new Intl.NumberFormat().format(card.cupo)}</span></td>
                <td>${card.diaCorte} / ${card.diaPago}</td>
                <td><span class="badge ${card.activa ? 'active' : 'inactive'}">${card.activa ? 'Activa' : 'Inactiva'}</span></td>
                <td>
                    <div style="display:flex; gap:0.5rem;">
                        <button class="btn-icon btn-small" title="Ver consumos"><i class="fas fa-eye"></i></button>
                    </div>
                </td>
            `;
            cardList.appendChild(row);
        });
    } catch (error) {
        showToast('Error al cargar tarjetas: ' + error.message, 'error');
    }
}
