import { isAuthenticated, logout, getWorkspaceId, getDashboardSummary, getTransacciones } from './api.js';
import { showToast } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    // Set User Name
    const userInfo = JSON.parse(localStorage.getItem('finanzas_user') || '{}');
    if (userInfo.nombre) {
        document.getElementById('user-name-display').textContent = `Hola, ${userInfo.nombre}`;
        document.querySelector('.avatar').textContent = userInfo.nombre.charAt(0).toUpperCase();
    }

    // Menu mobile toggle
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            logout();
            window.location.href = 'login.html';
        });
    }

    // Load data
    loadDashboardData();
});

async function loadDashboardData() {
    try {
        const workspaceId = getWorkspaceId();
        if (!workspaceId) {
            showToast('No tienes un workspace configurado. Se requiere iniciar sesión de nuevo.', 'error');
            return;
        }

        const date = new Date();
        const anio = date.getFullYear();
        const mes = date.getMonth() + 1; // getMonth() es 0-indexado

        // Peticiones asíncronas simultáneas
        const [summary, transacciones] = await Promise.all([
            getDashboardSummary(workspaceId, anio, mes),
            getTransacciones(workspaceId)
        ]);

        // Evitar undefined si total no viene o es 0
        const saldo = summary.balanceNeto || 0;
        const ing = summary.totalIngresos || 0;
        const gast = summary.totalGastos || 0;

        document.getElementById('saldo-total').textContent = `$ ${saldo.toFixed(2)}`;
        document.getElementById('ingresos-total').textContent = `$ ${ing.toFixed(2)}`;
        document.getElementById('gastos-total').textContent = `$ ${gast.toFixed(2)}`;

        const transactionsArea = document.getElementById('recent-transactions-list');
        
        // Mostrar solo las transacciones hasta un límite (e.g. 5) y ordenarlas si es necesario
        // Asumiendo que vienen más recientes de último o de primero
        // Haremos un reverse simulado asumiendo que el ID mayor es más reciente
        let recent = [...transacciones].reverse().slice(0, 5);

        let html = '';
        if (recent.length === 0) {
            html = `<tr><td colspan="5" class="text-center" style="padding: 2rem;">No tienes transacciones registradas aún.</td></tr>`;
        } else {
            recent.forEach(t => {
                const rawTipo = (t.tipo || '').toLowerCase();
                const isIngreso = rawTipo === 'ingreso';
                html += `
                    <tr>
                      <td>${t.fecha}</td>
                      <td style="font-weight: 500;">${t.descripcion}</td>
                      <td><span class="badge category">${t.categoriaNombre || 'General'}</span></td>
                      <td style="color: ${isIngreso ? 'var(--success-color)' : 'var(--danger-color)'}; font-weight: 600;">
                          ${isIngreso ? '+' : '-'}$${t.monto.toFixed(2)}
                      </td>
                      <td><span class="badge ${rawTipo}">${rawTipo.charAt(0).toUpperCase() + rawTipo.slice(1)}</span></td>
                    </tr>
                `;
            });
        }

        if (transactionsArea) {
            transactionsArea.innerHTML = html;
        }

    } catch (error) {
        showToast(error.message, 'error');
    }
}
