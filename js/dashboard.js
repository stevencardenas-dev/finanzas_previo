document.addEventListener('DOMContentLoaded', () => {
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
            alert('Cerrando sesión...');
            window.location.href = 'index.html';
        });
    }

    // Load mock data
    loadMockDashboardData();
});

function loadMockDashboardData() {
    // Estas funciones serán reemplazadas por llamadas a la API
    document.getElementById('saldo-total').textContent = '$ 1,250.00';
    document.getElementById('ingresos-total').textContent = '$ 3,200.00';
    document.getElementById('gastos-total').textContent = '$ 1,950.00';

    const transactionsArea = document.getElementById('recent-transactions-list');
    
    // Transacciones de prueba
    const mockTransacciones = [
        { fecha: '2023-11-20', descripcion: 'Nómina Quincenal', categoria: 'Trabajo', tipo: 'ingreso', monto: 1500 },
        { fecha: '2023-11-21', descripcion: 'Compra Supermercado', categoria: 'Alimentación', tipo: 'gasto', monto: 125 },
        { fecha: '2023-11-22', descripcion: 'Pago Internet', categoria: 'Servicios', tipo: 'gasto', monto: 45 },
        { fecha: '2023-11-23', descripcion: 'Cena con amigos', categoria: 'Ocio', tipo: 'gasto', monto: 80 }
    ];

    let html = '';
    mockTransacciones.forEach(t => {
        html += `
            <tr>
              <td>${t.fecha}</td>
              <td>${t.descripcion}</td>
              <td><span class="badge category">${t.categoria}</span></td>
              <td style="color: ${t.tipo === 'ingreso' ? 'var(--success-color)' : 'var(--danger-color)'}; font-weight: 500;">
                  ${t.tipo === 'ingreso' ? '+' : '-'}$${t.monto.toFixed(2)}
              </td>
              <td><span class="badge ${t.tipo}">${t.tipo}</span></td>
            </tr>
        `;
    });

    if (transactionsArea) {
        transactionsArea.innerHTML = html;
    }
}
