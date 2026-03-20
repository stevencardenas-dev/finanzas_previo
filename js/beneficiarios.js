import { isAuthenticated, logout, getWorkspaceId, getBeneficiarios, createBeneficiario } from './api.js';
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

    const modal = document.getElementById('modal-beneficiario');
    const btnNuevo = document.getElementById('btn-nuevo-beneficiario');
    const btnClose = document.getElementById('close-modal');
    const formBeneficiario = document.getElementById('form-beneficiario');

    if (btnNuevo) btnNuevo.addEventListener('click', () => modal.classList.add('active'));
    if (btnClose) btnClose.addEventListener('click', () => modal.classList.remove('active'));
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });

    if (formBeneficiario) {
        formBeneficiario.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nombre = document.getElementById('ben-nombre').value;
            const btnSubmit = formBeneficiario.querySelector('button[type="submit"]');

            const workspaceId = getWorkspaceId();
            if(!workspaceId) {
                showToast('Se requiere sesión válida y Workspace Activo.', 'error'); return;
            }

            try {
                btnSubmit.disabled = true;
                btnSubmit.textContent = 'Guardando...';

                await createBeneficiario(workspaceId, nombre);
                showToast(`Beneficiario "${nombre}" creado con éxito`, 'success');
                
                modal.classList.remove('active');
                formBeneficiario.reset();
                
                await loadBeneficiarios();
            } catch (error) {
                showToast(error.message, 'error');
            } finally {
                btnSubmit.disabled = false;
                btnSubmit.textContent = 'Guardar Beneficiario';
            }
        });
    }

    loadBeneficiarios();
});

async function loadBeneficiarios() {
    const listArea = document.getElementById('beneficiarios-list');
    if (!listArea) return;
    
    listArea.innerHTML = '<tr><td colspan="3" class="text-center" style="padding: 2rem;">Cargando beneficiarios...</td></tr>';

    try {
        const workspaceId = getWorkspaceId();
        if(!workspaceId) throw new Error("No hay workspace en el registro de sesión");

        const beneficiarios = await getBeneficiarios(workspaceId);

        if (beneficiarios.length === 0) {
            listArea.innerHTML = '<tr><td colspan="3" class="text-center" style="padding: 2rem;">No tienes beneficiarios registrados.</td></tr>';
            return;
        }

        let html = '';
        beneficiarios.forEach(ben => {
            html += `
                <tr>
                    <td style="width: 60px;">
                        <span class="avatar" style="width: 38px; height: 38px; font-size: 0.9rem; margin: 0 auto;">
                            ${ben.nombre.charAt(0).toUpperCase()}
                        </span>
                    </td>
                    <td style="font-weight: 500; font-size: 1.05rem;">${ben.nombre}</td>
                    <td style="text-align: right;">
                        <span style="font-size: 0.875rem; color: var(--text-secondary); margin-right: 1rem;">ID ${ben.id}</span>
                    </td>
                </tr>
            `;
        });

        listArea.innerHTML = html;
        
    } catch (error) {
        showToast(error.message, 'error');
        listArea.innerHTML = `<tr><td colspan="3" class="text-center text-danger" style="padding: 2rem;">Error: ${error.message}</td></tr>`;
    }
}
