import { isAuthenticated, logout, getWorkspaceId, getCategorias, createCategoria } from './api.js';
import { showToast } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    const userInfo = JSON.parse(localStorage.getItem('finanzas_user') || '{}');
    if (userInfo.nombre) {
        document.getElementById('user-name-display').textContent = `Hola, ${userInfo.nombre}`;
        document.querySelector('.avatar').textContent = userInfo.nombre.charAt(0).toUpperCase();
    }

    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => { sidebar.classList.toggle('open'); });
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => { logout(); window.location.href = 'login.html'; });
    }

    const modal = document.getElementById('modal-categoria');
    const btnNueva = document.getElementById('btn-nueva-categoria');
    const btnClose = document.getElementById('close-modal');
    const formCategoria = document.getElementById('form-categoria');

    if (btnNueva) btnNueva.addEventListener('click', () => modal.classList.add('active'));
    if (btnClose) btnClose.addEventListener('click', () => modal.classList.remove('active'));
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });

    if (formCategoria) {
        formCategoria.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nombre = document.getElementById('cat-nombre').value;
            const tipo = document.getElementById('cat-tipo').value;
            const btnSubmit = formCategoria.querySelector('button[type="submit"]');

            const workspaceId = getWorkspaceId();
            if(!workspaceId) {
                showToast('Sesión inválida. Faltan datos del workspace.', 'error'); return;
            }

            try {
                btnSubmit.disabled = true;
                btnSubmit.textContent = 'Guardando...';

                await createCategoria(workspaceId, nombre, tipo.toUpperCase());
                showToast(`Categoría "${nombre}" creada existosamente`, 'success');
                
                modal.classList.remove('active');
                formCategoria.reset();
                
                await loadCategorias(); 
            } catch (error) {
                showToast(error.message, 'error');
            } finally {
                btnSubmit.disabled = false;
                btnSubmit.textContent = 'Guardar Categoría';
            }
        });
    }

    loadCategorias();
});

async function loadCategorias() {
    const categoriasGrid = document.getElementById('categorias-grid');
    if (!categoriasGrid) return;
    
    categoriasGrid.innerHTML = '<p class="text-center" style="grid-column: 1/-1;">Cargando categorías...</p>';

    try {
        const workspaceId = getWorkspaceId();
        if(!workspaceId) throw new Error("Acceso denegado. No Workspace ID");

        const categorias = await getCategorias(workspaceId);

        if (categorias.length === 0) {
            categoriasGrid.innerHTML = '<p class="text-center" style="grid-column: 1/-1; padding: 2rem;">No tienes categorías creadas en tu espacio de trabajo.</p>';
            return;
        }

        let html = '';
        categorias.forEach(cat => {
            const rawTipo = (cat.tipo || '').toLowerCase();
            const typeClass = rawTipo === 'ingreso' ? 'income' : 'expense';
            const icon = rawTipo === 'ingreso' ? 'fa-arrow-up' : 'fa-arrow-down';
            
            html += `
                <div class="card" style="display: flex; align-items: center; gap: 1rem; padding: 1.5rem; margin-bottom: 0;">
                    <div class="stat-icon ${typeClass}" style="width: 48px; height: 48px; font-size: 1.25rem;">
                        <i class="fas ${icon}"></i>
                    </div>
                    <div style="flex-grow: 1;">
                        <h4 style="margin: 0 0 0.25rem 0;">${cat.nombre}</h4>
                        <span class="badge ${rawTipo}">${rawTipo.charAt(0).toUpperCase() + rawTipo.slice(1)}</span>
                    </div>
                    <div style="display: flex; gap: 0.5rem; justify-content: flex-end; align-items: center;">
                        <span style="font-size: 0.8rem; color: var(--text-secondary); width: 40px; text-align: center;">ID ${cat.id}</span>
                    </div>
                </div>
            `;
        });

        categoriasGrid.innerHTML = html;
        
    } catch (error) {
        showToast(error.message, 'error');
        categoriasGrid.innerHTML = `<p class="text-center text-danger" style="grid-column: 1/-1;">Error cargando datos: ${error.message}</p>`;
    }
}
