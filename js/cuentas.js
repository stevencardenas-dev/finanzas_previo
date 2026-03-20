import { isAuthenticated, logout, getWorkspaceId, getCuentas, createCuenta } from './api.js';
import { showToast } from './ui.js';

document.addEventListener('DOMContentLoaded', async () => {
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

    // Modal logic
    const modal = document.getElementById('modal-cuenta');
    const btnNueva = document.getElementById('btn-nueva-cuenta');
    const btnClose = document.getElementById('close-modal');
    const formCuenta = document.getElementById('form-cuenta');

    if (btnNueva) btnNueva.addEventListener('click', () => modal.classList.add('active'));
    if (btnClose) btnClose.addEventListener('click', () => modal.classList.remove('active'));
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });

    if (formCuenta) {
        formCuenta.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nombre = document.getElementById('acc-nombre').value;
            const tipo = document.getElementById('acc-tipo').value;
            const moneda = document.getElementById('acc-moneda').value;
            const saldo = parseFloat(document.getElementById('acc-saldo').value);
            
            const btnSubmit = formCuenta.querySelector('button[type="submit"]');
            const workspaceId = getWorkspaceId();

            try {
                btnSubmit.disabled = true;
                btnSubmit.textContent = 'Creando...';

                await createCuenta(workspaceId, nombre, tipo, moneda, saldo);
                showToast(`Cuenta "${nombre}" creada con éxito`, 'success');
                
                modal.classList.remove('active');
                formCuenta.reset();
                await loadCuentas(workspaceId);
            } catch (error) {
                showToast(error.message, 'error');
            } finally {
                btnSubmit.disabled = false;
                btnSubmit.textContent = 'Crear Cuenta';
            }
        });
    }

    const workspaceId = getWorkspaceId();
    if (workspaceId) {
        loadCuentas(workspaceId);
    }
});

async function loadCuentas(workspaceId) {
    const listArea = document.getElementById('cuentas-list');
    if (!listArea) return;
    
    listArea.innerHTML = '<tr><td colspan="5" class="text-center" style="padding: 2rem;">Cargando fuentes de pago...</td></tr>';

    try {
        const cuentas = await getCuentas(workspaceId);

        if (cuentas.length === 0) {
            listArea.innerHTML = '<tr><td colspan="5" class="text-center" style="padding: 2rem;">No tienes fuentes de pago registradas.</td></tr>';
            return;
        }

        let html = '';
        cuentas.forEach(acc => {
            html += `
                <tr>
                    <td style="font-weight: 600;">
                       <i class="fas fa-wallet" style="margin-right: 0.75rem; color: var(--primary-color);"></i>
                       ${acc.nombre}
                    </td>
                    <td><span class="badge category">${acc.tipo}</span></td>
                    <td>${acc.moneda}</td>
                    <td style="font-family: monospace; font-size: 1.1rem; font-weight: 500;">
                        $${parseFloat(acc.saldoInicial || 0).toFixed(2)}
                    </td>
                    <td>
                        <button class="btn-icon" title="Eliminar" style="color: var(--danger-color); margin: 0 auto;">
                           <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        listArea.innerHTML = html;
        
    } catch (error) {
        showToast(error.message, 'error');
        listArea.innerHTML = `<tr><td colspan="5" class="text-center text-danger" style="padding: 2rem;">Error: ${error.message}</td></tr>`;
    }
}
