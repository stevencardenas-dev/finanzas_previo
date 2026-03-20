document.addEventListener('DOMContentLoaded', () => {
    // Menu mobile toggle
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    // Establecer fecha actual por defecto en el modal
    const inputFecha = document.getElementById('trans-fecha');
    if (inputFecha) {
        inputFecha.valueAsDate = new Date();
    }

    // Modal logic
    const modal = document.getElementById('modal-transaccion');
    const btnNueva = document.getElementById('btn-nueva-transaccion');
    const btnClose = document.getElementById('close-modal-trans');
    const formTransaccion = document.getElementById('form-transaccion');

    if (btnNueva) {
        btnNueva.addEventListener('click', () => {
            modal.classList.add('active');
        });
    }

    if (btnClose) {
        btnClose.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    // Close modal gently when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    if (formTransaccion) {
        formTransaccion.addEventListener('submit', (e) => {
            e.preventDefault();
            const tipo = document.getElementById('trans-tipo').value;
            const fecha = document.getElementById('trans-fecha').value;
            const monto = document.getElementById('trans-monto').value;
            const desc = document.getElementById('trans-desc').value;
            const categoriaId = document.getElementById('trans-categoria').value;
            const beneficiarioId = document.getElementById('trans-beneficiario').value;

            console.log('Crear Transacción:', { tipo, fecha, monto, desc, categoriaId, beneficiarioId });
            alert(`Transacción guardada existosamente (Simulado)`);
            
            modal.classList.remove('active');
            formTransaccion.reset();
            inputFecha.valueAsDate = new Date();
            
            loadMockTransacciones();
        });
    }

    // Load initial data
    loadMockTransacciones();
});

function loadMockTransacciones() {
    const list = document.getElementById('transacciones-list');
    if (!list) return;

    // Datos de prueba (Reemplazables con fetch)
    const mockTransacciones = [
        { id: 1, fecha: '2023-11-20', descripcion: 'Nómina Quincenal', categoria: 'Trabajo', beneficiario: 'Empresa SA', tipo: 'ingreso', monto: 1500 },
        { id: 2, fecha: '2023-11-21', descripcion: 'Compra Supermercado', categoria: 'Alimentación', beneficiario: 'Supermercado Central', tipo: 'gasto', monto: 125 },
        { id: 3, fecha: '2023-11-22', descripcion: 'Pago Internet', categoria: 'Servicios', beneficiario: 'Proveedor Internet', tipo: 'gasto', monto: 45 },
        { id: 4, fecha: '2023-11-23', descripcion: 'Cena con amigos', categoria: 'Ocio', beneficiario: 'Restaurante X', tipo: 'gasto', monto: 80 }
    ];

    let html = '';
    mockTransacciones.forEach(t => {
        html += `
            <tr>
              <td>${t.fecha}</td>
              <td style="font-weight: 500;">${t.descripcion}</td>
              <td><span class="badge category">${t.categoria}</span></td>
              <td>${t.beneficiario}</td>
              <td style="color: ${t.tipo === 'ingreso' ? 'var(--success-color)' : 'var(--danger-color)'}; font-weight: 600;">
                  ${t.tipo === 'ingreso' ? '+' : '-'}$${t.monto.toFixed(2)}
              </td>
              <td><span class="badge ${t.tipo}">${t.tipo.charAt(0).toUpperCase() + t.tipo.slice(1)}</span></td>
              <td style="display: flex; gap: 0.5rem; border-bottom: none;">
                  <button class="btn-icon" title="Editar" style="width: 32px; height: 32px; font-size: 0.875rem;"><i class="fas fa-edit"></i></button>
                  <button class="btn-icon" title="Eliminar" style="width: 32px; height: 32px; font-size: 0.875rem; color: var(--danger-color);"><i class="fas fa-trash"></i></button>
              </td>
            </tr>
        `;
    });

    list.innerHTML = html;
}
