document.addEventListener('DOMContentLoaded', () => {
    // Menu mobile toggle
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    // Modal logic
    const modal = document.getElementById('modal-beneficiario');
    const btnNuevo = document.getElementById('btn-nuevo-beneficiario');
    const btnClose = document.getElementById('close-modal-ben');
    const formBeneficiario = document.getElementById('form-beneficiario');

    if (btnNuevo) {
        btnNuevo.addEventListener('click', () => {
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

    if (formBeneficiario) {
        formBeneficiario.addEventListener('submit', (e) => {
            e.preventDefault();
            const nombre = document.getElementById('ben-nombre').value;
            const desc = document.getElementById('ben-desc').value;

            console.log('Crear beneficiario:', { nombre, desc });
            alert(`Beneficiario "${nombre}" creado existosamente (Simulado)`);
            
            modal.classList.remove('active');
            formBeneficiario.reset();
            
            // Recargar datos (En el futuro, fetch GET de beneficiarios)
            loadMockBeneficiarios();
        });
    }

    // Cargar datos iniciales
    loadMockBeneficiarios();
});

function loadMockBeneficiarios() {
    const list = document.getElementById('beneficiarios-list');
    if (!list) return;

    // Datos de prueba
    const beneficiarios = [
        { id: 1, nombre: 'Supermercado Central', descripcion: 'Compras semanales de despensa' },
        { id: 2, nombre: 'Empresa SA', descripcion: 'Empleador principal' },
        { id: 3, nombre: 'Proveedor Internet', descripcion: 'Pago de servicio Wi-Fi' }
    ];

    let html = '';
    beneficiarios.forEach(b => {
        html += `
            <tr>
              <td>
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  <div class="avatar" style="width: 32px; height: 32px; font-size: 0.875rem;">${b.nombre.charAt(0).toUpperCase()}</div>
                  <strong style="color: var(--text-primary); font-weight: 500;">${b.nombre}</strong>
                </div>
              </td>
              <td>${b.descripcion || '-'}</td>
              <td style="display: flex; gap: 0.5rem; border-bottom: none;">
                  <button class="btn-icon" title="Editar" style="width: 32px; height: 32px; font-size: 0.875rem;"><i class="fas fa-edit"></i></button>
                  <button class="btn-icon" title="Eliminar" style="width: 32px; height: 32px; font-size: 0.875rem; color: var(--danger-color);"><i class="fas fa-trash"></i></button>
              </td>
            </tr>
        `;
    });

    list.innerHTML = html;
}
