import { isAuthenticated, logout, getWorkspaceId, getCreditCards, createCreditCard, deleteCreditCard } from './api.js';
import { showToast } from './ui.js';

if (!isAuthenticated()) {
    window.location.href = 'index.html';
}

const workspaceId = getWorkspaceId();

// Card gradient themes - cycles through based on index
const CARD_THEMES = ['card-theme-1', 'card-theme-2', 'card-theme-3', 'card-theme-4', 'card-theme-5'];

document.addEventListener('DOMContentLoaded', async () => {
    // User info
    const userInfo = JSON.parse(localStorage.getItem('finanzas_user') || '{}');
    if (userInfo.nombre) {
        const usernameDisp = document.getElementById('user-name-display');
        const avatarDisp = document.querySelector('.avatar');
        if (usernameDisp) usernameDisp.textContent = `Hola, ${userInfo.nombre}`;
        if (avatarDisp) avatarDisp.textContent = userInfo.nombre.charAt(0).toUpperCase();
    }

    // Mobile sidebar toggle
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
    }

    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', () => { logout(); window.location.href = 'index.html'; });

    // Modal
    const modal = document.getElementById('modal-tarjeta');
    const btnNueva = document.getElementById('btn-nueva-tarjeta');
    const closeBtn = document.getElementById('close-modal');
    const form = document.getElementById('form-tarjeta');

    if (btnNueva) btnNueva.addEventListener('click', () => modal.classList.add('active'));
    if (closeBtn) closeBtn.addEventListener('click', () => { modal.classList.remove('active'); form.reset(); });
    window.addEventListener('click', (e) => {
        if (e.target === modal) { modal.classList.remove('active'); form.reset(); }
    });

    // Form submit
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nombre = document.getElementById('card-nombre').value.trim();
            const moneda = document.getElementById('card-moneda').value;
            const cupo = parseFloat(document.getElementById('card-cupo').value);
            const diaCorte = parseInt(document.getElementById('card-dia-corte').value);
            const diaPago = parseInt(document.getElementById('card-dia-pago').value);
            const btnSubmit = form.querySelector('button[type="submit"]');

            if (!nombre || isNaN(cupo) || cupo <= 0) {
                showToast('Por favor completa todos los campos correctamente.', 'error');
                return;
            }

            try {
                btnSubmit.disabled = true;
                btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

                await createCreditCard({
                    workspaceId: parseInt(workspaceId),
                    nombre,
                    moneda,
                    cupo,
                    diaCorte,
                    diaPago
                });

                showToast(`Tarjeta "${nombre}" creada con éxito`, 'success');
                modal.classList.remove('active');
                form.reset();
                await loadCards();
            } catch (error) {
                showToast('Error: ' + error.message, 'error');
            } finally {
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = '<i class="fas fa-plus"></i> Guardar Tarjeta';
            }
        });
    }

    await loadCards();
});

async function loadCards() {
    const grid = document.getElementById('cards-grid');
    if (!grid) return;

    grid.innerHTML = '<div class="cards-empty-state"><i class="fas fa-spinner fa-spin"></i><h3>Cargando tarjetas...</h3></div>';

    try {
        const cards = await getCreditCards(workspaceId);

        // Update stats
        const statsRow = document.getElementById('stats-row');
        if (statsRow) {
            statsRow.style.display = cards.length > 0 ? 'grid' : 'none';
            document.getElementById('stat-total').textContent = cards.length;
            document.getElementById('stat-active').textContent = cards.filter(c => c.activa).length;
            const totalCupo = cards.reduce((sum, c) => sum + (c.cupo || 0), 0);
            document.getElementById('stat-cupo').textContent = '$' + new Intl.NumberFormat('es-CO').format(totalCupo);
        }

        if (cards.length === 0) {
            grid.innerHTML = `
                <div class="cards-empty-state">
                    <i class="fas fa-credit-card"></i>
                    <h3>No tienes tarjetas registradas</h3>
                    <p>Añade una tarjeta de crédito para usarla en tus transacciones</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = '';
        cards.forEach((card, index) => {
            const theme = CARD_THEMES[index % CARD_THEMES.length];
            const cupoFormatted = '$' + new Intl.NumberFormat('es-CO').format(card.cupo || 0);
            const cardEl = document.createElement('div');
            cardEl.className = `credit-card-item ${theme}`;
            cardEl.innerHTML = `
                <div class="card-header-row">
                    <div class="card-chip">
                        <svg width="22" height="18" viewBox="0 0 22 18">
                            <rect x="0" y="0" width="22" height="18" rx="2" fill="rgba(0,0,0,0.15)"/>
                            <rect x="0" y="6" width="22" height="6" fill="rgba(0,0,0,0.1)"/>
                            <rect x="6" y="0" width="10" height="18" fill="rgba(0,0,0,0.1)"/>
                        </svg>
                    </div>
                    <span class="card-brand">${card.moneda || 'COP'}</span>
                </div>
                <div class="card-body">
                    <div class="card-number-mock">•••• •••• •••• ••••</div>
                </div>
                <div class="card-footer-row">
                    <div>
                        <div class="card-info-label">Nombre</div>
                        <div class="card-info-value">${card.nombre}</div>
                    </div>
                    <div style="text-align: right;">
                        <div class="card-info-label">Cupo</div>
                        <div class="card-info-value">${cupoFormatted}</div>
                    </div>
                    <div style="text-align: right;">
                        <div class="card-info-label">Corte / Pago</div>
                        <div class="card-info-value">Día ${card.diaCorte} / ${card.diaPago}</div>
                    </div>
                </div>
                <div class="card-actions-row">
                    <button class="btn-icon" title="Ver detalles" data-id="${card.id}">
                        <i class="fas fa-eye"></i> Detalles
                    </button>
                    <button class="btn-icon btn-danger delete-btn" data-id="${card.id}" data-nombre="${card.nombre}">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            `;
            grid.appendChild(cardEl);
        });

        // Bind delete buttons
        grid.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                const nombre = btn.dataset.nombre;
                if (!confirm(`¿Eliminar la tarjeta "${nombre}"? Esta acción no se puede deshacer.`)) return;

                btn.disabled = true;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

                try {
                    await deleteCreditCard(id);
                    showToast(`Tarjeta "${nombre}" eliminada.`, 'success');
                    await loadCards();
                } catch (err) {
                    showToast('Error al eliminar: ' + err.message, 'error');
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fas fa-trash"></i> Eliminar';
                }
            });
        });

    } catch (error) {
        grid.innerHTML = `<div class="cards-empty-state"><i class="fas fa-exclamation-triangle" style="color: var(--danger-color);"></i><h3>Error al cargar tarjetas</h3><p>${error.message}</p></div>`;
        showToast('Error al cargar tarjetas: ' + error.message, 'error');
    }
}
